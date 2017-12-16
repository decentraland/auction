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

async function run() {
  await checkBalancesAgainstInitialCount()
  process.exit()
}

async function checkBalancesAgainstInitialCount() {

  const events = await LockedBalanceEvent.find()
  const addressesMap = {}
  for (const event of events) {
    addressesMap[event.address] = 1
  }
  const addresses = Object.keys(addressesMap)
  const addressService = new AddressService()

  let ok = 0
  let mismatch = 0
  let total = 0
  for (const address of addresses) {
    const lockedMANA = await addressService.lockedMANABalanceOf(address)
    const balance = lockedMANA.totalLockedMANA - lockedMANA.totalLandMANA
    if (address === '0x76357aC0B467F32783Df6E17E30c47e5E44A8013') {
      console.log(lockedMANA)
    }
    if (!balance) {
      continue
    }

    const addressState = await AddressState.findByAddress(address)
    if (addressState) {
      total += 1
      const winningParcels = await ParcelState.findByAddress(address)
      const bidding = winningParcels.reduce((sum, item) => sum + parseInt(item.amount, 10), 0)
      if (balance - bidding != addressState.balance) {
        mismatch += 1
        console.log(
          [address, balance, bidding, addressState.balance, balance - bidding].join('\t')
        )
        console.log(winningParcels.length)
      } else {
        ok += 1
      }
    }
  }
  console.log(`Found ${mismatch} discrepancies out of ${total} addresses in db.`)
}

function getPracelsDescriptions() {
  let parcelsDescription = fs.readFileSync('./parcelsDescription.json', 'utf8')
  return JSON.parse(parcelsDescription)
}

db
  .connect()
  .then(run)
  .catch(console.error)

export default run
