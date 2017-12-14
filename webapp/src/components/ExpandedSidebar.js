import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import locations from '../locations'
import { distanceInWordsToNow } from '../lib/dateUtils'
import { buildCoordinate, shortenAddress } from '../lib/util'
import { stateData } from '../lib/propTypes'

import RegisterEmailContainer from '../containers/RegisterEmailContainer'
import DeRegisterEmailContainer from '../containers/DeRegisterEmailContainer'

import Icon from './Icon'
import Loading from './Loading'
import SidebarDashboard from './SidebarDashboard'

import './ExpandedSidebar.css'

export default function ExpandedSidebar(props) {
  const { addressState, ongoingAuctions, dashboard, onHide } = props

  return (
    <div className="ExpandedSidebar fadein">
      <UserData addressState={addressState} />

      <RegisterEmailContainer />

      <div>
        <div className="heading">Dashboard</div>
        <SidebarDashboard dashboard={dashboard} />
      </div>

      <OngoingAuctions ongoingAuctions={ongoingAuctions} onHide={onHide} />

      <DeRegisterEmailContainer />

      <Footer />
    </div>
  )
}

ExpandedSidebar.propTypes = {
  addressState: stateData(PropTypes.object),
  ongoingAuctions: stateData(PropTypes.array),
  dashboard: PropTypes.object,
  onHide: PropTypes.func
}

function UserData({ addressState, ongoingAuctions }) {
  return (
    <div className="UserData">
      <h2>
        Your balance
        {addressState.data && (
          <div className="address">
            <Icon name="address" />
            {shortenAddress(addressState.data.address)}
          </div>
        )}
      </h2>

      {addressState.loading ? (
        <Loading />
      ) : addressState.error ? (
        <div className="mana-value text-danger">
          Couldn&#39;t fetch your current balance. Try refreshing the page.
        </div>
      ) : (
        <div className="mana-value">{addressState.data.balance} MANA</div>
      )}
    </div>
  )
}

function OngoingAuctions({ ongoingAuctions, onHide }) {
  return (
    <div className="OngoingAuctions">
      <div className="heading">Ongoing auctions</div>
      {ongoingAuctions.loading ? (
        <Loading />
      ) : ongoingAuctions.error ? (
        <div className="table-row-empty text-danger">
          We are having troubles fetching your auctions. Please try again in a
          few minutes.
        </div>
      ) : (
        <AuctionTable auctions={ongoingAuctions.data} onLandClick={onHide} />
      )}
    </div>
  )
}

function AuctionTable({ auctions, onLandClick }) {
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
            onLandClick={onLandClick}
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
  className: PropTypes.string,
  onLandClick: PropTypes.func
}

AuctionTableRow.defaultProps = {
  className: ''
}

function Footer() {
  return (
    <footer className="Footer">
      <div className="social-icons">
        <Icon name="twitter" />
        <Icon name="rocketchat" />
        <Icon name="github" />
        <Icon name="reddit" />
        <Icon name="facebook" />
      </div>
      <div className="links">
        <Link to="https://blog.decentraland.org" target="_blank">
          Blog
        </Link>
        <Link to="https://decentraland.org" target="_blank">
          Website
        </Link>
        <Link to="https://decentraland.org/whitepaper.pdf" target="_blank">
          Whitepaper
        </Link>
      </div>
      <div className="copyright">
        Copyright 2017 Decentraland. All rights reserved.
      </div>
    </footer>
  )
}
