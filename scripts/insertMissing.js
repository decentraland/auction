#!/usr/bin/env babel-node

import fs from 'fs'
import { execSync } from 'child_process'
import { env, Log } from 'decentraland-commons'
import db from '../src/lib/db'
import {
  AddressState,
  ParcelState,
  DistrictEntry,
  Project,
  LockedBalanceEvent
} from '../src/lib/models'
import { AddressService, ParcelStateService } from '../src/lib/services'

const log = new Log('init')
const parcelStateService = new ParcelStateService()
const parcelsDescription = getPracelsDescriptions()

env.load()

async function initializeDatabase() {
  await insertMissingAddresses()
  process.exit()
}

async function insertMissingAddresses() {

  const events = await LockedBalanceEvent.find()
  const addressesMap = {}
  for (const event of events) {
    addressesMap[event.address] = 1
  }
  const addresses = Object.keys(addressesMap)
  const addressService = new AddressService()

  const cleared = fs
    .readFileSync('./clearAddress.txt', 'utf8')
    .split('\n')
    .map(address => address.toLowerCase())
    .filter(e => !!e)

  for (const address of addresses) {
    const lockedMANA = await addressService.lockedMANABalanceOf(address)
    const balance = lockedMANA.totalLockedMANA - lockedMANA.totalLandMANA

    const addressState = await AddressState.findByAddress(address)
    if (addressState) {
      if (balance > 0) {
        const winningParcels = await ParcelState.findByAddress(address)
        if (!winningParcels.length) {
          log.info(`[${address}] Updating balance\toriginal ${balance}\tdb had ${addressState.balance} balance`)
          await AddressState.update({ balance }, { address })
        }
      }
    } else if (balance > 0) {
      log.info(`[${address}] Inserting balance(${balance})`)
      await AddressState.insert({ address, balance })
    }
  }
}

function getPracelsDescriptions() {
  let parcelsDescription = fs.readFileSync('./parcelsDescription.json', 'utf8')
  return JSON.parse(parcelsDescription)
}

db
  .connect()
  .then(initializeDatabase)
  .catch(console.error)

export default initializeDatabase
