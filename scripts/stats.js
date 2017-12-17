#!/usr/bin/env babel-node

import util from 'util'
import { env, Log } from 'decentraland-commons'

import db from '../src/lib/db'
import { StatsService } from '../src/lib/services'

const log = new Log('Stats')

env.load()

async function main() {
  try {
    // init
    await db.connect()

    // stats
    const stats = new StatsService()
    const result = await stats.summary()
    console.log(util.inspect(result, false, null))
  } catch (err) {
    log.error(err)
  } finally {
    process.exit(0)
  }
}

main()
