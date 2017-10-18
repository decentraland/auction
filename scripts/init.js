#!/usr/bin/env babel-node

import fs from "fs";
import { eth, env } from "decentraland-commons";
import db from "../src/lib/db";
import { AddressState, ParcelState, Project } from "../src/lib/models";
import { ParcelStateService } from "../src/lib/services";

env.load();

async function run() {
  eth.connect();

  await importAddressStates();
  await initParcels();
}

async function importAddressStates() {
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
}

async function initParcels() {
  const parcels = fs.readFileSync("parcelsDescription.json", "utf8");
  const { x, y, reserved } = JSON.parse(parcels);

  console.log(`Inserting a ${x.max}x${y.max} Matrix`);
  new ParcelStateService(ParcelState).insertMatrix(x.max, y.max);

  console.log("Reserving project parcels");
  for (const projectName in reserved) {
    const project = await Project.findByName(projectName);
    if (!project) {
      throw new Error(`Could not find project ${projectName}.`);
    }

    for (let coord of reserved[projectName]) {
      console.log(
        `Reserving parcel ${coord} for project ${projectName} ( ${project.id} )`
      );
      await ParcelState.update({ projectId: project.id }, { id: coord });
    }
  }

  // TODO: Handle roads.
  // We could add a roads project, for it could work the same way as projects do
}

db
  .connect()
  .then(run)
  .catch(console.error);
