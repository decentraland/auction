#!/usr/bin/env babel-node

import request from 'request-promise-native'
import { env, Log } from 'decentraland-commons'

import db from '../src/lib/db'
import { AddressState, LockedBalanceEvent } from '../src/lib/models'

const log = new Log('RefreshTerraform')

env.load()

async function main() {
  try {
    // init
    await db.connect()

    // get last balance event
    const lastEvent = await LockedBalanceEvent.findLast()
    const checkpoint = lastEvent.confirmedAt.getTime()

    // get locked balance events
    const url =
      env.get('TERRAFORM_API_URL', 'http://localhost:5000') +
      '/api/getLockedBalances/' +
      checkpoint
    const res = await request.get(url)
    const lockedBalanceEvents = JSON.parse(res)

    // process events
    for (const event of lockedBalanceEvents.data) {
      const tx = await LockedBalanceEvent.findOneByTxId(event.txId)
      if (tx) {
        log.warn(`[${event.address}] TX (${event.txId}) already processed`)
        continue
      }

      // new event
      await LockedBalanceEvent.insert(event)
      log.warn(`[${event.address}] TX (${event.txId}) inserted`)

      // update balances
      const addressState = await AddressState.findByAddress(event.address)
      if (addressState) {
        await AddressState.addBalance(event.address, event.mana)
        log.info(`[${event.address}] Updated balance: +${event.mana}`)
      } else {
        await AddressState.insert({
          address: event.address,
          balance: event.mana
        })
        log.info(`[${event.address}] New address with balance: ${event.mana}`)
      }
    }
  } catch (err) {
    log.error(err)
  } finally {
    process.exit(0)
  }
}

main()
