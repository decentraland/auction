#!/usr/bin/env babel-node

import fs from 'fs'
import minimist from 'minimist'
import { utils, eth, env, Log } from 'decentraland-commons'
import db from '../src/lib/db'
import {
  AddressState,
  BuyTransaction,
  ParcelState,
  ReturnTransaction
} from '../src/lib/models'
import AddressService from '../src/lib/services/AddressService'

const log = new Log('LoadBids')

env.load()

const DEFAULT_BATCH_SIZE = 50

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
  // This should be stored as WEI in the database
  const totalCost = parcels
    .map(parcel => eth.utils.toBigNumber(parcel.amount))
    .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0))

  log.info(
    `(proc) [${address}] ${parcels.length} bids found = total cost: ${totalCost}`
  )
  log.info(`(proc) [${address}] X- > ${JSON.stringify(X)}`)
  log.info(`(proc) [${address}] Y -> ${JSON.stringify(Y)}`)

  return { address, X, Y, totalCost }
}

const findParcelsToBuy = async (address, batchSize) => {
  try {
    // get parcels for address
    const parcels = await ParcelState.findByAddress(address)

    // get already done parcels for address
    const doneParcels = await BuyTransaction.findProcessedParcels(address)

    // select parcels to send
    const sendParcels = parcels
      .filter(e => !doneParcels.includes(e.id))
      .splice(0, batchSize)

    log.info(
      `(proc) [${address}] Progress => ${doneParcels.length} out of ${parcels.length} = selected ${sendParcels.length}`
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
      sendParcels = await findParcelsToBuy(address, batchSize)

      // no more parcels to send
      if (sendParcels.length === 0) {
        log.info(`(proc) [${address}] Sent all parcels for address`)
        break
      }

      // build TX data
      const txData = await buildBuyTxData(address, sendParcels)

      // broadcast transaction
      const txId = await contract.buyMany(
        txData.address,
        txData.X,
        txData.Y,
        txData.totalCost
      )
      txQueue.addPendingTx(txId)
      log.info(`(proc) [${address}] Broadcasted tx : ${txId}`)

      // save transaction
      const parcelStatesIds = sendParcels.map(parcel => parcel.id)
      await BuyTransaction.insert({
        txId,
        address,
        parcelStatesIds,
        totalCost: txData.totalCost.toString(10),
        status: 'pending'
      })
      log.info(`(proc) [${address}] Saved tx : ${txId}`)
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
      } else if (receipt.status === 0) {
        log.info(`(tx) [${txId}] error`)
        await watchedModel.update({ receipt, status: 'error' }, { txId })
      } else if (receipt.status === 1) {
        log.info(`(tx) [${txId}] completed`)
        await watchedModel.update({ receipt, status: 'completed' }, { txId })
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
    }
  } catch (err) {
    log.error(err)
  }
}

const returnMANAUpdate = async address => {
  try {
    const addressService = new AddressService()

    // validate balance
    const {
      initialBalance,
      currentBalance,
      bidding,
      lockedInContract,
      totalLandMANA,
      isMatch
    } = await addressService.checkBalance(address)
    if (!isMatch) {
      log.info(
        `(update) [${address}]\n\tinContract:${lockedInContract} districts:${totalLandMANA} initial:${initialBalance} spent:${bidding} current:${currentBalance}`
      )
      throw new Error(`${address} balance mismatch`)
    }

    // calculate withdrawn amount
    const returnTxs = await ReturnTransaction.findAllByAddress(address)
    const withdrawnAmountWei = returnTxs
      .map(tx => eth.utils.toBigNumber(tx.amount))
      .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0))

    // calculate return amount
    const totalForGenesis = eth.utils
      .toBigNumber(lockedInContract)
      .minus(eth.utils.toBigNumber(totalLandMANA))

    const returnAmountWei =
      initialBalance > 0
        ? eth.utils
            .toWei(
              eth.utils
                .toBigNumber(currentBalance)
                .div(eth.utils.toBigNumber(initialBalance))
                .mul(totalForGenesis)
            )
        : 0

    // update state
    await AddressState.update(
      {
        returnAmount: returnAmountWei.toString(10),
        withdrawnAmount: withdrawnAmountWei.toString(10)
      },
      { address }
    )
    // log.info(
    //   `(update) [${address}]\n\tinContract:${lockedInContract} districts:${totalLandMANA} initial:${initialBalance} spent:${bidding} current:${currentBalance}\n\treturnAmount:${returnAmountWei.toString(
    //     10
    //   )} withdrawnAmount:${withdrawnAmountWei.toString(10)}`
    // )
  } catch (err) {
    log.error(err.message)
  }
}

// calculate remaining MANA to return
const calculateRemainingAmount = async(addressState) => {
  const returnAmountWei = eth.utils.toBigNumber(addressState.returnAmount)
  const returnTxs = await ReturnTransaction.findAllByAddress(addressState.address)
  if (!returnTxs.length) {
    return returnAmountWei
  }
  const withdrawnAmountWei = returnTxs
    .map(tx => eth.utils.toBigNumber(tx.amount))
    .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0))
  return returnAmountWei.minus(withdrawnAmountWei)
}

const returnMANAUpdateAll = async () => {
  try {
    const addresses = await AddressState.findAllAddresses()
    for (const address of addresses) {
      await returnMANAUpdate(address)
    }
  } catch (err) {
    log.error(err)
  }
}

const returnMANAAddress = async (contract, address) => {
  try {
    await returnMANAUpdate(address)

    const addressState = await AddressState.findByAddress(address)

    // calculate remaining MANA to return
    const remainingAmountWei = calculateRemainingAmount(addressState)

    // total MANA to return
    log.info(
      `(return) [${address}] remaining(${remainingAmountWei.toString(10)})`
    )
    if (remainingAmountWei == 0) {
      throw new Error(`(return) [${address}] no amount to return`)
    }

    // send tx
    log.info(`(return) [${address}] = ${remainingAmountWei.toString(10)}`)
    await eth.web3.personal.unlockAccount(eth.getAddress(), 'asdfqwer1234', 100000)
    const txId = await contract.transferBackMANA(
      address,
      remainingAmountWei, {
        gas: 2000000,
        gasPrice: 80 * 1e9
      }
    )
    txQueue.addPendingTx(txId)

    // save in db
    log.info(`(return) [${address}] Broadcasted tx : ${txId}`)
    await ReturnTransaction.insert({
      txId,
      address,
      amount: remainingAmountWei.toString(10),
      status: 'pending'
    })
  } catch (err) {
    log.error(err)
  }
}

const returnMANABatch = async (contract, filename) => {
  try {
    // open addresses file
    const addresses = fs
      .readFileSync(filename, 'utf8')
      .split('\n')
      .map(address => address.toLowerCase())

    // refresh amounts
    for (const address of addresses) {
      await returnMANAUpdate(address)
    }

    return await returnMANABatchAddresses(contract, addresses)

  } catch (err) {
    log.error(err)
  }
}

const returnMANABatchAddresses = async (contract, addresses) => {
  try {
    // match with addresses from db
    const addressStates = (await Promise.all(
      addresses.map(address => AddressState.findByAddress(address))
    )).filter(e => e !== undefined)

    // filter out address with no amounts to return
    const sendAddresses = []
    const amounts = []
    await Promise.all(addressStates.map(async(state) => {
      const amount = await calculateRemainingAmount(state)
      if (amount > 0) {
        sendAddresses.push(state.address)
        amounts.push(amount)
      }
    }))

    // bail out if no addresses with funds
    if (sendAddresses.length === 0) {
      log.warn('(return) No addresses with funds to return')
      return
    }

    // send tx
    log.info(`(return) About to send MANA to ${sendAddresses.length} addresses`)
    for (let i = 0; i < sendAddresses.length; i++) {
      console.log(`${sendAddresses[i]}, ${amounts[i]}`)
    }
    await eth.web3.personal.unlockAccount(eth.getAddress(), 'asdfqwer1234', 100000)
    const txId = await contract.transferBackMANAMany(
      sendAddresses,
      amounts, {
        gas: 2000000,
        gasPrice: 80 * 1e9
      }
    )
    txQueue.addPendingTx(txId)

    // save in db
    log.info(`(return) Broadcasted tx : ${txId}`)
    for (let i = 0; i < sendAddresses.length; i++) {
      await ReturnTransaction.insert({
        txId,
        address: sendAddresses[i],
        amount: amounts[i].toString(10),
        status: 'pending'
      })
    }
  } catch (err) {
    log.error(err.message, err.stack)
    process.exit(1)
  }
}

const returnMANAAll = async contract => {
  try {
    await returnMANAUpdateAll()

    const addressesList = await AddressState.findAll()

    const addresses = []
    await Promise.all(addressesList.map(async(state) => {
      const amount = await calculateRemainingAmount(state)
      if (amount.toString(10) > 0) {
        addresses.push(state.address)
      }
    }))

    let batch = []

    for (const address of addresses) {
      batch.push(address)
    }
        await returnMANABatchAddresses(contract, batch)
        batch = []
        while (txQueue.length) {
          log.info('Waiting for confirmation...')
          await utils.sleep(1000)
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
    await eth.connect('', '', { httpProviderUrl: 'http://localhost:18545' })

    const contract = eth.getContract('ReturnMANA')
    log.info(`Using ReturnMANA contract at address ${contract.address}`)

    // commands
    if (argv.verifybuys === true) {
      await watchPendingTxs(BuyTransaction, 30000)
    } else if (argv.verifyreturns === true) {
      await watchPendingTxs(ReturnTransaction, 30000)
    } else if (argv.load === true) {
      setupBlockWatch('latest', BuyTransaction)
      await loadAllParcels(contract, argv.nbatch)
    } else if (argv.loadaddress) {
      setupBlockWatch('latest', BuyTransaction)
      await loadParcelsForAddress(contract, argv.loadaddress, argv.nbatch)
    } else if (argv.returnmanaall === true) {
      setupBlockWatch('latest', ReturnTransaction)
      await returnMANAAll(contract)
    } else if (argv.returnmanaaddress) {
      setupBlockWatch('latest', ReturnTransaction)
      await returnMANAAddress(contract, argv.returnmanaaddress)
    } else if (argv.returnmanabatch) {
      setupBlockWatch('latest', ReturnTransaction)
      await returnMANABatch(contract, argv.returnmanabatch)
    } else if (argv.returnmanaupdate === true) {
      await returnMANAUpdateAll()
      process.exit(0)
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
