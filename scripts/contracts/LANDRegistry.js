import { Contract, Log, env } from 'decentraland-commons'
import { abi } from './LANDRegistry.json'

const log = new Log('LANDRegistry')
let instance = null

/** LANDRegistry contract class */
class LANDRegistry extends Contract {
  static getInstance() {
    if (!instance) {
      instance = new LANDRegistry(
        'LANDRegistry',
        env.get('REGISTRY_ADDRESS', name => {
          return env.get('REACT_APP_REGISTRY_ADDRESS', () => {
            if (env.isProduction()) {
              throw new Error(
                'Missing REGISTRY_ADDRESS or REACT_APP_REGISTRY_ADDRESS'
              )
            }
            return '0x9519216b1d15a91e71e8cfa17cc45bcc7707e500'
          })
        }),
        abi
      )
    }
    return instance
  }

  ownerOfLand(x, y) {
    return this.call('ownerOfLand', x, y)
  }

  decodeTokenId(value) {
    return this.call('decodeTokenId', value)
  }

  assignNewParcel(x, y, address, opts = {}) {
    log.info(`(assigning) (${x},${y}) land parcel to ${address}`)
    return this.transaction(
      'assignNewParcel',
      x,
      y,
      address,
      Object.assign({}, { gas: 4000000, gasPrice: 28 * 1e9 }, opts)
    )
  }

  assignMultipleParcels(x, y, address, opts = {}) {
    log.info(`(assigning) ${x.length} land parcels to ${address}`)
    return this.transaction(
      'assignMultipleParcels',
      x,
      y,
      address,
      Object.assign({}, { gas: 4000000, gasPrice: 28 * 1e9 }, opts)
    )
  }
}

module.exports = LANDRegistry
