#!/usr/bin/env babel-node

import { env, Log } from 'decentraland-commons'
import db from '../src/lib/db'
import {
  AddressState,
  ParcelState,
  LockedBalanceEvent
} from '../src/lib/models'
import { AddressService } from '../src/lib/services'

const log = new Log('init')

env.load()

async function initializeDatabase() {
  await insertMissingAddresses()
  process.exit()
}

async function insertMissingAddresses() {
  // get all addresses with events
  const addresses = await LockedBalanceEvent.getLockedAddresses()
  const addressService = new AddressService()

  for (const address of addresses) {
    // get initial balance
    const lockedMANA = await addressService.lockedMANABalanceOf(address)
    const initialBalance = lockedMANA.totalLockedMANA - lockedMANA.totalLandMANA

    const addressState = await AddressState.findByAddress(address)
    if (addressState) {
      if (initialBalance > 0 && addressState.balance != initialBalance) {
        const winningParcels = await ParcelState.findByAddress(address)
        if (!winningParcels.length) {
          log.info(
            `[${address}] Updating balance\toriginal ${initialBalance}\tdb had ${addressState.balance} balance`
          )
          await AddressState.update({ balance: initialBalance }, { address })
        }
      }
    } else {
      log.info(`[${address}] Inserting balance(${initialBalance})`)
      await AddressState.insert({ address, balance: initialBalance })
    }
  }
}

db
  .connect()
  .then(initializeDatabase)
  .catch(console.error)

export default initializeDatabase
