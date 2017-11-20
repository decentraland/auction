import { eth, env } from 'decentraland-commons'
import { BidReceipt } from '../models'

export default class BidReceiptService {
  constructor() {
    this.BidReceipt = BidReceipt
    this.ethUtils = eth.utils
  }

  async sign(bidGroup) {
    this.checkBidGroup(bidGroup)

    const receipt = {
      receivedAt: bidGroup.receivedAt,
      bidGroupId: bidGroup.id
    }

    const inserted = await this.BidReceipt.insert(receipt)
    const serverPrivKey = this.getServerPrivateKey()

    const serverMessage = this.getServerMessage({
      ...bidGroup,
      id: inserted.id
    })
    const serverSignature = this.ethUtils.localSign(
      serverMessage,
      serverPrivKey
    )

    await this.BidReceipt.update(
      { message: serverMessage, signature: serverSignature },
      { id: inserted.id }
    )
  }

  async verify(bidRecepit) {
    const pubkey = await this.recover(bidRecepit)
    const privkey = this.getServerPrivateKey()

    if (pubkey === this.ethUtils.privateToPublic(privkey)) {
      throw new Error('Invalid signature for message')
    }
  }

  async recover(bidRecepit) {
    const { message, signature } = bidRecepit
    const pubkey = this.ethUtils.localRecover(message, signature)

    return pubkey
  }

  getServerMessage(bidGroup) {
    return `${bidGroup.id}||${bidGroup.receivedAt.getTime()}||${bidGroup.message}`
  }

  getServerPrivateKey() {
    return env.get('SERVER_PRIVATE_KEY', () => {
      throw new Error('Missing server address to sign: SERVER_PRIVATE_KEY')
    })
  }

  checkBidGroup(bidGroup) {
    const required = ['id', 'message', 'receivedAt']

    if (!required.every(prop => bidGroup[prop])) {
      throw new Error(
        '"Can\'t sign an invalid bid group. Missing properties, the bid group has to have at least an id, message an receivedAt properties"'
      )
    }
    if (typeof bidGroup.message !== 'string') {
      throw new Error('"Can\'t sign an invalid bid group. Invalid message."')
    }
  }
}
