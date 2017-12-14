import { eth } from 'decentraland-commons'

export default function verifyMessage(message, signature) {
  const ethUtils = eth.utils.ethereumJsUtils

  const decodedMessage = new Buffer(message.substr(2), 'hex')
  const decodedSignature = ethUtils.fromRpcSig(
    new Buffer(signature.substr(2), 'hex')
  )

  const pubkey = ethUtils.ecrecover(
    ethUtils.hashPersonalMessage(decodedMessage),
    decodedSignature.v,
    decodedSignature.r,
    decodedSignature.s
  )

  const address = '0x' + ethUtils.pubToAddress(pubkey).toString('hex')

  return { address, message: decodedMessage }
}
