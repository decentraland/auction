#!/usr/bin/env babel-node

import fs from 'fs'
import { env, cli } from 'decentraland-commons'
import db from '../src/lib/db'

env.load()

const dbCli = {
  addCommands(program) {
    program
      .command('exportJSON <tableName>')
      .alias('ex')
      .description('Export a table to a JSON file')
      .action(async tableName => {
        const rows = await db.select(tableName)

        console.log(`Writing ${rows.length} into ${tableName}.json`)
        fs.writeFileSync(
          `${tableName}.json`,
          JSON.stringify(rows, null, 2),
          'utf8'
        )

        console.log('All done')
        process.exit(0)
      })
  }
}

db
  .connect()
  .then(() => cli.runProgram([dbCli]))
  .catch(console.error)
