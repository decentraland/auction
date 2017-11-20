import { expect } from 'chai'
import { eth } from 'decentraland-commons'

import db from '../src/lib/db'
import { BuyTransaction } from '../src/lib/models'

/* Returns TRUE if the first specified array contains all elements
 * from the second one. FALSE otherwise.
 *
 * @param {array} superset
 * @param {array} subset
 *
 * @returns {boolean}
 */
function arrayContainsArray(superset, subset) {
  return subset.every(function(value) {
    return superset.indexOf(value) >= 0
  })
}

describe('BuyTransaction', () => {
  const txIds = [
    '0x35da9fef68fe6270486856eff5081568fa8f7dceb9b11853127785ed0345dc32',
    '0xeae597a828caf5e032ccb4047c8f22b96e5214a0a8d9548d179baf69c623179a',
    '0xf20bcedfd86c1147d13c475253446dbd52c05a8cec5eb6aca7439e9c4ebdca57',
    '0x7b2b127407fd583441461534819be5a4cd12b0e3e79bd1febbd0c04be7ccd694'
  ]
  const pendingTxIds = [txIds[0], txIds[1]]
  const addresses = ['0xdead', '0xffff', '0xbeef']
  const parcelIds = [
    [
      '23,23',
      '24,24',
      '25,25',
      '26,26',
      '27,27',
      '28,28',
      '29,29',
      '30,30',
      '31,31',
      '32,32',
      '33,33',
      '34,34',
      '35,35',
      '36,36',
      '37,37',
      '38,38',
      '39,39',
      '40,40',
      '41,41',
      '42,42'
    ],
    [
      '1000,1000',
      '1001,1001',
      '1002,1002',
      '1003,1003',
      '1004,1004',
      '1005,1005',
      '1006,1006',
      '1007,1007',
      '1008,1008',
      '1009,1009'
    ],
    ['2000,2000', '3000,3000'],
    ['8000,8000', '9000,9000']
  ]

  before(async () => {
    await BuyTransaction.insert({
      txId: txIds[0],
      address: addresses[0],
      parcelStatesIds: parcelIds[0],
      totalCost: '2000000000000000000000',
      status: 'pending'
    })
    await BuyTransaction.insert({
      txId: txIds[1],
      address: addresses[1],
      parcelStatesIds: parcelIds[1],
      totalCost: '1000000000000000000000',
      status: 'pending'
    })
    await BuyTransaction.insert({
      txId: txIds[2],
      address: addresses[0],
      parcelStatesIds: parcelIds[2],
      totalCost: '5000000000000000000000',
      status: 'completed'
    })
    await BuyTransaction.insert({
      txId: txIds[3],
      address: addresses[2],
      parcelStatesIds: parcelIds[3],
      totalCost: '4000000000000000000000',
      status: 'error'
    })
  })

  describe('.findAllPendingTxIds', async () => {
    it('should get an array of pending tx ids', async () => {
      const txIds = await BuyTransaction.findAllPendingTxIds()
      expect(txIds.length).to.be.equal(pendingTxIds.length)

      const isContained = arrayContainsArray(txIds, pendingTxIds)
      expect(isContained).to.be.true
    })
  })

  describe('.findProcessedParcels', () => {
    it('should get an array of processed parcel ids', async () => {
      const processedParcelIds = await BuyTransaction.findProcessedParcels(
        addresses[0]
      )
      const isContained = arrayContainsArray(
        [...parcelIds[0], ...parcelIds[2]],
        processedParcelIds
      )
      expect(isContained).to.be.true
    })
  })

  describe('.totalBurnedMANAByAddress', () => {
    it('should get total MANA burned for a certain address', async () => {
      const total = await BuyTransaction.totalBurnedMANAByAddress(addresses[0])
      expect(total.equals(eth.utils.toBigNumber(7000000000000000000000))).to.be
        .true
    })
  })

  after(async () => {
    await Promise.all(
      addresses.map(address => BuyTransaction.delete({ address }))
    )
  })
})
