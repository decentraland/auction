#!/usr/bin/env babel-node

import fs from 'fs'
import minimist from 'minimist'
import { utils, eth, env, Log } from 'decentraland-commons'
import db from '../src/lib/db'
import LANDRegistry from './contracts/LANDRegistry'
import {
  AddressState,
  BuyTransaction,
  ParcelState,
  ReturnTransaction
} from '../src/lib/models'
import AddressService from '../src/lib/services/AddressService'

const sleep = utils.sleep
const log = new Log('LoadBids')

env.load()

const DEFAULT_BATCH_SIZE = 10

const setIntervalAndExecute = (fn, t) => {
  fn()
  return setInterval(fn, t)
}

import inquirer from 'inquirer'
async function confirm(text) {
  const res = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: text,
    default: false
  })

  return res.confirm
}

// tx queue management

class TxQueue {
  constructor() {
    this.queue = []
  }

  addPendingTx(txId) {
    log.info(`(queue) Add pending tx : ${txId}`)
    this.queue.push(txId)
  }

  delPendingTx(txId) {
    log.info(`(queue) Del pending tx : ${txId}`)
    this.queue.splice(this.queue.indexOf(txId), 1)
  }

  isPendingTx(txId) {
    return this.queue.indexOf(txId) > -1
  }

  get length() {
    return this.queue.length
  }
}

const txQueue = new TxQueue()

// event handling

const printState = () => {
  log.info(`(state) Pending transactions: ${txQueue.length}`)
}

const onNewBlock = (blockHash, watchedModel) => {
  log.info(`(block) Found new block ${blockHash}`)
  printState()

  eth.getBlock(blockHash, (err, block) => {
    if (err || !block) {
      log.error(err)
      return
    }

    block.transactions.forEach(async txId => {
      try {
        if (txQueue.isPendingTx(txId)) {
          txQueue.delPendingTx(txId)

          const receipt = await eth.fetchTxReceipt(txId)
          await watchedModel.update(
            { receipt, status: receipt.status == 1 ? 'completed' : 'error' },
            { txId }
          )
          log.info(`(tx) Saved receipt for tx : ${txId}`)
        }
      } catch (err) {
        log.error(err)
      }
    })
  })
}

const setupBlockWatch = (options, watchedModel) => {
  log.info('(watch) Setting up event filter for new blocks')
  const filter = eth.setupFilter(options)

  filter.watch((err, blockHash) => {
    if (err) {
      log.error(err)
      return
    }

    onNewBlock(blockHash, watchedModel)
  })

  return filter
}

const buildBuyTxData = (address, parcels) => {
  const X = parcels.map(parcel => parcel.x)
  const Y = parcels.map(parcel => parcel.y)

  return { address, X, Y }
}

const fetchAllAssigned = async (contract, address, sendParcels) => {
  const result = {}
  await Promise.all(
    sendParcels.map(async parcel => {
      const owner = await contract.ownerOfLand(parcel.x, parcel.y)
      if (owner.toLowerCase() !== address) {
        result[`${parcel.x},${parcel.y}`] = true
      }
    })
  )
  return result
}

const findParcelsToBuy = async (contract, address, batchSize) => {
  try {
    // get parcels for address
    const parcels = await ParcelState.findByAddress(address)

    // get already done parcels for address
    const doneParcels = await BuyTransaction.findProcessedParcels(address)

    // select parcels to send
    let sendParcels = parcels.filter(e => !doneParcels.includes(e.id))

    // check on network if token already assigned
    const assignedOnes = await fetchAllAssigned(contract, address, sendParcels)

    sendParcels = sendParcels
      .filter(e => assignedOnes[`${e.x},${e.y}`])
      .splice(0, batchSize)
    log.info(
      `(proc) [${address}] Progress => ${doneParcels.length} out of ${parcels.length} = selected ${sendParcels.length}\n${sendParcels.map(
        e => e.x
      )};${sendParcels.map(y => y.y)}`
    )
    return sendParcels
  } catch (err) {
    log.error(err)
    return []
  }
}

const loadParcelsForAddress = async (contract, address, batchSize) => {
  try {
    if (!address) {
      throw new Error(`(proc) [${address}] Empty or invalid address`)
    }
    log.info(`(proc) [${address}] Processing bids for address...`)
    let sendParcels

    /* eslint-disable no-constant-condition */
    while (true) {
      /* eslint-enable no-constant-condition */
      sendParcels = await findParcelsToBuy(contract, address, batchSize)

      // no more parcels to send
      if (sendParcels.length === 0) {
        log.info(`(proc) [${address}] Sent all parcels for address`)
        break
      }

      // build TX data
      const txData = await buildBuyTxData(address, sendParcels)

      // broadcast transaction
      eth.web3.personal.unlockAccount(eth.getAddress(), 'asdfqwer1234', 1000)
      const txId = await contract.assignMultipleParcels(
        txData.X,
        txData.Y,
        txData.address,
        {
          gas: 3000000,
          gasPrice: 17e9
        }
      )
      txQueue.addPendingTx(txId)
      log.info(`(proc) [${address}] Broadcasted tx : ${txId}`)

      // save transaction
      const parcelStatesIds = sendParcels.map(parcel => parcel.id)
      await BuyTransaction.insert({
        txId,
        address,
        parcelStatesIds,
        totalCost: '',
        status: 'pending'
      })
      log.info(`(proc) [${address}] Saved tx : ${txId}`)
      while (txQueue.length > 4) {
        await sleep(1000)
      }
    }
  } catch (err) {
    log.info(err)
  }
}

const verifyPendingTxs = async watchedModel => {
  try {
    // setup watch for mined txs
    const pendingTxIds = await watchedModel.findAllPendingTxIds()
    log.info(`(tx) Total number of TXs to verify: ${pendingTxIds.length}`)

    for (const txId of pendingTxIds) {
      const receipt = await eth.fetchTxReceipt(txId)

      if (receipt === null) {
        log.info(`(tx) [${txId}] pending`)
      } else if (receipt.status == 0) {
        log.info(`(tx) [${txId}] error`)
        await watchedModel.update({ receipt, status: 'error' }, { txId })
      } else if (receipt.status == 1) {
        log.info(`(tx) [${txId}] completed`)
        await watchedModel.update({ receipt, status: 'completed' }, { txId })
      } else {
        log.info(`(tx) [${txId}] ${receipt.status}`)
      }
    }
  } catch (err) {
    log.error(err)
  }
}

const watchPendingTxs = (watchedModel, time) => {
  setIntervalAndExecute(() => verifyPendingTxs(watchedModel), time)
}

const loadAllParcels = async (contract, batchSize) => {
  try {
    // get all addresses with bids
    const rows = await ParcelState.findAllAddresses()
    log.info(`(proc) Got ${rows.length} addresses with winning bids`)

    for (const row of rows) {
      await loadParcelsForAddress(contract, row.address, batchSize)
      while (txQueue.length > 4) {
        await sleep(1000)
      }
    }
    while (txQueue.length > 4) {
      await sleep(1000)
    }
  } catch (err) {
    log.error(err)
  }
}

const parseArgs = () =>
  minimist(process.argv.slice(2), {
    string: ['loadaddress', 'returnmanaaddress', 'returnmanabatch'],
    default: {
      nbatch: DEFAULT_BATCH_SIZE
    }
  })

async function main() {
  try {
    // args
    const argv = parseArgs()

    // init
    await db.connect()
    await eth.connect('', [LANDRegistry], {
      httpProviderUrl: 'http://localhost:18545'
    })

    const contract = eth.getContract('LANDRegistry')
    log.info(`Using LANDRegistry contract at address ${contract.address}`)

    // commands
    if (argv.verifybuys === true) {
      await watchPendingTxs(BuyTransaction, 30000)
    } else if (argv.load === true) {
      setupBlockWatch('latest', BuyTransaction)
      await loadAllParcels(contract, argv.nbatch)
    } else if (argv.loadaddress) {
      setupBlockWatch('latest', BuyTransaction)
      await loadParcelsForAddress(contract, argv.loadaddress, argv.nbatch)
    } else {
      console.log(
        'Invalid command. \nAvailable commands: \n\t--verifybuys\n\t--verifyreturns\n\t--load\n\t--loadaddress\n\t--returnmanaall\n\t--returnmanaaddress\n\t--returnmanabatch\n\t--returnmanaupdate'
      )
      process.exit(0)
    }
  } catch (err) {
    log.error(err)
  }
}

main()
