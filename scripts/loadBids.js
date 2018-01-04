#!/usr/bin/env babel-node

import minimist from 'minimist'
import { eth, env, Log } from 'decentraland-commons'
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

const DEFAULT_BATCH_SIZE = 20

const setIntervalAndExecute = (fn, t) => {
  fn()
  return setInterval(fn, t)
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

  eth.web3.eth.getBlock(blockHash, (err, block) => {
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

const updateReturnMANA = async address => {
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
      throw new Error(`${address} balance mismatch`)
    }

    // calculate withdrawn amount
    const returnTxs = await ReturnTransaction.findAllByAddress(address)
    const withdrawnAmountWei = returnTxs
      .map(tx => eth.utils.toBigNumber(tx.amount))
      .reduce((sum, value) => sum.plus(value), eth.utils.toBigNumber(0))

    // calculate return amount
    const returnAmountWei =
      initialBalance > 0
        ? eth.web3
            .toWei(
              eth.utils
                .toBigNumber(lockedInContract)
                .div(eth.utils.toBigNumber(initialBalance))
                .mul(eth.utils.toBigNumber(currentBalance))
            )
            .truncated()
        : 0

    // update state
    await AddressState.update(
      {
        returnAmount: returnAmountWei.toString(10),
        withdrawnAmount: withdrawnAmountWei.toString(10)
      },
      { address }
    )
    log.info(
      `(update) [${address}]\n\tinContract:${lockedInContract} districts:${totalLandMANA} initial:${initialBalance} spent:${bidding} current:${currentBalance}\n\treturnAmount:${returnAmountWei.toString(
        10
      )} withdrawnAmount:${withdrawnAmountWei.toString(10)}`
    )
  } catch (err) {
    log.error(err.message)
  }
}

const updateAllReturnMANA = async () => {
  try {
    const addresses = await AddressState.findAllAddresses()
    for (const address of addresses) {
      await updateReturnMANA(address)
    }
  } catch (err) {
    log.error(err)
  }
}

const returnMANA = async (contract, address) => {
  try {
    const addressState = await AddressState.findByAddress(address)

    // calculate remaining MANA to return
    const returnAmountWei = eth.utils.toBigNumber(addressState.returnAmount)
    const withdrawnAmountWei = eth.utils.toBigNumber(
      addressState.withdrawnAmount
    )
    const remainingAmountWei = returnAmountWei.minus(withdrawnAmountWei)

    // total MANA to return
    log.info(
      `(return) [${address}] remaining(${remainingAmountWei.toString(10)})`
    )

    // send tx
    log.info(`(return) [${address}] = ${remainingAmountWei.toString(10)}`)
    const txId = await contract.transferBackMANA(address, remainingAmountWei)
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

const returnAllMANA = async contract => {
  try {
    await updateAllReturnMANA()

    const addresses = await AddressState.findAllAddresses()
    for (const address of addresses) {
      await returnMANA(contract, address)
    }
  } catch (err) {
    log.error(err)
  }
}

const parseArgs = () =>
  minimist(process.argv.slice(2), {
    string: ['loadaddress', 'returnaddress'],
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

    const contract = eth.getContract('LANDTerraformSale')
    log.info(`Using LANDTerraformSale contract at address ${contract.address}`)

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
    } else if (argv.returnallmana === true) {
      setupBlockWatch('latest', ReturnTransaction)
      await returnAllMANA(contract)
    } else if (argv.returnaddress) {
      setupBlockWatch('latest', ReturnTransaction)
      await returnMANA(contract, argv.returnaddress)
    } else if (argv.returnupdate === true) {
      await updateAllReturnMANA()
      process.exit(0)
    } else {
      console.log(
        'Invalid command. \nAvailable commands: \n\t--verifybuys\n\t--verifyreturns\n\t--load\n\t--loadaddress\n\t--returnallmana\n\t--returnupdate'
      )
      process.exit(0)
    }
  } catch (err) {
    log.error(err)
  }
}

main()
