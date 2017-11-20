#!/usr/bin/env babel-node

import minimist from "minimist";
import { eth, env, Log } from "decentraland-commons";
import db from "../src/lib/db";
import {
  BuyTransaction,
  LockedBalanceEvent,
  ParcelState,
  ReturnTransaction
} from "../src/lib/models";
import AddressService from "../src/lib/services/AddressService";

const log = new Log("[LoadBids]");

env.load();

const DEFAULT_BATCH_SIZE = 20;

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

const setIntervalAndExecute = (fn, t) => {
  fn();
  return setInterval(fn, t);
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

const onNewBlock = (blockHash, watchedModel) => {
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
          await watchedModel.update(
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

const setupBlockWatch = (options, watchedModel) => {
  log.info(`(watch) Setting up event filter for new blocks`);
  const filter = eth.setupFilter(options);

  filter.watch((err, blockHash) => {
    if (err) {
      log.error(err);
      return;
    }

    onNewBlock(blockHash, watchedModel);
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

const findParcelsToBuy = async (address, batchSize) => {
  try {
    // get parcels for address
    const parcels = await ParcelState.findParcelsByAddress(address);

    // get already done parcels for address
    const doneParcels = await BuyTransaction.findProcessedParcels(address);

    // select parcels to send
    const sendParcels = parcels
      .filter(e => !doneParcels.includes(e.id))
      .splice(0, batchSize);

    log.info(
      `(proc) [${address}] Progress => ${doneParcels.length} out of ${parcels.length} = selected ${sendParcels.length}`
    );
    return sendParcels;

  } catch (err) {
    log.error(err);
    return [];
  }
}

const loadParcelsForAddress = async (contract, address, batchSize) => {
  try {
    if (!address) {
      throw new Error(`(proc) [${address}] Empty or invalid address`);
    }
    log.info(`(proc) [${address}] Processing bids for address...`);

    while (true) {
      const sendParcels = await findParcelsToBuy(address, batchSize);

      // no more parcels to send
      if (sendParcels.length === 0) {
        log.info(`(proc) [${address}] Sent all parcels for address`);
        break;
      }

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

const verifyPendingTxs = async watchedModel => {
  try {
    // setup watch for mined txs
    const pendingTxIds = await watchedModel.findAllPendingTxIds();
    log.info(`(tx) Total number of TXs to verify: ${pendingTxIds.length}`);

    for (const txId of pendingTxIds) {
      const receipt = await eth.fetchTxReceipt(txId);

      if (receipt === null) {
        log.info(`(tx) [${txId}] pending`);
      } else if (receipt.status === 0) {
        log.info(`(tx) [${txId}] error`);
        await watchedModel.update({ receipt, status: "error" }, { txId });
      } else if (receipt.status === 1) {
        log.info(`(tx) [${txId}] completed`);
        await watchedModel.update({ receipt, status: "completed" }, { txId });
      }
    }
  } catch (err) {
    log.error(err);
  }
};

const watchPendingTxs = (watchedModel, time) => {
  setIntervalAndExecute(() => verifyPendingTxs(watchedModel), time);
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

const returnAllMANA = async contract => {
  try {
    // get all addresses that locked MANA
    const addresses = await LockedBalanceEvent.getLockedAddresses();

    for (const address of addresses) {
      // if already sent avoid
      const returnTx = await ReturnTransaction.findByAddress(address);
      if (returnTx) {
        log.info(`(return) [${address}] TX already sent for address`);
        continue;
      }

      // get locked MANA including discounts
      const totalLockedMANA = await AddressService.lockedMANABalanceOf(address);
      log.info(`(return) [${address}] locked(${totalLockedMANA})`);

      // get burned MANA by all buy transactions
      const totalBurnedMANA = await BuyTransaction.totalBurnedMANAByAddress(
        address
      );

      // calculate remaining MANA to return
      const remainingMANA = eth.web3
        .toWei(eth.utils.toBigNumber(totalLockedMANA))
        .minus(totalBurnedMANA);

      // send tx
      if (remainingMANA > 0) {
        log.info(
          `(return) [${address}] burned(${totalBurnedMANA.toString(
            10
          )}) = ${remainingMANA.toString(10)}`
        );
        const txId = await contract.transferBackMANA(address, remainingMANA);
        txQueue.addPendingTx(txId);

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
    log.error(err);
  }
};

const parseArgs = () =>
  minimist(process.argv.slice(2), {
    string: ["loadaddress"],
    default: {
      nbatch: DEFAULT_BATCH_SIZE
    }
  });

async function main() {
  try {
    // args
    const argv = parseArgs();

    // init
    await db.connect();
    await eth.connect("", "", { httpProviderUrl: "http://localhost:18545" });
    await initTestParcels();

    const contract = eth.getContract("LANDTerraformSale");
    log.info(`Using LANDTerraformSale contract at address ${contract.address}`);

    // commands
    if (argv.verifybuys === true) {
      await watchPendingTxs(BuyTransaction, 30000);
    } else if (argv.verifyreturns === true) {
      await watchPendingTxs(ReturnTransaction, 30000);
    } else if (argv.load === true) {
      setupBlockWatch("latest", BuyTransaction);
      await loadAllParcels(contract, argv.nbatch);
    } else if (argv.loadaddress) {
      setupBlockWatch("latest", BuyTransaction);
      await loadParcelsForAddress(contract, argv.loadaddress, argv.nbatch);
    } else if (argv.returnmana === true) {
      setupBlockWatch("latest", ReturnTransaction);
      await returnAllMANA(contract);
    } else {
      console.log(
        `Invalid command. \nAvailable commands: \n\t--verifybuys\n\t--verifyreturns\n\t--load\n\t--loadaddress\n\t--returnmana`
      );
      process.exit(0);
    }
  } catch (err) {
    log.info(err);
  }
}

main();
