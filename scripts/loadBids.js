#!/usr/bin/env babel-node

import minimist from "minimist";
import { eth, env, Log } from "decentraland-commons";
import db from "../src/lib/db";
import { BuyTransaction, DistrictEntry, LockedBalanceEvent, ParcelState, ReturnTransaction } from "../src/lib/models";

const log = new Log("[LoadBids]");

env.load();

//The maximum is inclusive and the minimum is inclusive
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Load test parcels
const initTestParcels = async () => {
  const configs = [
    {
      address: "0x1",
      count: 50
    },
    {
      address: "0x2",
      count: 10
    }
  ];

  try {
    await ParcelState.db.query("DELETE FROM parcel_states");

    let j = 0;
    for (const config of configs) {
      for (let i = 0; i < config.count; i++) {
        await ParcelState.insert({
          x: j * 1000 + i,
          y: j * 1000 + i,
          amount: String(getRandomInt(1000, 10000)),
          address: config.address,
          endsAt: new Date(),
          bidGroupId: 1,
          bidIndex: 0,
          projectId: null
        });
      }
      j++;
    }
  } catch (err) {
    log.error(err);
  }
};

// tx queue management

class TxQueue {
  constructor() {
    this.queue = [];
  }

  addPendingTx(txId) {
    log.info(`(queue) Add pending tx : ${txId}`);
    this.queue.push(txId);
  }

  delPendingTx(txId) {
    log.info(`(queue) Del pending tx : ${txId}`);
    this.queue.splice(this.queue.indexOf(txId), 1);
  }

  isPendingTx(txId) {
    return this.queue.indexOf(txId) > -1;
  }

  get length() {
    return this.queue.length;
  }
}

const txQueue = new TxQueue();

// event handling

const printState = () => {
  log.info(`(state) Pending transactions: ${txQueue.length}`);
};

const onNewBlock = blockHash => {
  log.info(`(block) Found new block ${blockHash}`);
  printState();

  eth.web3.eth.getBlock(blockHash, (err, block) => {
    if (err || !block) {
      log.error(err);
      return;
    }

    block.transactions.forEach(async txId => {
      try {
        if (txQueue.isPendingTx(txId)) {
          txQueue.delPendingTx(txId);

          const receipt = await eth.fetchTxReceipt(txId);
          await BuyTransaction.update(
            { receipt, status: receipt.status == 1 ? "completed" : "error" },
            { txId }
          );
          log.info(`(tx) Saved receipt for tx : ${txId}`);
        }
      } catch (err) {
        log.error(err);
      }
    });
  });
};

const setupBlockWatch = options => {
  log.info(`(watch) Setting up event filter for new blocks`)
  const filter = eth.setupFilter(options);

  filter.watch((err, blockHash) => {
    if (err) {
      log.error(err);
      return;
    }

    onNewBlock(blockHash);
  });

  return filter;
};

const buildBuyTxData = (address, parcels) => {
  const X = parcels.map(parcel => parcel.x);
  const Y = parcels.map(parcel => parcel.y);
  // This should be stored as WEI in the database
  const totalCost = parcels
    .map(parcel => eth.utils.toBigNumber(parcel.amount))
    .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0));

  log.info(
    `(proc) [${address}] ${parcels.length} bids found = total cost: ${totalCost}`
  );
  log.info(`(proc) [${address}] X- > ${JSON.stringify(X)}`);
  log.info(`(proc) [${address}] Y -> ${JSON.stringify(Y)}`);

  return { address, X, Y, totalCost };
};

const loadParcelsForAddress = async (contract, address, batchSize) => {
  if (!address) {
    log.error(`(proc) [${address}] Empty or invalid address`);
    return;
  }

  log.info(`(proc) [${address}] Processing bids for address...`);

  try {
    // get parcels for address
    const parcels = await ParcelState.findParcelsByAddress(address);

    // get already done parcels for address
    const doneParcels = await BuyTransaction.findProcessedParcels(address);

    // select parcels to send
    const sendParcels = parcels.filter(e => !doneParcels.includes(e.id)).splice(0, batchSize);

    log.info(
      `(proc) [${address}] Progress => ${doneParcels.length} out of ${parcels.length} = selected ${sendParcels.length}`
    );

    if (sendParcels.length > 0) {
      // build TX data
      const txData = await buildBuyTxData(address, sendParcels);

      // broadcast transaction
      const txId = await contract.buyMany(
        txData.address,
        txData.X,
        txData.Y,
        txData.totalCost
      );
      txQueue.addPendingTx(txId);
      log.info(`(proc) [${address}] Broadcasted tx : ${txId}`);

      // save transaction
      const parcelStatesIds = sendParcels.map(parcel => parcel.id);
      await BuyTransaction.insert({
        txId,
        address,
        parcelStatesIds,
        totalCost: txData.totalCost.toString(10),
        status: "pending"
      });
      log.info(`(proc) [${address}] Saved tx : ${txId}`);
    }
  } catch (err) {
    log.info(err);
  }
};

const verifyPendingTxs = async () => {
  try {
    // setup watch for mined txs
    const pendingTxIds = await BuyTransaction.findAllPendingTxIds();
    log.info(`(tx) Total number of TXs to verify: ${pendingTxIds.length}`);

    for (const txId of pendingTxIds) {
      const receipt = await eth.fetchTxReceipt(txId);

      if (receipt === null) {
        log.info(`(tx) [${txId}] pending`);
      } else if (receipt.status === 0) {
        log.info(`(tx) [${txId}] error`);
        await BuyTransaction.update({ receipt, status: "error" }, { txId });
      } else if (receipt.status === 1) {
        log.info(`(tx) [${txId}] completed`);
        await BuyTransaction.update({ receipt, status: "completed" }, { txId });
      }
    }
  } catch (err) {
    log.error(err);
  }
};

const watchPendingTxs = time => {
  setInterval(verifyPendingTxs, time);
};

const loadAllParcels = async (contract, batchSize) => {
  try {
    // get all addresses with bids
    const rows = await ParcelState.findAllAddresses();
    log.info(`(proc) Got ${rows.length} addresses with winning bids`);

    for (const row of rows) {
      await loadParcelsForAddress(contract, row.address, batchSize);
    }
  } catch (err) {
    log.error(err);
  }
};

const ONE_LAND_IN_MANA = 1000;
const BEFORE_NOVEMBER_DISCOUNT = 1.15;
const AFTER_NOVEMBER_DISCOUNT = 1.10;

const calculateTotalForMonths = (monthlyLandBalances, monthlyLockedBalances, months) => {
  return months.reduce((total, index) => {
    return total + monthlyLockedBalances[index] - monthlyLandBalances[index];
  }, 0);
}

const getMonthlySubmissionMANA = (submissions) => {
  const months = new Array(12).fill(0);
  const monthlyLandBalance = months.reduce((obj, _, index) =>
    Object.assign(obj, { [index+1]: 0 })
  , {});

  submissions.forEach(submission => {
    const month = new Date(+submission.userTimestamp).getMonth() + 1;
    monthlyLandBalance[month] += submission.lands * ONE_LAND_IN_MANA;
  });

  return monthlyLandBalance;
}

const toLockedBalancesByMonth = (lockedBalances) => {
  const months = new Array(12).fill(0);
  const lockedBalancesByMonth = months.reduce((obj, _, index) => { obj[index+1] = 0; return obj }, {});

  for (let { month, mana } of lockedBalances) {
    lockedBalancesByMonth[month] = parseInt(mana, 10);
  }
  return lockedBalancesByMonth;
}

const returnAllMANA = async (contract) => {
  try {
    // get all addresses that locked MANA
    const addresses = await LockedBalanceEvent.getLockedAddresses();

    for (const address of addresses) {
      // get MANA locked in districts
      const submissions = await DistrictEntry.getSubmissions(address)
      const monthlyLandBalances = getMonthlySubmissionMANA(submissions);

      // get MANA locked
      const monthlyLockedBalances = toLockedBalancesByMonth(
        await LockedBalanceEvent.getMonthlyLockedBalanceByAddress(address)
      );

      // adjust MANA balances to bonuses
      const beforeNovBalance = calculateTotalForMonths(
        monthlyLandBalances, monthlyLockedBalances, [9, 10]
      );
      const afterNovBalance = calculateTotalForMonths(
        monthlyLandBalances, monthlyLockedBalances, [11, 12, 1]
      );

      // total MANA locked in districts
      const totalLandBalance = Object.values(monthlyLandBalances).reduce((total, value) => total + value, 0);

      // total MANA reserved
      const manaReserved =
        Math.floor(beforeNovBalance * BEFORE_NOVEMBER_DISCOUNT) + 
        Math.floor(afterNovBalance * AFTER_NOVEMBER_DISCOUNT) + 
        totalLandBalance;
      log.info(`(return) [${address}] before:${beforeNovBalance} + after:${afterNovBalance} + land:${totalLandBalance} = reserved: ${manaReserved}`);

      const totalBurnedMANA = await BuyTransaction.totalBurnedMANAByAddress(address);
      const remainingMANA = eth.web3.toWei(eth.utils.toBigNumber(manaReserved)).minus(totalBurnedMANA);
      if (remainingMANA > 0) {
        log.info(`(return) [${address}] burned: ${totalBurnedMANA} = ${remainingMANA}`);
        const txId = await contract.transferBackMANA(address, remainingMANA);

        log.info(`(return) [${address}] Broadcasted tx : ${txId}`);
        await ReturnTransaction.insert({
          txId,
          address,
          amount: remainingMANA.toString(10),
          status: "pending"
        });
      } else {
        log.error(`(return) [${address}] Remaining MANA is below 0`);
      }
    }
  } catch (err) {
    log.error(err)
  }
}

async function main() {
  const DEFAULT_BATCH_SIZE = 20;

  try {
    // args
    const argv = minimist(process.argv.slice(2), {
      string: ["loadaddress"],
      default: {
        "nbatch": DEFAULT_BATCH_SIZE
      }
    });

    // init
    await db.connect();
    await eth.connect();
    await initTestParcels();

    const contract = eth.getContract("LANDTerraformSale");
    log.info(`Using LANDTerraformSale contract at address ${contract.address}`);      

    // setup watch for mined txs
    const eventFilter = setupBlockWatch("latest");

    // commands
    if (argv.verify === true) {
      await watchPendingTxs(5000);
    } else if (argv.load === true) {
      await loadAllParcels(contract, argv.nbatch);
    } else if (argv.loadaddress) {
      await loadParcelsForAddress(contract, argv.loadaddress, argv.nbatch);
    } else if (argv.returnmana === true) {
      await returnAllMANA(contract);
    } else {
      log.error(`Invalid command. Use --verify or --load`)
      process.exit(0)
    }

  } catch (err) {
    log.info(err);
  }
}

main();
