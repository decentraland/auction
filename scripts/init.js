#!/usr/bin/env babel-node

import fs from "fs";
import { eth, env } from "decentraland-commons";
import db from "../src/lib/db";
import { AddressState } from "../src/lib/models";

env.load();

async function run() {
  eth.connect();

  // - Read a dump of address => Balance
  let addresses = fs.readFileSync("addresses.txt", "utf8");
  addresses = addresses.split("\n").slice(10);

  for (let address of addresses) {
    if (!address) continue;

    const balance = await eth.getContract("MANAToken").getBalance(address);

    if (await AddressState.findByAddress(address)) {
      console.log(`Updating the balance of address state with ${balance}`);
      await AddressState.update({ balance }, { address });
    } else {
      console.log(`Inserting address ${address} with the balance ${balance}`);
      await AddressState.insert({ address, balance });
    }
  }

  // - Read a description of parcels to be auctioned
  // - Read timestamp of start
  // - Store initial states in database
}

db
  .connect()
  .then(run)
  .catch(console.error);
