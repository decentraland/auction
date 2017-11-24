import React from 'react'
import PropTypes from 'prop-types'

import { preventDefault } from '../../lib/util'
import { ONE_LAND_IN_MANA } from '../../lib/land'
import { stateData } from '../../lib/propTypes'
import pendingBidsUtils from '../../lib/pendingBidsUtils'

import Modal from './Modal'
import Button from '../Button'
import Loading from '../Loading'

import './BidParcelModal.css'

export default class BidParcelModal extends React.Component {
  static propTypes = {
    ...Modal.propTypes,
    parcel: PropTypes.object.isRequired,
    addressState: stateData(PropTypes.object).isRequired,
    pendingConfirmationBids: stateData(PropTypes.array).isRequired,
    onBid: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      bidValue: ONE_LAND_IN_MANA
    }

    let { pendingConfirmationBids } = props

    // Cache for later use
    this.pendingManaBalance = pendingBidsUtils.getTotalManaBidded(
      pendingConfirmationBids.data
    )
  }

  onBid = event => {
    const { bidValue } = this.state
    const { onBid } = this.props

    if (this.isValidBid(bidValue)) {
      onBid(bidValue)
    }
  }

  onBidValueChange = event => {
    const bidValue = parseFloat(event.currentTarget.value, 10)
    this.setState({ bidValue: bidValue || ONE_LAND_IN_MANA })
  }

  isValidBid(bidValue) {
    // We don't use `getCurrentBidValue` here because if the parcel doesn't have a bid yet,
    // we want to be able to bid ONE_LAND_IN_MANA
    const parcelAmount = this.props.parcel.amount || 0
    const manaBalance = this.getManaBalance()

    return (
      bidValue >= ONE_LAND_IN_MANA &&
      bidValue > parcelAmount &&
      bidValue <= manaBalance
    )
  }

  getManaBalance() {
    const { addressState } = this.props

    if (!addressState.loading) {
      return addressState.data.balance
    }
  }

  renderBidForm() {
    const { onClose } = this.props
    const manaBalance = this.getManaBalance()

    return manaBalance >= ONE_LAND_IN_MANA ? (
      <BidForm
        currentBidValue={this.getCurrentBidValue()}
        manaBalance={manaBalance}
        onBid={preventDefault(this.onBid)}
        onBidValueChange={this.onBidValueChange}
        onClose={onClose}
      />
    ) : (
      <p className="text">You don&#39;t have enough balance to bid.</p>
    )
  }

  getCurrentBidValue() {
    const { parcel } = this.props
    return parcel.amount || ONE_LAND_IN_MANA
  }

  render() {
    const { parcel, addressState, onClose, ...props } = this.props

    return (
      <Modal className="BidParcelModal" onClose={onClose} {...props}>
        <div className="modal-body">
          <p className="text">
            You are bidding on the LAND {parcel.x},{parcel.y}.
            <br />
            The minimum bid is {this.getCurrentBidValue()} MANA.
            <br />
            {this.pendingManaBalance
              ? `You have ${this.pendingManaBalance} MANA pending.`
              : ''}
          </p>

          {addressState.loading ? <Loading /> : this.renderBidForm()}
        </div>
      </Modal>
    )
  }
}

function BidForm({
  currentBidValue,
  manaBalance,
  onBid,
  onBidValueChange,
  onClose
}) {
  return (
    <form action="POST" onSubmit={onBid}>
      <div className="manaInput">
        <span className="text">{ONE_LAND_IN_MANA}</span>
        <input
          type="number"
          required="required"
          placeholder="Mana to bid"
          className="manaToBid"
          autoFocus={true}
          min={ONE_LAND_IN_MANA}
          value={currentBidValue}
          max={manaBalance}
          onChange={onBidValueChange}
        />
        <span className="text">{manaBalance}</span>
      </div>

      <div className="buttons">
        <Button type="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="primary" isSubmit={true}>
          Bid
        </Button>
      </div>
    </form>
  )
}
