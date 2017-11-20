#!/usr/bin/env babel-node

import fs from "fs";
import { execSync } from "child_process";
import { env, Log } from "decentraland-commons";
import db from "../src/lib/db";
import { AddressState, ParcelState, DistrictEntry, Project, LockedBalanceEvent } from "../src/lib/models";
import { AddressService, ParcelStateService } from "../src/lib/services";

const log = new Log("[init]");

env.load();

async function initializeDatabase() {
  await upsertRoadsProject();
  await upsertDistrictEntries();
  await upsertProjects();
  await upsertLockedBalanceEvents();
  await importAddressStates();
  await initParcels();

  log.info("All done");
  process.exit();
}

async function upsertRoadsProject() {
  if (!await Project.findByName("Roads")) {
    log.info("Inserting Roads project");

    await Project.insert({
      name: "Genesis Plaza",
      desc: "Decentraland Genesis Plaza",
      link: "",
      public: false,
      parcels: 0,
      priority: 0,
      disabled: false
    });
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

async function upsertProjects() {
  const query = await Project.count()
  if (query.amount > 0) {
    return;
  }
  return execSync(`psql $CONNECTION_STRING -f ./projects.sql`);
}

async function upsertDistrictEntries() {
  const query = await DistrictEntry.countSubmissions()
  if (query.amount > 0) {
    return;
  }
  return execSync(`psql $CONNECTION_STRING -f ./districtEntries.sql`);
}

async function upsertLockedBalanceEvents() {
  const query = await LockedBalanceEvent.countEvents()
  if (query.amount > 0) {
    return;
  }
  return execSync(`psql $CONNECTION_STRING -f ./lockedBalanceEvents.sql`);
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

const importAddressStates = async () => {
  // - Read a dump of address => Balance
  let index = 1;
  const addresses = fs
    .readFileSync("./addresses.txt", "utf8")
    .split("\n")
    .map(address => address.toLowerCase());

  for (const address of addresses) {
    log.info(`Processing address ${index++}/${addresses.length}`);
    if (!address) {
      log.warn("Empty address");
      continue;
    }

    const balance = await AddressService.lockedMANABalanceOf(address);

    if (await AddressState.findByAddress(address)) {
      log.info(`[${address}] Updating balance(${balance})`);
      await AddressState.update({ balance }, { address });
    } else {
      log.info(`[${address}] Inserting balance(${balance})`);
      await AddressState.insert({ address, balance });
    }
  }
};

db
  .connect()
  .then(initializeDatabase)
  .catch(console.error);

export default initializeDatabase;
