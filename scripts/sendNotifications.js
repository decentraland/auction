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
    const service = new OutbidNotificationService()
    await service.sendAllSummaryMails()  
  } catch (err) {
    log.error(err)
  } finally {
    process.exit(0)
  }
}

main()
