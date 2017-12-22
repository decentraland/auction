#!/usr/bin/env babel-node

import fs from 'fs'
import { env } from 'decentraland-commons'
import db from '../src/lib/db'
import { ParcelState } from '../src/lib/models'

env.load()

async function exportAddress() {
  const address = process.argv[2]
  if (!address) throw new Error('Please supply an address as argument')

  const parcelStates = await ParcelState.findByAddress(address.toLowerCase())
  parcelStates.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)) // in-memory sort...I know I know

  const csv = ['Parcel,Amount,Date']
  let total = 0

  for (const parcel of parcelStates) {
    csv.push(
      `"${parcel.id}",${parcel.amount} MANA,"${parcel.updatedAt.toLocaleString()}"`
    )
    total += parseFloat(parcel.amount)
  }

  csv.push(`TOTAL,${total}`)
  csv.push(`For more info,visit,https://auction.decentraland.org/addressStats/${address}`)

  const fileName = `${address}.csv`
  fs.writeFileSync(fileName, csv.join('\r\n'), 'utf8')

  console.log(`File ${fileName} created!`)
  process.exit()
}

db
  .connect()
  .then(exportAddress)
  .catch(console.error)
