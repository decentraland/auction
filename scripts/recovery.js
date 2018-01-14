#!/usr/bin/env babel-node

import { eth, env, Log } from 'decentraland-commons'
import db from '../src/lib/db'
import { BuyTransaction } from '../src/lib/models'
import LANDRegistry from './contracts/LANDRegistry'

const log = new Log('Recovery')

env.load()

// [Event format]
// { address: '0x36fc2821c1dba31ed04682b2277c89f33fd885b7',
//   blockNumber: 4897104,
//   transactionHash: '0xa688db591f6c8cee60e7e158cfab0eb488623a685394e6d90c6fabdc8f165004',
//   transactionIndex: 62,
//   blockHash: '0x9f0f4697d8206f95ef38692b27a006fa7dc68662c969c91fcfa916da541d19e9',
//   logIndex: 78,
//   removed: false,
//   event: 'Create',
//   args:
//    { holder: '0x96d31ea8f5fcedd859fc2db6e5b4c83bbb3181cb',
//      assetId: [BigNumber],
//      operator: '0x52e4e32428c123a1f83da9839f139734a5a5b2b9',
//      data: '' } },

const txMap = {}

const insertTxs = async txs => {
  for (const tx of txs) {
    try {
      const buyTx = await BuyTransaction.find({ txId: tx.txId })
      if (!buyTx) {
        await BuyTransaction.insert(tx)
        log.info(`[INSERT] tx: ${tx.txId}`)
      } else {
        log.info(`[SKIP] tx: ${tx.txId}`)
      }
    } catch (err) {
      log.error(err)
    }
  }
}

const onNewEvent = async (contract, event) => {
  try {
    const txId = event.transactionHash
    const parcelId = await contract
      .decodeTokenId(event.args.assetId)
      .then(coords => {
        const [x, y] = coords
        return [x.toString(), y.toString()].join(',')
      })

    if (!(txId in txMap)) {
      const receipt = await eth.fetchTxReceipt(txId)
      txMap[txId] = {
        txId: txId,
        receipt: receipt,
        status: 'completed',
        totalCost: '',
        address: event.args.holder,
        parcelStatesIds: [parcelId]
      }
    } else {
      txMap[txId].parcelStatesIds.push(parcelId)
    }
  } catch (err) {
    log.error(err)
  }
}

const watch = contract => {
  const fn = async (err, results) => {
    if (err) {
      log.error(err)
      return
    }

    for (let i = 0; i < results.length; i++) {
      await onNewEvent(contract, results[i])
    }

    // insert txs
    await insertTxs(Object.values(txMap))
  }
  return fn
}

async function main() {
  try {
    // init
    await db.connect()

    // ethereum
    const connected = await eth.connect(null, [LANDRegistry], {
      httpProviderUrl: 'http://127.0.0.1:8545'
    })
    if (!connected) {
      throw new Error('Error while connecting to Ethereum')
    }

    // contract
    const contract = eth.getContract('LANDRegistry')
    const createEvent = contract.instance.Create(
      {},
      {
        fromBlock: 0,
        toBlock: 'latest',
        address: '0x36fc2821c1dba31ed04682b2277c89f33fd885b7'
      }
    )

    // get events
    createEvent.get(watch(contract))
  } catch (err) {
    log.error(err)
  }
}

main()
