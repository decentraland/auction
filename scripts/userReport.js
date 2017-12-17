#!/usr/bin/env babel-node

import Table from 'cli-table'

import { env, Log } from 'decentraland-commons'

import db from '../src/lib/db'
import {
  AddressState,
  DistrictEntry,
  LockedBalanceEvent,
  ParcelState
} from '../src/lib/models'

import { AddressService } from '../src/lib/services'

const log = new Log('UserReport')

env.load()

const filterKeys = (original, allowed) => {
  return Object.keys(original)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = original[key]
      return obj
    }, {})
}

const nullToEmpty = v => (v === null ? '' : v)

const createTable = (fields, values) => {
  const table = new Table({
    head: fields
  })

  for (const item of values) {
    table.push(Object.values(filterKeys(item, fields)).map(nullToEmpty))
  }
  return table
}

const printTable = (fields, values) => {
  const table = createTable(fields, values)
  console.log(table.toString())
}

async function main() {
  try {
    // init
    await db.connect()

    // args
    const address = process.argv[2]

    // address
    const account = await AddressState.findByAddress(address)
    const addressService = new AddressService()
    const balance = await addressService.lockedMANABalanceOf(address)

    console.log('--[Account]--\n')
    console.log('<Initial Balances>')
    console.log(`+ Auction: ${balance.totalLockedMANA}`)
    console.log(`+ Districts: ${balance.totalLandMANA}`)
    console.log(
      `+ Balance: ${balance.totalLockedMANA - balance.totalLandMANA}\n`
    )

    printTable(
      ['balance', 'email', 'latestBidGroupId', 'createdAt', 'updatedAt'],
      [account]
    )
    console.log('\n')

    // locked
    const events = await LockedBalanceEvent.findByAddress(address)
    console.log('--[LockedEvents]--')
    printTable(
      ['txId', 'mana', 'confirmedAt', 'createdAt', 'updatedAt'],
      events
    )
    console.log('\n')

    // districts
    const districts = await DistrictEntry.findByAddress(address)
    console.log('--[Districts]--')
    printTable(
      ['project_id', 'lands', 'userTimestamp', 'createdAt', 'updatedAt'],
      districts
    )
    console.log('\n')

    // parcels
    const parcels = await ParcelState.findByAddress(address)
    console.log('--[Parcels]--')
    printTable(['id', 'amount', 'endsAt', 'updatedAt'], parcels)
  } catch (err) {
    log.error(err)
  } finally {
    process.exit(0)
  }
}

main()
