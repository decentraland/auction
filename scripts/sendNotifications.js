#!/usr/bin/env babel-node

import { eth, env, Log } from 'decentraland-commons'

import db from '../src/lib/db'
import { OutbidNotificationService } from '../src/lib/services';

const log = new Log('SendNotifications')

env.load()

async function main() {
  try {
    // init
    await db.connect()

    // send all
    log.info('Sending auction summary emails...')
    const service = new OutbidNotificationService()
    const results = await service.sendAllSummaryMails()

    const values = Object.values(results)
    const totalEmails = values.length
    const totalSent = values.filter(e => typeof(e) !== 'string').length
    log.info(`Sent ${totalSent} out of ${totalEmails} emails processed`)
  } catch (err) {
    log.error(err)
  } finally {
    process.exit(0)
  }
}

main()
