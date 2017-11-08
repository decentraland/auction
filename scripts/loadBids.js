#!/usr/bin/env babel-node

import { eth, env, Log } from "decentraland-commons";
import db from "../src/lib/db";
import { ParcelState, BuyTransaction } from "../src/lib/models";

const log = new Log("[LoadBids]");

env.load();

function isProccessed(parcelId) {
  return false;
}

//The maximum is inclusive and the minimum is inclusive
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Load test parcels
async function loadTestParcels() {
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

    for (const config of configs) {
      for (let i = 0; i < config.count; i++) {
        await ParcelState.insert({
          x: getRandomInt(0, 1000),
          y: getRandomInt(0, 1000),
          amount: String(getRandomInt(1000, 10000)),
          address: config.address,
          endsAt: new Date(),
          bidGroupId: 1,
          bidIndex: 0,
          projectId: null
        });
      }
    }
  } catch (err) {
    log.error(err);
  }
}

async function main() {
  const BATCH_SIZE = 20;

  // Get current bids
  try {
    await eth.connect();
    await loadTestParcels();

    const contract = eth.getContract("LANDTerraformSale");

    // Get all addresses with bids
    const rows = await ParcelState.findAllAddresses();
    log.info(`Got ${rows.length} addresses with winning bids`);
    for (const row of rows) {
      // Get winning bids by address
      log.info(`(${row.address}) Processing bids for address`);
      const parcels = await ParcelState.findParcelsByAddress(row.address);

      // Build TX data
      const address = row.address;
      const X = parcels.map(parcel => parcel.x);
      const Y = parcels.map(parcel => parcel.y);
      const totalCost = parcels
        .map(parcel => eth.utils.toBigNumber(parcel.amount))
        .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0));
      const parcelStatesIds = parcels.map(parcel => parcel.id);

      log.info(
        `(${row.address}) ${parcels.length} bids found = total cost: ${totalCost}`
      );
      log.info(`(${row.address}) X- > ${JSON.stringify(X)}`);
      log.info(`(${row.address}) Y -> ${JSON.stringify(Y)}`);

      // TODO: Filter out already done bids
      // TODO: Configurable batch size

      // Broadcast transactions
      const txId = await contract.buyMany(address, X, Y, totalCost);
      console.log(txId);

      // Save transaction
      await BuyTransaction.insert({
        txId,
        address,
        parcelStatesIds,
        totalCost,
        status: "pending"
      });

      // TODO: Wait for tx to mine
      // TODO: Save the receipt to a table
      const receipt = await eth.fetchTxReceipt(txId);
      console.log(receipt);
    }

    process.exit(0);
  } catch (err) {
    log.info(err);
  }
}

db
  .connect()
  .then(main)
  .catch(log.error);
