#!/usr/bin/env babel-node

import fs from "fs";
import { eth, env } from "decentraland-commons";
import db from "../src/lib/db";
import { AddressState, ParcelState, Project } from "../src/lib/models";
import { ParcelStateService } from "../src/lib/services";

env.load();

async function initializeDatabase() {
  eth.connect();

  await upsertRoadsProject();
  await importAddressStates();
  await initParcels();
}

async function upsertRoadsProject() {
  if (!await Project.findByName("Roads")) {
    console.log("Inserting Roads project");

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
  const parcels = fs.readFileSync("parcelsDescription.example.json", "utf8");
  const { x, y, reserved, roads } = JSON.parse(parcels);

  console.log(`Inserting a ${x.max}x${y.max} Matrix`);
  new ParcelStateService(ParcelState).insertMatrix(x.max, y.max);

  await reserveProjects(reserved);
  await reserveProjects(roads);
}

async function reserveProjects(reservation) {
  console.log("Reserving project parcels");

  for (const projectName in reservation) {
    const project = await Project.findByName(projectName);
    if (!project) {
      throw new Error(`Could not find project ${projectName}.`);
    }

    for (let coord of reservation[projectName]) {
      console.log(
        `Reserving parcel ${coord} for project ${projectName} ( ${project.id} )`
      );
      await ParcelState.update({ projectId: project.id }, { id: coord });
    }
  }
}

async function importAddressStates() {
  // - Read a dump of address => Balance
  let addresses = fs.readFileSync("addresses.example.txt", "utf8");
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

db
  .connect()
  .then(initializeDatabase)
  .catch(console.error);

export default initializeDatabase;
