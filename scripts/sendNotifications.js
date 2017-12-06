#!/usr/bin/env babel-node

import minimist from 'minimist'
import { env, Log } from 'decentraland-commons'

import db from '../src/lib/db'
import { OutbidNotificationService } from '../src/lib/services'

const log = new Log('SendNotifications')

env.load()

const DEFAULT_HOURS_AGO = 8

const parseArgs = () =>
  minimist(process.argv.slice(2), {
    default: {
      hours: DEFAULT_HOURS_AGO
    }
  })

async function main() {
  try {
    // args
    const argv = parseArgs()

    // init
    await db.connect()

    // send all
    log.info(`Sending auction summary emails [hours=${argv.hours}]...`)
    const service = new OutbidNotificationService()
    const results = await service.sendAllSummaryMails(argv.hours)

    const values = Object.values(results)
    const totalEmails = values.length
    const totalSent = values.filter(e => !e.hasOwnProperty('message')).length
    log.info(`Sent ${totalSent} out of ${totalEmails} total emails`)
    log.debug(results)
  } catch (err) {
    log.error(err)
  } finally {
    process.exit(0)
  }
}

main()
