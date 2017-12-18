import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import locations from '../locations'
import { stateData } from '../lib/propTypes'
import { splitCoordinate } from '../lib/util'

import StaticPage from './StaticPage'
import Loading from './Loading'
import Definition, { DefinitionItem } from './Definition'

import './Stats.css'

export default function Stats({ stats }) {
  return (
    <StaticPage className="Stats">
      {stats.loading ? <Loading /> : <StatsView stats={stats.data} />}
    </StaticPage>
  )
}

Stats.propTypes = {
  stats: stateData(PropTypes.object)
}

function StatsView({ stats }) {
  const {
    totalMana,
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
      <h1>Decentraland Auction Stats</h1>

      <div className="row">
        <div className="col-xs-12 col-sm-offset-2 col-sm-4">
          <Definition
            title="Total MANA for Genesis:"
            description={asMana(totalMana)}
          />
          <Definition
            title="LANDs auctioned so far:"
            description={asLand(totalLand)}
          />
          <Definition
            title="MANA spent on bids:"
            description={asMana(manaSpentOnBids)}
          />
        </div>

        <div className="col-xs-12 col-sm-4">
          <Definition
            title="Most expensive bid:"
            description={asMana(mostExpensiveBid)}
          />
          <Definition
            title="Average winning bid in Genesis Center:"
            description={asMana(averageWinningBidCenter)}
          />
          <Definition
            title="Average winning bid:"
            description={asMana(averageWinningBid)}
          />
        </div>
      </div>

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
            {biggestDistricts.map((district, index) => (
              <DefinitionItem
                key={index}
                title={district.name}
                description={asMana(district.parcels)}
              />
            ))}
          </Definition>
        </div>
      </div>

      <div className="row largest-bidders">
        <div className="col-xs-12 col-sm-offset-2 col-sm-8 text-center">
          <div className="title">Largest bidders</div>
          <Definition>
            {largestBidders.map((bidder, index) => (
              <DefinitionItem
                key={index}
                title={bidder.address}
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
  return `${lands.toLocaleString()} LANDs`
}
