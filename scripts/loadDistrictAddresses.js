#!/usr/bin/env babel-node

import fs from "fs";
import { eth, env, Log } from "decentraland-commons";
import db from "../src/lib/db";
import { ParcelState, Project } from "../src/lib/models";

const log = new Log("[LoadDistrictAddresses]");

env.load();

function readJSON(filename) {
  return JSON.parse(fs.readFileSync(filename).toString());
}

async function main() {
  try {  
    // init
    await db.connect();

    const filename = "districtAddress.example.json";
    const input = readJSON(filename);

    for (const [name, address] of Object.entries(input.districts)) {
      const project = await Project.findByName(name);

      if (project) {        
        await ParcelState.update({address}, {projectId: project.id});
      } else {
        log.error(`Project "${name}" not found`);
      }
    }

    process.exit(0);
  } catch (err) {
    log.error(err);
  }
}

main();

