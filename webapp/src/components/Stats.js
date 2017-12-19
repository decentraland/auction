import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import locations from '../locations'
import { stateData } from '../lib/propTypes'
import { splitCoordinate } from '../lib/util'

import StaticPage from './StaticPage'
import Box from './Box'
import Loading from './Loading'
import Definition, { DefinitionItem } from './Definition'

import './Stats.css'

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
    largestBidders
  } = stats

  return (
    <div className="container-fluid">
      <h1>Terraform Auction: Summary</h1>

      <Box>
        <h4>Current Status</h4>
        <div className="row">
          <div className="col-xs-6">
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
          <div className="col-xs-6">
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

      <div className="row">
        <div className="col-xs-4">
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

        <div className="col-xs-4">
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

        <div className="col-xs-4">
          <div className="title text-center">Biggest districts</div>
          <Definition>
            {biggestDistricts.map((district, index) => {
              const [x, y] = district.lookup.split(',')
              return (
                <DefinitionItem
                  key={index}
                  title={
                    <Link to={locations.parcelDetail(x, y)}>
                      {district.name}
                    </Link>
                  }
                  description={asMana(district.parcels)}
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

function getHref(id) {
  return locations.parcelDetail(...splitCoordinate(id))
}

function asMana(mana) {
  return `${Math.round(mana).toLocaleString()} MANA`
}

function asLand(lands) {
  return `${Math.round(lands).toLocaleString()} LAND`
}
