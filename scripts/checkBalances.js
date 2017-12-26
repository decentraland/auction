#!/usr/bin/env babel-node

import { env, Log } from 'decentraland-commons'
import db from '../src/lib/db'
import {
  AddressState,
  ParcelState,
  LockedBalanceEvent
} from '../src/lib/models'
import { AddressService } from '../src/lib/services'

const log = new Log('CheckBalances')

env.load()

async function run() {
  await checkBalances()
  process.exit()
}

async function checkBalances() {
  // get all addresses with events
  const addresses = await LockedBalanceEvent.getLockedAddresses()
  const addressService = new AddressService()

  let mismatch = 0
  let total = 0
  for (const address of addresses) {
    // get initial balance
    const lockedMANA = await addressService.lockedMANABalanceOf(address)
    const initialBalance = lockedMANA.totalLockedMANA - lockedMANA.totalLandMANA

    // get current balance
    const addressState = await AddressState.findByAddress(address)
    if (addressState) {
      total += 1
      const currentBalance = addressState.balance

      // get bids
      const winningParcels = await ParcelState.findByAddress(address)
      const bidding = winningParcels.reduce(
        (sum, item) => sum + parseInt(item.amount, 10),
        0
      )

      // balance mismatch
      if (initialBalance - bidding != currentBalance) {
        mismatch += 1
        log.info(
          `(${address}) init:${initialBalance}\tbids:${bidding}\tcurrent:${currentBalance}\tcalc:${initialBalance -
            bidding}\twinning:${winningParcels.length}`
        )
      }
    } else {
      log.warn(`(${address}) address state not found!`)
    }
  }
  log.info(`Found ${mismatch} discrepancies out of ${total} addresses`)
}

db
  .connect()
  .then(run)
  .catch(console.error)

export default run
