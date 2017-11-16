#!/usr/bin/env babel-node

import fs from "fs";
import { eth, env, Log } from "decentraland-commons";
import db from "../src/lib/db";
import { AddressState, ParcelState, Project } from "../src/lib/models";
import { ParcelStateService } from "../src/lib/services";

const log = new Log("[init]");

env.load();

async function initializeDatabase() {
  eth.connect();

  await upsertRoadsProject();
  await importAddressStates();
  await initParcels();

  log.info("All done");
  process.exit();
}

async function upsertRoadsProject() {
  if (!await Project.findByName("Roads")) {
    log.info("Inserting Roads project");

    await Project.insert({
      name: "Roads",
      desc: "Decentraland roads connecting districts",
      link: "",
      public: false,
      parcels: 0,
      priority: 0,
      disabled: false
    });
  }
}

async function initParcels() {
  const parcels = fs.readFileSync("./parcelsDescription.json", "utf8");
  const { x, y, reserved, roads } = JSON.parse(parcels);

  log.info(
    `Inserting a matrix from coords (${x.min} ${y.min}) to (${x.max} ${y.max}). This might take a while.`
  );
  await new ParcelStateService().insertMatrix(x.min, y.min, x.max, y.max);

  await reserveProjects(reserved);
  await reserveProjects(roads);
}

async function reserveProjects(reservation) {
  log.info("Reserving project parcels");

  for (const projectName in reservation) {
    const project = await Project.findByName(projectName);
    if (!project) {
      throw new Error(`Could not find project ${projectName}.`);
    }

    for (let coord of reservation[projectName]) {
      log.info(
        `Reserving parcel ${coord} for project ${projectName} ( ${project.id} )`
      );
      await ParcelState.update({ projectId: project.id }, { id: coord });
    }
  }
}

async function importAddressStates() {
  // - Read a dump of address => Balance
  let index = 1;
  let addresses = fs.readFileSync("./addresses.txt", "utf8");
  addresses = addresses.split("\n");

  for (let address of addresses) {
    log.info(`Processing address ${index++}/${addresses.length}`);
    if (!address) continue;

    address = address.toLowerCase();

    const balance = await eth.getContract("MANAToken").getBalance(address);

    if (await AddressState.findByAddress(address)) {
      log.info(`Updating the balance of address state with ${balance}`);
      await AddressState.update({ balance }, { address });
    } else {
      log.info(`Inserting address ${address} with the balance ${balance}`);
      await AddressState.insert({ address, balance });
    }
  }
}

db
  .connect()
  .then(initializeDatabase)
  .catch(console.error);

export default initializeDatabase;
