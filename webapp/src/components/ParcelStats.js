import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import moment from 'moment'

import locations from '../locations'
import { shortenAddress } from '../lib/util'
import { stateData } from '../lib/propTypes'

import StaticPage from './StaticPage'
import Box from './Box'
import Loading from './Loading'
import Definition, { DefinitionItem } from './Definition'

import './ParcelStats.css'

export default function ParcelStats({ parcelStats }) {
  return (
    <StaticPage className="StaticPageStreched ParcelStats">
      {parcelStats.loading || !parcelStats.data ? (
        <Loading />
      ) : (
        <ParcelStatsView parcelStats={parcelStats.data} />
      )}
    </StaticPage>
  )
}

ParcelStats.propTypes = {
  parcelStats: stateData(PropTypes.object)
}

function ParcelStatsView({ parcelStats }) {
  let {
    x,
    y,
    address,
    amount,
    receivedAt,
    bids = [],
    project
  } = parcelStats.parcelState

  bids = bids || []

  return (
    <div className="container-fluid">
      <h1>Auction Summary</h1>

      <div>
        <h4>
          Parcel {x}, {y}
        </h4>
        <Box className="row">
          <div className="col-xs-12">
            {address ? (
              <div>
                <Definition
                  title="Owner"
                  description={
                    <Link to={locations.addressStatsDetails(address)}>
                      {address}
                    </Link>
                  }
                />
                <Definition title="Value" description={asMana(amount)} />
                <Definition title="Date" description={asDate(receivedAt)} />
                <Definition
                  title="View in map"
                  description={
                    <Link to={locations.parcelDetail(x, y)}>
                      {x}, {y}
                    </Link>
                  }
                />
              </div>
            ) : project ? (
              <div>
                <Definition title="Belongs to" description={project.name} />
                <Definition
                  title="View proposal"
                  description={<Link to={project.link}>Proposal</Link>}
                />
                <Definition
                  title="View in map"
                  description={
                    <Link to={locations.parcelDetail(x, y)}>
                      {x}, {y}
                    </Link>
                  }
                />
              </div>
            ) : (
              <div>
                <div className="empty">No one claimed this parcel</div>
                <Definition
                  title="View in map"
                  description={
                    <Link to={locations.parcelDetail(x, y)}>
                      {x}, {y}
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        </Box>
      </div>

      {bids.length > 0 && (
        <div>
          <h4>Bids</h4>
          <Box className="row">
            <div className="col-xs-12 definition-list">
              <div className="title">Bids by amount</div>
              <ParcelBids bids={bids} />
            </div>
          </Box>
        </div>
      )}
    </div>
  )
}

function ParcelBids({ bids }) {
  return (
    <Definition className="row">
      {bids.map((bid, index) => (
        <div key={index} className="col-xs-12 col-sm-4">
          <DefinitionItem
            title={<BidPosition bid={bid} index={index + 1} />}
            description={
              <Link to={locations.addressStatsDetails(bid.address)}>
                {shortenAddress(bid.address)}
              </Link>
            }
          />
        </div>
      ))}
    </Definition>
  )
}

function BidPosition({ bid, index }) {
  return (
    <div>
      <div className="position">
        #{index} <small>{asDate(bid.receivedAt)}</small>
      </div>
      <div className="mana">{asMana(bid.amount)}</div>
    </div>
  )
}

// -------------------------------------------------------------------------
// Utils

function asMana(mana) {
  return `${Math.round(mana).toLocaleString()} MANA`
}

function asDate(date) {
  return moment(date).format('ddd Do, H:mm')
}
