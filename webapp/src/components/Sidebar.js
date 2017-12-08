import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { distanceInWordsToNow } from '../lib/dateUtils'
import { buildCoordinate, shortenAddress } from '../lib/util'
import { stateData } from '../lib/propTypes'

import locations from '../locations'

import Loading from './Loading'
import Icon from './Icon'
import SetupNotificationContainer from '../containers/SetupNotificationContainer'

import './Sidebar.css'

export default class Sidebar extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    addressState: stateData(PropTypes.object).isRequired,
    ongoingAuctions: stateData(PropTypes.array).isRequired,
    changeVisibility: PropTypes.func.isRequired
  }

  static defaultProps = {
    visible: false
  }

  getVisibilityClassName() {
    return this.props.visible ? 'in' : 'out'
  }

  toggle = () => {
    const { visible, changeVisibility } = this.props
    changeVisibility(!visible)
  }

  render() {
    const { visible, addressState, ongoingAuctions } = this.props

    return (
      <div className={`Sidebar ${this.getVisibilityClassName()}`}>
        <header>
          <Icon name="decentraland" />
          {visible && <h1 className="sidebar-title fadein">Decentraland</h1>}
        </header>

        {visible ? (
          <ExpandedSidebar
            addressState={addressState}
            ongoingAuctions={ongoingAuctions}
          />
        ) : (
          <CollapsedSidebar />
        )}

        <div
          className={`toggle-button ${this.getVisibilityClassName()}`}
          onClick={this.toggle}
        />
      </div>
    )
  }
}

function ExpandedSidebar({ addressState, ongoingAuctions }) {
  return (
    <div className="ExpandedSidebar fadein">
      <Balance addressState={addressState} />
      <SetupNotificationContainer />
      <OngoingAuctions ongoingAuctions={ongoingAuctions} />
    </div>
  )
}

function CollapsedSidebar() {
  return (
    <div className="CollapsedSidebar">
      <div>BIDS</div>
      <div>WINNING</div>
      <div>LOSING</div>
      <div>WON</div>
      <div>LOST</div>
    </div>
  )
}

function Balance({ addressState, ongoingAuctions }) {
  return (
    <div className="your-balance">
      <h2>Your Balance</h2>
      {addressState.loading ? (
        <Loading />
      ) : addressState.error ? (
        <div className="mana-value text-danger">
          Couldn&#39;t fetch your current balance. Try refreshing the page and
          trying again.
        </div>
      ) : (
        <div className="mana-value">{addressState.data.balance} MANA</div>
      )}
    </div>
  )
}

function OngoingAuctions({ ongoingAuctions, onHide }) {
  return (
    <div className="ongoing-auctions">
      <h3>Ongoing auctions</h3>
      {ongoingAuctions.loading ? (
        <Loading />
      ) : ongoingAuctions.error ? (
        <div className="table-row-empty text-danger">
          We are having troubles fetching your auctions. Please try again in a
          few minutes.
        </div>
      ) : (
        <AuctionTable auctions={ongoingAuctions.data} onHide={onHide} />
      )}
    </div>
  )
}

function AuctionTable({ auctions, onHide }) {
  if (auctions.length) {
    return (
      <div className="table">
        <div className="table-row table-header">
          <div className="col-land">Land</div>
          <div className="col-status">Status</div>
          <div className="col-amount">Amount</div>
          <div className="col-time-left">Time left</div>
          <div className="col-address" />
        </div>

        {auctions.map((auction, index) => (
          <AuctionTableRow
            key={index}
            auction={auction}
            onLandClick={onHide}
            className={index % 2 === 0 ? 'gray' : ''}
          />
        ))}
      </div>
    )
  } else {
    return (
      <div className="table-row-empty">
        You have no ongoing auctions yet.
        <br />
        Click on any parcel you like to bid on it!
      </div>
    )
  }
}

function AuctionTableRow({ auction, className, onLandClick }) {
  const land = buildCoordinate(auction.x, auction.y)
  const statusClass = auction.status.toLowerCase()
  const timeLeft = distanceInWordsToNow(auction.endsAt)

  return (
    <div className={`table-row ${className}`}>
      <div className="col-land">
        <Link
          to={locations.parcelDetail(auction.x, auction.y)}
          onClick={onLandClick}
        >
          {land}
        </Link>
      </div>
      <div className={`col-status ${statusClass}`}>{auction.status}</div>
      <div className="col-amount">{auction.amount} MANA</div>
      <div className="col-time-left">{timeLeft}</div>
      <div className="col-address">{shortenAddress(auction.address)}</div>
    </div>
  )
}

AuctionTableRow.propTypes = {
  auction: PropTypes.object,
  className: PropTypes.string
}

AuctionTableRow.defaultProps = {
  className: ''
}
