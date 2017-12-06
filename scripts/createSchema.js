#!/usr/bin/env babel-node

import { env } from 'decentraland-commons'
import db from '../src/lib/db'

env.load()

db
  .connect()
  .catch(console.error)
  .then(() => process.exit())
