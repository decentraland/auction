#!/usr/bin/env babel-node

import { env } from "decentraland-commons";
import db from "../src/lib/db";

env.load();

async function run() {
  // - Read a dump of address => Balance
  // - Read a description of parcels to be auctioned
  // - Read timestamp of start
  // - Store initial states in database
}

db
  .connect()
  .then(run)
  .catch(console.error);
