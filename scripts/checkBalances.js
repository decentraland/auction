#!/usr/bin/env babel-node

import fs from 'fs'
import { execSync } from 'child_process'
import { env, Log } from 'decentraland-commons'
import db from '../src/lib/db'
import {
  AddressState,
  ParcelState,
  DistrictEntry,
  Project,
  LockedBalanceEvent
} from '../src/lib/models'
import { AddressService, ParcelStateService } from '../src/lib/services'

const log = new Log('init')
const parcelStateService = new ParcelStateService()

env.load()

async function fixDatabase() {
  try {
    await insertMissingAddressStates()
    await replayBids()
  } catch(e) {
    console.log(e.stack)
  }

  log.info('All done')
  process.exit()
}

import BN from 'bignumber.js'

async function insertMissingAddressStates() {
  log.info('Fetching all addresses from transaction logs')

  const addressService = new AddressService()

  const data = JSON.parse(fs.readFileSync('./terraform.json').toString())
  const transactions = data.result.slice(1)
  const balances = {}

  const Nov1 = 1509494400
  const Dec1 = 1512086400

  for (const tx of transactions) {
    if (tx.isError === "0" && tx.txreceipt_status === "1" && tx.input.startsWith('0x6b7006d7')) {
      const address = '0x' + tx.input.substr(34, 40)
      const amount = new BN(tx.input.substr(74), 16)
      const time = parseInt(tx.timeStamp, 10)

      if (!balances[address]) {
        balances[address] = {
          preNov: new BN(0),
          nov: new BN(0),
          dec: new BN(0)
        }
      }
      if (time < Nov1) {
        balances[address].preNov = balances[address].preNov.add(amount)
      } else if (time < Dec1) {
        balances[address].nov = balances[address].nov.add(amount)
      } else {
        balances[address].dec = balances[address].dec.add(amount)
      }
    }
  }

  const addresses = Object.keys(balances)
  let matches = 0
  let misses = 0
  let missingBalance = 0
  for (const address of addresses) {
    const perMonthRaw = await DistrictEntry.getMonthlyLockedBalanceByAddress(address, 1000)
    const perMonth = { 9: 0, 10: 0, 11: 0, 12: 0}
    for (let entry of perMonthRaw) {
      perMonth[entry.month] = entry.mana
    }
    const preNovDistricts = new BN(0).add(new BN(perMonth[9])).add(new BN(perMonth[10]))
    const novDistricts = new BN(0).add(new BN(perMonth[11]))
    const decDistricts = new BN(0).add(new BN(perMonth[12]))
    const wei = new BN('1000000000000000000')
    const finalBalance = (balances[address].preNov.div(wei).sub(preNovDistricts)).mul(new BN(1.15))
      .add(balances[address].nov.div(wei).sub(novDistricts).mul(new BN(1.1)))
      .add(balances[address].dec.div(wei).sub(decDistricts))

    const state = await AddressState.findByAddress(address)
    if (state && state.balance) {
      if (state.balance === finalBalance.toString()) {
        matches += 1
        console.log(address, 'match',
          finalBalance.toString(),
          balances[address].preNov.div(wei).toString(),
          balances[address].nov.div(wei).toString(),
          balances[address].dec.div(wei).toString(),
          preNovDistricts.toString(),
          novDistricts.toString(),
          decDistricts.toString()
        )
      } else {
        misses += 1
        console.log(address, state.balance,
          finalBalance.toString(),
          balances[address].preNov.div(wei).toString(),
          balances[address].nov.div(wei).toString(),
          balances[address].dec.div(wei).toString(),
          preNovDistricts.toString(),
          novDistricts.toString(),
          decDistricts.toString()
        )
      }
    } else {
      missingBalance++
      console.log(address, 'none',
        finalBalance.toString(),
        balances[address].preNov.div(wei).toString(),
        balances[address].nov.div(wei).toString(),
        balances[address].dec.div(wei).toString(),
        preNovDistricts.toString(),
        novDistricts.toString(),
        decDistricts.toString()
      )
    }
  }
  console.log(matches + misses + missingBalance, matches, misses, missingBalance)
}

async function replayBids() {
}

async function exceptions() {
  await execSync('psql $CONNECTION_STRING -f ./exceptions.sql')
}

async function reserveProjects(reservation) {
  log.info('Reserving project parcels')

  for (const projectName in reservation) {
    const project = await Project.findByName(projectName)
    if (!project) {
      log.error(`Could not find project ${projectName}.`)
      continue
    }

    for (let coord of reservation[projectName]) {
      await ParcelState.update({ projectId: project.id }, { id: coord })
    }

    const reservedParcels = reservation[projectName].length
    log.info(
      `Reserved ${reservedParcels} parcels for project ${projectName} ( ${
        project.id
      } )`
    )
  }
}

db
  .connect()
  .then(fixDatabase)
  .then(console.log)
  .catch(e => console.log(e.stack))

export default fixDatabase
