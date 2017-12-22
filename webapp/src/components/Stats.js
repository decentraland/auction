import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { env } from 'decentraland-commons'

import locations from '../locations'
import { stateData } from '../lib/propTypes'
import { splitCoordinate } from '../lib/util'

import StaticPage from './StaticPage'
import Box from './Box'
import Loading from './Loading'
import Definition, { DefinitionItem } from './Definition'

import './Stats.css'

const AUCTION_END = new Date(env.get('REACT_APP_AUCTION_END', 1513980000000))

export default function Stats({ stats }) {
  return (
    <StaticPage className="StaticPageStreched Stats">
      {stats.loading || !stats.data ? (
        <Loading />
      ) : (
        <StatsView stats={stats.data} />
      )}
    </StaticPage>
  )
}

Stats.propTypes = {
  stats: stateData(PropTypes.object)
}

function StatsView({ stats }) {
  const {
    totalLand,
    manaSpentOnBids,
    averageWinningBidCenter,
    averageWinningBid,
    mostExpensiveBids,
    mostPopularParcels,
    biggestDistricts,
    pendingParcels,
    expectedEnd,
    recentlyUpdatedParcels
  } = stats

  return (
    <div className="container-fluid">
      <h1>Auction Summary</h1>

      <div>
        <h4>Global Stats</h4>
        <Box className="row">
          <div className="col-xs-12 col-sm-4 box-section">
            <Definition
              title="Auctioned Lands"
              description={asLand(totalLand)}
            />
          </div>
          <div className="col-xs-12 col-sm-4 box-section">
            <Definition
              title="MANA Spent"
              description={`${asMana(manaSpentOnBids)}`}
            />
          </div>
          <div className="col-xs-12 col-sm-4 box-section">
            <Definition
              title="District Lands"
              description={`${asLand(36031)}`}
            />
          </div>
          <div className="col-xs-12 col-sm-4 box-section">
            <Definition
              title="MANA to be Burned"
              description={`${asMana(+manaSpentOnBids + 36031000)}`}
            />
          </div>
          <div className="col-xs-12 col-sm-4 box-section">
            <Definition
              title="Average Price (center)"
              description={asMana(averageWinningBidCenter)}
            />
          </div>
          <div className="col-xs-12 col-sm-4 box-section">
            <Definition
              title="Average Price (all parcels)"
              description={asMana(averageWinningBid)}
            />
          </div>
        </Box>
      </div>

      {isAuctionEnded() && (
        <div>
          <h4>Pending Bids before Auction Ends</h4>
          <Box className="row">
            <div className="col-xs-12 col-sm-6 box-left">
              <Definition
                title="Pending Parcel Auctions"
                description={asLand(pendingParcels)}
              />
            </div>
            <div className="col-xs-12 col-sm-6 box-right">
              <Definition
                title="Auction Expected End Time"
                description={formatAsHoursAndMinutes(expectedEnd)}
              />
            </div>

            <div className="col-xs-12 definition-list">
              <div className="title">Most recent bids</div>
              <RecentlyUpdatedParcels
                recentlyUpdatedParcels={recentlyUpdatedParcels}
              />
            </div>
          </Box>
        </div>
      )}

      <div>
        <h4>Leaderboards</h4>

        <Box className="row">
          <div className="col-xs-12 definition-list">
            <div className="title">Most expensive bids</div>
            <MostExpensiveBids mostExpensiveBids={mostExpensiveBids} />
          </div>

          <div className="col-xs-12 definition-list">
            <div className="title">Most popular parcels</div>
            <MostPopularParcels mostPopularParcels={mostPopularParcels} />
          </div>

          <div className="col-xs-12 definition-list">
            <div className="title">Biggest districts</div>
            <BiggestDistricts biggestDistricts={biggestDistricts} />
          </div>
        </Box>
      </div>
    </div>
  )
}

function RecentlyUpdatedParcels({ recentlyUpdatedParcels }) {
  return (
    <Definition className="row">
      {recentlyUpdatedParcels.map((parcel, index) => (
        <div key={index} className="col-xs-12 col-sm-4">
          <DefinitionItem
            title={<ParcelPosition parcel={parcel} index={index + 1} />}
            description={
              <Link to={getHref(parcel.parcelId)}>
                {parcel.x}, {parcel.y}
              </Link>
            }
          />
        </div>
      ))}
    </Definition>
  )
}

function MostExpensiveBids({ mostExpensiveBids }) {
  return (
    <Definition className="row">
      {mostExpensiveBids.map((bid, index) => (
        <div key={index} className="col-xs-12 col-sm-4">
          <DefinitionItem
            title={<BidPosition bid={bid} index={index + 1} />}
            description={<Link to={getHref(bid.id)}>{bid.id}</Link>}
          />
        </div>
      ))}
    </Definition>
  )
}

function MostPopularParcels({ mostPopularParcels }) {
  return (
    <Definition className="row">
      {mostPopularParcels.map((parcel, index) => (
        <div key={index} className="col-xs-12 col-sm-4">
          <DefinitionItem
            title={<ParcelBidPosition parcel={parcel} index={index + 1} />}
            description={
              <Link to={getHref(parcel.parcelId)}>{parcel.parcelId}</Link>
            }
          />
        </div>
      ))}
    </Definition>
  )
}

function BiggestDistricts({ biggestDistricts }) {
  return (
    <Definition className="row">
      {biggestDistricts.map((district, index) => (
        <div key={index} className="col-xs-12 col-sm-4">
          <DefinitionItem
            title={<DistrictPosition district={district} index={index + 1} />}
            description={
              <Link to={getHref(district.lookup)}>{district.name}</Link>
            }
          />
        </div>
      ))}
    </Definition>
  )
}

function ParcelPosition({ parcel, index }) {
  return (
    <div>
      <div className="position">
        #{index} <small>{lastParcelUpdate(parcel)}</small>
      </div>
      <div className="mana">{asMana(parcel.amount.toLocaleString())}</div>
    </div>
  )
}

function BidPosition({ bid, index }) {
  return (
    <div>
      <div className="position">#{index}</div>
      <div className="mana">{asMana(bid.amount)}</div>
    </div>
  )
}

function ParcelBidPosition({ parcel, index }) {
  return (
    <div>
      <div className="position">#{index}</div>
      <div className="mana">{parcel.count} bids</div>
    </div>
  )
}

function DistrictPosition({ district, index }) {
  return (
    <div>
      <div className="position">#{index}</div>
      <div className="mana">{asLand(district.parcels.toLocaleString())}</div>
    </div>
  )
}

// -------------------------------------------------------------------------
// Utils

function isAuctionEnded() {
  return Date.now() > AUCTION_END.getTime()
}

function getHref(id) {
  return locations.parcelDetail(...splitCoordinate(id))
}

function lastParcelUpdate(parcel) {
  return `${deltaTimeAsHoursAndMinutes(
    Date.now() - new Date(parcel.updatedAt).getTime()
  )} ago`
}

function formatAsHoursAndMinutes(timestamp) {
  const delta = new Date(timestamp).getTime() - Date.now()
  if (delta < 0) {
    return `Finished ${deltaTimeAsHoursAndMinutes(-delta)} ago`
  }
  return `In ${deltaTimeAsHoursAndMinutes(delta)}`
}

function deltaTimeAsHoursAndMinutes(delta) {
  const hours = Math.floor(delta / (60 * 60 * 1000))
  const minutes = Math.floor(delta / (60 * 1000)) % 60

  let result = ''

  if (hours === 0 && minutes === 0) {
    result = `less than a minute`
  } else if (hours === 0) {
    result = `${minutes} ${pluralize('minute', minutes)}`
  } else {
    result = `${hours} ${pluralize('hour', hours)}`

    if (minutes > 0) {
      result += ` and ${minutes} ${pluralize('minute', minutes)}`
    }
  }

  return result
}

function pluralize(text, value) {
  return `${text}${value > 1 ? 's' : ''}`
}

function asMana(mana) {
  return `${Math.round(mana).toLocaleString()} MANA`
}

function asLand(lands) {
  return `${Math.round(lands).toLocaleString()} LAND`
}
