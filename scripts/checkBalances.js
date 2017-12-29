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
    try {
      const {
        initialBalance,
        currentBalance,
        bidding,
        parcels,
        isMatch
      } = await addressService.checkBalance(address)

      if (!isMatch) {
        mismatch += 1
        log.info(
          `(${address}) init:${initialBalance}\tbids:${bidding}\tcurrent:${currentBalance}\tcalc:${initialBalance -
            bidding}\twinning:${parcels.length}`
        )
      }

      total += 1
    } catch (err) {
      log.error(err.message)
    }
  }
  log.info(`Found ${mismatch} discrepancies out of ${total} addresses`)
}

db
  .connect()
  .then(run)
  .catch(console.error)

export default run
