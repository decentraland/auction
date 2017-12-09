import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { distanceInWordsToNow } from '../lib/dateUtils'
import { preventDefault, buildCoordinate, shortenAddress } from '../lib/util'
import pendingBidsUtils from '../lib/pendingBidsUtils'
import { stateData } from '../lib/propTypes'

import locations from '../locations'

import Button from './Button'

import './PendingConfirmationBidsTable.css'

export default class PendingConfirmationBidsTable extends React.Component {
  static propTypes = {
    pendingConfirmationBids: stateData(PropTypes.array).isRequired,
    onConfirmBids: PropTypes.func.isRequired,
    onDeleteBid: PropTypes.func.isRequired
  }

  getTotalMana() {
    const { pendingConfirmationBids } = this.props

    return pendingBidsUtils.getTotalManaBidded(pendingConfirmationBids.data)
  }

  render() {
    const {
      pendingConfirmationBids,
      onConfirmBids,
      onDeleteBid,
      contentRef
    } = this.props

    if (pendingConfirmationBids.data.length === 0) {
      return null
    }

    return (
      <div className="PendingConfirmationBidsTable">
        <h3>Pending Confirmation</h3>

        {pendingConfirmationBids.error && (
          <div className="text-danger">
            We are having troubles confirming your bid. Please try again in a
            few moments
          </div>
        )}

        <div className="table">
          <div className="table-row table-header">
            <div className="col-land">LAND</div>
            <div className="col-your-bid">YOUR BID</div>
            <div className="col-current-bid">CURRENT BID</div>
            <div className="col-time-left">TIME LEFT</div>
            <div className="col-address">ADDRESS</div>
            <div className="col-actions">ACTIONS</div>
          </div>

          <div className="table-content" ref={contentRef}>
            {pendingConfirmationBids.data.map((bid, index) => (
              <UnconfirmedBidsTableRow
                key={index}
                bid={bid}
                className={index % 2 === 0 ? 'gray' : ''}
                onDelete={onDeleteBid}
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

function UnconfirmedBidsTableRow({ bid, className, onDelete }) {
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
      <div className="col-actions delete" onClick={() => onDelete(bid)}>
        x
      </div>
    </div>
  )
}

function isAvailable(bidValue) {
  return bidValue !== 'N/A' && parseFloat(bidValue) > 0
}
