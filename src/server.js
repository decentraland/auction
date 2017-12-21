import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import git from 'git-rev-sync'

import { server, env, utils } from 'decentraland-commons'
import db from './lib/db'
import coordinatesUtils from './lib/coordinates'
import omitInArray from './lib/omitInArray'
import verifyMessage from './lib/verifyMessage'

import {
  AddressState,
  BidGroup,
  DistrictEntry,
  ParcelState,
  Project,
  OutbidNotification
} from './lib/models'

import {
  BidService,
  BidReceiptService,
  OutbidNotificationService,
  StatsService
} from './lib/services'

env.load()

const SERVER_PORT = env.get('SERVER_PORT', 5000)

const app = express()
const httpServer = http.Server(app)

app.use(bodyParser.urlencoded({ extended: false, limit: '2mb' }))
app.use(bodyParser.json())

if (env.isProduction()) {
  const webappPath = env.get(
    'WEBAPP_PATH',
    path.join(__dirname, '..', 'webapp/build')
  )

  app.use('/', express.static(webappPath, { extensions: ['html'] }))
} else {
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    next()
  })
}

/**
 * AddressState fetch by address: without bidgroups.
 * @param  {string} address - User address
 * @return {object}         - Address state object (with it's last bid, if any)
 */
app.get(
  '/api/addressState/simple/:address',
  server.handleRequest(getSimpleAddressState)
)

export function getSimpleAddressState(req) {
  const address = server.extractFromReq(req, 'address')
  return AddressState.findByAddress(address.toLowerCase())
}

/**
 * AddressState fetch by address: /full contains all BidGroups.
 * @param  {string} address - User address
 * @return {object}         - Address state object with each placed bid
 */
app.get(
  '/api/addressState/full/:address',
  server.handleRequest(getFullAddressState)
)

export async function getFullAddressState(req) {
  let address = server.extractFromReq(req, 'address')
  address = address.toLowerCase()

  let addressState = await AddressState.findByAddressWithBidGroups(address)

  return addressState
}

/**
 * Districts fetch by address.
 * @param  {string} address - User address
 * @return {object}         - A list of districts where the address did contribute
 */

app.get('/api/districts/:address', server.handleRequest(getDistricts))

export function getDistricts(req) {
  const address = server.extractFromReq(req, 'address').toLowerCase()
  return DistrictEntry.findContributedByAddress(address)
}

/**
 * ParcelState fetch by id. Attachs the bidGroup history to the response
 * @param  {string} id - ParcelState id
 * @return {object}    - ParcelState object
 */
app.get('/api/parcelState/:id', server.handleRequest(getParcelState))

export function getParcelState(req) {
  const id = server.extractFromReq(req, 'id')
  return ParcelState.findByIdWithBidGroups(id)
}

/**
 * ParcelState group fetch. Get multiple parcel states at a time using an array
 * @param ${array} coordinates - array of parcel state coordinates. If you need a single ParcelState, use "/api/parcelState/:id" or an array of a single element
 * @return {array}             - array of ParcelState objects
 */
app.post('/api/parcelState/group', server.handleRequest(getParcelStateGroup))

export function getParcelStateGroup(req) {
  const coordinates = server.extractFromReq(req, 'coordinates')
  const omittedProps = ['createdAt', 'updatedAt']

  // Point scan
  if (coordinates.length <= env.get('PARCEL_RANGE_THRESHOLD', 100)) {
    return ParcelState.findInCoordinates(coordinates).then(parcels =>
      omitInArray(parcels, omittedProps)
    )
  }

  // Range scan
  const xCoords = []
  const yCoords = []

  coordinates.forEach(coord => {
    const [x, y] = coordinatesUtils.toArray(coord)
    xCoords.push(parseInt(x, 10))
    yCoords.push(parseInt(y, 10))
  })

  const mincoords = [
    Math.min.apply(null, xCoords),
    Math.min.apply(null, yCoords)
  ]
  const maxcoords = [
    Math.max.apply(null, xCoords),
    Math.max.apply(null, yCoords)
  ]

  return ParcelState.inRange(mincoords, maxcoords)
    .then(parcels => parcels.filter(parcel => coordinates.includes(parcel.id)))
    .then(parcels => omitInArray(parcels, omittedProps))
}

/**
 * Parcel Range query, gets parcel states via max/min coordinates
 * @param  {string} mincoords - String with the format "x,y", which represents the lower coordinate bound
 * @param  {string} maxcoords - String with the format "x,y", which represents the upper coordinate bound
 * @return {array}            - array of ParcelState objects
 */
app.get(
  '/api/parcelState/range/:mincoords/:maxcoords',
  server.handleRequest(getParcelStateRange)
)

export function getParcelStateRange(req) {
  const mincoords = server.extractFromReq(req, 'mincoords')
  const maxcoords = server.extractFromReq(req, 'maxcoords')
  return ParcelState.inRange(mincoords, maxcoords)
}

/**
 * Retrieve the current version of the code.
 * @return {Object} object - three keys: `branch`, `short`, and `commit`,
 *                           holding the info of the current state of the git repo
 */
app.get('/api/version', server.handleRequest(getVersion))

export function getVersion(req) {
  return {
    branch: git.branch(),
    commit: git.long(),
    short: git.short()
  }
}

/**
 * Get all BidGroup objects
 * @return {array}             - array of BidGroup objects
 */
app.get('/api/bidgroup', server.handleRequest(getBidGroup))

export async function getBidGroup(req) {
  const offset = parseInt(req.query['offset'])
  const limit = parseInt(req.query['limit'])

  return await BidGroup.findAll({ offset, limit })
}

/**
 * Submit a BidGroup
 * @param  {object} bidgroup - BidGroup attributes
 * @return {boolean}         - Whether the operation was successfull or not
 */
app.post('/api/bidgroup', server.handleRequest(postBidGroup))

const bidMatch = '\\((-?\\d+),(-?\\d+)\\) for (\\d+) MANA'

function extractBids(data, address) {
  const regexp = new RegExp(bidMatch, 'gi')
  const result = []
  let match
  while ((match = regexp.exec(data))) {
    result.push({
      x: parseInt(match[1], 10),
      y: parseInt(match[2], 10),
      amount: parseInt(match[3], 10),
      address
    })
  }
  return result
}

export async function verifyBidGroup(data) {
  const { message, address } = verifyMessage(data.message, data.signature)

  return {
    bids: extractBids(message.toString(), address),
    address: address,
    message: data.message,
    signature: data.signature,
    nonce: data.nonce
  }
}

let lock = false
export async function postBidGroup(req) {
  const data = server.extractFromReq(req, 'bidGroup')
  let newBidGroup

  try {
    newBidGroup = await verifyBidGroup(data)
  } catch (error) {
    console.log(error.stack)
    throw new Error('Unable to verify signature')
  }

  if (!newBidGroup.bids) {
    throw new Error('Unable to extract data from request')
  }

  newBidGroup.receivedAt = new Date()

  while (lock) {
    await utils.sleep(100)
  }
  const time = new Date().getTime()
  lock = true
  await db.client.query('BEGIN')
  await db.client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')

  const { bidGroup, error } = await new BidService().processBidGroup(
    newBidGroup
  )

  if (error) {
    const serverError = new Error(`
      An error occurred trying to bid.
      Received: ${JSON.stringify(newBidGroup)}
      Error: ${JSON.stringify(error)}
    `)
    serverError.data = error
    try {
      await db.client.query('COMMIT')
    } catch (error) {
      console.log('Error saving info', bidGroup, error.stack)
      await db.client.connect()
    }
    lock = false
    throw serverError
  }

  await new BidReceiptService().sign(bidGroup)
  try {
    await db.client.query('COMMIT')
  } catch (error) {
    console.log('Error commiting!', bidGroup, error.stack)
  }
  console.log('[Server] Request handled in time:', new Date().getTime() - time)
  lock = false

  return true
}

/**
 * Get all projects
 * @return {array} - Project list
 */
app.get('/api/projects', server.handleRequest(getProjects))

export function getProjects(req) {
  return Project.find()
}

/**
 * Get useful stats regarding the entire auction
 * @return {object} - Each property is a new stat calculated for the supplied address
 */
app.get('/api/stats', server.handleRequest(getStats))

export function getStats(req) {
  return new StatsService().getGlobalSummary()
}

/**
 * Get useful stats for an address
 * @param  {string} address - User address
 * @return {object} - Each property is a new stat calculated for the supplied address
 */
app.get('/api/addressStats/:address', server.handleRequest(getAddressStats))

export function getAddressStats(req) {
  const address = server.extractFromReq(req, 'address')

  // 1. Locked balance transactions, and bonus received per month
  // 2. District contributions
  // 3. Winning bids
  // 4: final balance
  return new StatsService().getAddressSummary(address.toLowerCase())
}

/**
 * Register to an email notification service to be notified if you're outbid.
 * It supports either an address or a message+signature combo
 * @param  {string} address       - User address
 * @param  {string} message       - Unsubscribe message signed with the user address. Contains the user email
 * @param  {string} signature     - Signature generated for the message.
 * @param  {string} parcelStateId - Parcel state to watch
 * @return {boolean} - Wether the operation was successfull or not
 */
app.post(
  '/api/outbidNotification',
  server.handleRequest(postOutbidNotification)
)

const emailExtract = new RegExp(
  'Decentraland Auction: Subscribe ([^ ]+) \\(\\d+\\)'
)

function takeEmail(message) {
  const match = emailExtract.exec(message)
  return match && match[1]
}

export async function postOutbidNotification(req) {
  let address = null
  let email = null

  try {
    const reqAddress = server.extractFromReq(req, 'address')
    const addressState = await AddressState.findByAddress(reqAddress)

    address = addressState.address
    email = addressState.email
  } catch (error) {
    const message = server.extractFromReq(req, 'message')
    const signature = server.extractFromReq(req, 'signature')

    const extracted = verifyMessage(message, signature)

    address = extracted.address
    email = takeEmail(extracted.message.toString())
  }

  if (email) {
    await AddressState.update({ email }, { address })
    await new OutbidNotificationService().registerParcelNotifications(
      address,
      email
    )
  }

  return true
}

/**
 * Unregister an email to all notifications
 * @param  {string} message   - Unsubscribe message signed with the user address. Contains the user email
 * @param  {string} signature - Signature generated for the message.
 * @return {boolean}          - Wether the operation was successfull or not
 */

app.delete(
  '/api/outbidNotification',
  server.handleRequest(deleteOutbidNotification)
)

export async function deleteOutbidNotification(req) {
  const message = server.extractFromReq(req, 'message')
  const signature = server.extractFromReq(req, 'signature')

  const { address } = verifyMessage(message, signature)

  const addressState = await AddressState.findByAddress(address)

  await OutbidNotification.delete({ email: addressState.email })
  await AddressState.update({ email: null }, { id: addressState.id })

  return true
}

/**
 * Start the server
 */
if (require.main === module) {
  db
    .connect()
    .then(() => {
      httpServer.listen(SERVER_PORT, () =>
        console.log('Server running on port', SERVER_PORT)
      )
    })
    .catch(console.error)
}
