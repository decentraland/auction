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
      {stats.loading ? <Loading /> : <StatsView stats={stats.data} />}
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
    mostExpensiveBid,
    averageWinningBidCenter,
    averageWinningBid,
    mostExpensiveBids,
    mostPopularParcels,
    biggestDistricts,
    largestBidders,
    pendingParcels,
    expectedEnd,
    recentlyUpdatedParcels
  } = stats

  return (
    <div className="container-fluid">
      <h1>Terraform Auction: Summary</h1>

      <Box>
        <h4>Current Status</h4>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <Definition
              title="Auctioned Lands"
              description={asLand(totalLand)}
            />
            <Definition
              title="MANA Spent"
              description={`${asMana(manaSpentOnBids)}`}
            />
            <Definition
              title="District Lands"
              description={`${asLand(36031)}`}
            />
            <Definition
              title="MANA to be Burned"
              description={`${asMana(+manaSpentOnBids + 36031000)}`}
            />
          </div>
          <div className="col-xs-12 col-sm-6">
            <Definition
              title="Most Expensive Bid"
              description={asMana(mostExpensiveBid)}
            />
            <Definition
              title="Average Price (center)"
              description={asMana(averageWinningBidCenter)}
            />
            <Definition
              title="Average Price (all parcels)"
              description={asMana(averageWinningBid)}
            />
          </div>
        </div>
      </Box>

      {isAuctionEnded() && (
        <Box>
          <h4>Pending Bids before Auction Ends</h4>
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <Definition
                title="Pending Parcel Auctions"
                description={asLand(pendingParcels)}
              />
            </div>
            <div className="col-xs-12 col-sm-6">
              <Definition
                title="Auction Expected End Time"
                description={formatAsHoursAndMinutes(expectedEnd)}
              />
            </div>
            <div className="col-xs-12 col-sm-12 text-center">
              <div className="title text-center">Most recent bids</div>
              <Definition>
                {recentlyUpdatedParcels.map((parcel, index) => (
                  <DefinitionItem
                    key={index}
                    title={
                      <Link to={getHrefForCoords(parcel.x, parcel.y)}>
                        {parcel.x}, {parcel.y}
                      </Link>
                    }
                    description={`${deltaTimeAsHoursAndMinutes(
                      new Date().getTime() -
                        new Date(parcel.updatedAt).getTime()
                    )} ago`}
                  />
                ))}
              </Definition>
            </div>
          </div>
        </Box>
      )}

      <div className="row">
        <div className="col-xs-12 col-sm-4">
          <div className="title text-center">Most expensive bids</div>
          <Definition>
            {mostExpensiveBids.map((bid, index) => (
              <DefinitionItem
                key={index}
                title={<Link to={getHref(bid.id)}>{bid.id}</Link>}
                description={asMana(bid.amount)}
              />
            ))}
          </Definition>
        </div>

        <div className="col-xs-12 col-sm-4">
          <div className="title text-center">Most popular parcels</div>
          <Definition>
            {mostPopularParcels.map((parcel, index) => (
              <DefinitionItem
                key={index}
                title={
                  <Link to={getHref(parcel.parcelId)}>{parcel.parcelId}</Link>
                }
                description={`${parcel.count} bids`}
              />
            ))}
          </Definition>
        </div>

        <div className="col-xs-12 col-sm-4">
          <div className="title text-center">Biggest districts</div>
          <Definition>
            {biggestDistricts.map((district, index) => {
              return (
                <DefinitionItem
                  key={index}
                  title={
                    <Link to={getHref(district.lookup)}>{district.name}</Link>
                  }
                  description={asLand(district.parcels)}
                />
              )
            })}
          </Definition>
        </div>
      </div>

      <div className="row largest-bidders">
        <div className="col-xs-12 text-center">
          <div className="title">Largest bidders</div>
          <Definition>
            {largestBidders.map((bidder, index) => (
              <DefinitionItem
                key={index}
                title={
                  <Link to={locations.addressDetails(bidder.address)}>
                    {bidder.address}
                  </Link>
                }
                description={`${asMana(bidder.sum)} in ${asLand(bidder.count)}`}
              />
            ))}
          </Definition>
        </div>
      </div>
    </div>
  )
}

function isAuctionEnded() {
  return Date.now() > AUCTION_END.getTime()
}

function getHref(id) {
  return getHrefForCoords(...splitCoordinate(id))
}

function getHrefForCoords(x, y) {
  return locations.parcelDetail(x, y)
}

function formatAsHoursAndMinutes(timestamp) {
  const delta = new Date(timestamp).getTime() - new Date().getTime()
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
