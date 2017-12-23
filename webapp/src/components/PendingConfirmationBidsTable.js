import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { distanceInWordsToNow } from '../lib/dateUtils'
import { preventDefault, buildCoordinate, shortenAddress } from '../lib/util'
import * as pendingBidsUtils from '../lib/pendingBidsUtils'
import { stateData } from '../lib/propTypes'

import locations from '../locations'

import Button from './Button'
import Icon from './Icon'

import './PendingConfirmationBidsTable.css'

export default class PendingConfirmationBidsTable extends React.Component {
  static propTypes = {
    pendingConfirmationBids: stateData(PropTypes.array).isRequired,
    onConfirmBids: PropTypes.func.isRequired,
    onEditBid: PropTypes.func.isRequired,
    onDeleteBid: PropTypes.func.isRequired,
    onClearAll: PropTypes.func.isRequired
  }

  getTotalMana() {
    const { pendingConfirmationBids } = this.props

    return pendingBidsUtils.getTotalManaBidded(pendingConfirmationBids.data)
  }

  getErrorMessage() {
    const { error } = this.props.pendingConfirmationBids

    let message = null

    switch (error.code) {
      case 'INCOMPLETE_DATA':
        message =
          'Your Bid seems to be invalid, please try again refreshing your browser.'
        break
      case 'EXISTING_ID':
        message =
          'This bid was already registered in the server, try refreshing your browser to see it.'
        break
      case 'RESERVED':
        message = 'That parcel is reserved for a road or a district'
        break
      case 'INVALID_NONCE':
      case 'INVALID_TIMESTAMP':
        message =
          "The bid couldn't be confirmed. This is probably due to timing, please try again in a few moments."
        break
      case 'PARCEL_ERRORS':
        message = Object.keys(error.parcels).map(parcelId => (
          <p key={parcelId}>
            {' '}
            {this.getParcelErrorMessage(parcelId, error.parcels[parcelId])}{' '}
          </p>
        ))
        break
      default:
        message =
          'We are having troubles confirming your bid. Please try again in a few moments'
    }

    return message
  }

  getParcelErrorMessage(parcelId, error) {
    let message = null

    switch (error.code) {
      case 'OUT_OF_BOUNDS':
        message = `Invalid coordinates for ${parcelId}, it's outside the map bounds`
        break
      case 'INSUFFICIENT_BALANCE':
        message = `Your balance is not enough to bid on ${parcelId}`
        break
      case 'AUCTION_ENDED':
        message = `Auction on ${parcelId} ended at ${new Date(
          error.endsAt
        ).toLocaleDateString()}`
        break
      case 'INSUFFICIENT_INCREMENT':
        message = `The bid of ${error.bidAmount} MANA on ${parcelId} is not enough. The minimum is ${error.minimumAmount} MANA`
        break
      default:
        message = ''
    }

    return message
  }

  render() {
    const { pendingConfirmationBids, contentRef } = this.props
    const { onConfirmBids, onEditBid, onDeleteBid, onClearAll } = this.props

    if (pendingConfirmationBids.data.length === 0) {
      return null
    }

    return (
      <div className="PendingConfirmationBidsTable">
        <div className="header">
          <h3>
            {`Pending Confirmation (${pendingConfirmationBids.data.length})`}
          </h3>
          <div className="clear" onClick={onClearAll}>
            <span className="deleteAll">Clear all</span>
            <span className="cross">✕</span>
          </div>
        </div>

        {pendingConfirmationBids.error && (
          <div className="text-danger">{this.getErrorMessage()}</div>
        )}

        <div className="table">
          <div className="table-row table-header">
            <div className="col-land">LAND</div>
            <div className="col-your-bid">YOUR BID</div>
            <div className="col-current-bid">CURRENT BID</div>
            <div className="col-time-left">TIME LEFT</div>
            <div className="col-address">ADDRESS</div>
            <div className="col-actions">EDIT/REMOVE</div>
          </div>

          <div className="table-content" ref={contentRef}>
            {pendingConfirmationBids.data.map((bid, index) => (
              <UnconfirmedBidsTableRow
                key={index}
                bid={bid}
                className={index % 2 === 0 ? 'gray' : ''}
                onEdit={() => onEditBid(bid)}
                onDelete={() => onDeleteBid(bid)}
              />
            ))}
          </div>

          <form
            method="POST"
            action="/confirmBids"
            onSubmit={preventDefault(onConfirmBids)}
          >
            <div className="table-row confirm-bids">
              <div className="col-land">Total</div>
              <div className="col-your-bid">{this.getTotalMana()} MANA</div>
              <div className="col-current-bid" />
              <div className="col-time-left" />
              <div className="col-confirm">
                <Button
                  type="default"
                  className="btn btn-default"
                  isSubmit={true}
                >
                  Confirm Bids
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

function UnconfirmedBidsTableRow({ bid, className, onEdit, onDelete }) {
  const land = buildCoordinate(bid.x, bid.y)

  const currentBid = isAvailable(bid.currentBid)
    ? `${bid.currentBid} MANA`
    : 'N/A'

  const timeLeft = distanceInWordsToNow(bid.endsAt, {
    endedText: 'Not started yet'
  })

  return (
    <div className={`table-row ${className}`}>
      <div className="col-land">
        <Link to={locations.parcelDetail(bid.x, bid.y)}>{land}</Link>
      </div>
      <div className="col-your-bid">{bid.yourBid} MANA</div>
      <div className="col-current-bid">{currentBid}</div>
      <div className="col-time-left">{timeLeft} </div>
      <div className="col-address">{shortenAddress(bid.address)}</div>
      <div className="col-actions">
        <span className="edit" onClick={onEdit}>
          <Icon name="pencil" />
        </span>
        <span className="delete" onClick={onDelete}>
          x
        </span>
      </div>
    </div>
  )
}

function isAvailable(bidValue) {
  return bidValue !== 'N/A' && parseFloat(bidValue) > 0
}
