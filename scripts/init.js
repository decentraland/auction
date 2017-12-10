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
const parcelsDescription = getPracelsDescriptions()

env.load()

async function initializeDatabase() {
  await upsertRoadsProject()
  await upsertDistrictEntries()
  await upsertProjects()
  await upsertLockedBalanceEvents()
  await importAddressStates()
  await initParcels()

  log.info('All done')
  process.exit()
}

async function upsertRoadsProject() {
  const { lookup } = parcelsDescription

  if (!await Project.findByName('Genesis Plaza')) {
    log.info('Inserting Genesis Plaza project')

    await Project.insert({
      name: 'Genesis Plaza',
      desc: 'Decentraland Genesis Plaza',
      link: '',
      public: false,
      parcels: 0,
      priority: 0,
      disabled: false,
      lookup: lookup['Genesis Plaza']
    })
  }

  if (!await Project.findByName('Roads')) {
    log.info('Inserting Roads project')

    await Project.insert({
      name: 'Roads',
      desc: 'Decentraland roads connecting districts',
      link: '',
      public: false,
      parcels: 0,
      priority: 0,
      disabled: false,
      lookup: lookup['Roads']
    })
  }
}

async function upsertProjects() {
  log.info('Upserting projects')

  const query = await Project.count()
  if (query.amount > 0) {
    return
  }
  execSync('psql $CONNECTION_STRING -f ./projects.sql')

  const { lookup } = parcelsDescription
  const projects = await Project.find()

  for (const project of projects) {
    await Project.update({ id: project.id }, { lookup: lookup[project.name] })
  }
}

async function upsertDistrictEntries() {
  log.info('Upserting district entries')

  const query = await DistrictEntry.countSubmissions()
  if (query.amount > 0) {
    return
  }
  return execSync('psql $CONNECTION_STRING -f ./districtEntries.sql')
}

async function upsertLockedBalanceEvents() {
  log.info('Upserting locked balance events')

  const query = await LockedBalanceEvent.countEvents()
  if (query.amount > 0) {
    return
  }
  return execSync('psql $CONNECTION_STRING -f ./lockedBalanceEvents.sql')
}

async function initParcels() {
  const { x, y, reserved, roads } = parcelsDescription

  log.info(
    `Inserting a matrix from coords (${x.min} ${y.min}) to (${x.max} ${y.max}). This might take a while.`
  )
  await parcelStateService.insertMatrix(x.min, y.min, x.max, y.max)

  await reserveProjects(reserved)
  await reserveProjects({ Roads: roads })
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
    log.info(
      `Reserved ${reservation[projectName].length} parcels for project ${projectName} ( ${project.id} )`
    )
  }
}

const importAddressStates = async () => {
  // - Read a dump of address => Balance
  let index = 1
  const addresses = fs
    .readFileSync('./addresses.txt', 'utf8')
    .split('\n')
    .map(address => address.toLowerCase())

  for (const address of addresses) {
    log.info(`Processing address ${index++}/${addresses.length}`)
    if (!address) {
      log.warn('Empty address')
      continue
    }

    const addressService = new AddressService()
    const lockedMANA = await addressService.lockedMANABalanceOf(address)
    const balance = lockedMANA.totalLockedMANA

    if (await AddressState.findByAddress(address)) {
      log.info(`[${address}] Updating balance(${balance})`)
      await AddressState.update({ balance }, { address })
    } else {
      log.info(`[${address}] Inserting balance(${balance})`)
      await AddressState.insert({ address, balance })
    }
  }
}

function getPracelsDescriptions() {
  let parcelsDescription = fs.readFileSync('./parcelsDescription.json', 'utf8')
  return JSON.parse(parcelsDescription)
}

db
  .connect()
  .then(initializeDatabase)
  .catch(console.error)

export default initializeDatabase
