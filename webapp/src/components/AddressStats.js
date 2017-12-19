import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import { stateData } from '../lib/propTypes'

import StaticPage from './StaticPage'
import Loading from './Loading'
import Definition, { DefinitionItem } from './Definition'

import './AddressStats.css'

export default function AddressStats({ address, addressStats }) {
  return (
    <StaticPage className="StaticPageStreched AddressStats">
      {addressStats.loading ? (
        <Loading />
      ) : (
        <StatsView address={address} addressStats={addressStats.data} />
      )}
    </StaticPage>
  )
}

AddressStats.propTypes = {
  address: PropTypes.string,
  addressStats: stateData(PropTypes.object)
}

const updated = (a, b) => -(new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
const price = (a, b) => -(a.amount - b.amount)

function StatsView({ address, addressStats }) {
  const {
    lockEvents,
    lockedMana,
    districtContributions,
    winningBids,
    addressState
  } = addressStats
  const { balance } = addressState
  const contributedDistrictsSummary = `${
      asLand(lockedMana.totalLandMANA / 1000)
    } (${
      asMana(lockedMana.totalLandMANA)
    })`
  const winningMap = {}
  winningBids.forEach(parcel => {
    winningMap[`${parcel.x},${parcel.y},${parcel.amount}`] = true
  })
  const losing = item => !winningMap[`${item.x},${item.y},${item.amount}`]

  return (
    <div className="container-fluid">
      <h1>Decentraland Auction</h1>

      <div className="row">
        <div className="col-xs-12">
          <Definition title="Address summary" description={address} />
          <Definition
            title="Initial balance"
            description={asMana(lockedMana.totalLockedMANA - lockedMana.totalLandMANA)}
          />
          <Definition
            title="Current balance"
            description={asMana(balance)}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-xs-6">
          <Definition title="MANA commited" description={asMana(lockedMana.lockedInContract)} />
          <Definition title="Contributed to districts" description={contributedDistrictsSummary} />

          <div>
            <div className="title">Confirmed transactions</div>
            <Definition>
              { lockEvents.map(lockEventItem) }
            </Definition>
          </div>
        </div>
        <div className="col-xs-6">
          <div>
            <div className="title">District contributions</div>
            <Definition>
              { districtContributions.map(districtItem) }
            </Definition>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-xs-6">
          <div className="title">Winning bids</div>
          <Definition>
            { winningBids.sort(price).map(parcelWinItem) }
          </Definition>

        </div>
        <div className="col-xs-6">
          <div className="title">Unsuccesful bids</div>
          <Definition>
            { addressState.bidGroups.sort(updated).map(bidGroup => allBidsItem(bidGroup, losing)) }
          </Definition>
        </div>
      </div>
    </div>
  )
}

AddressStats.propTypes = {
  address: PropTypes.string,
  addressStats: stateData(PropTypes.object)
}

function districtItem(item) {
  return <DefinitionItem key={item.id} title={item.name} description={asLand(item.lands)} />
}

function lockEventItem(item) {
  return <DefinitionItem key={item.id} title={item.txId} description={asDate(item)} />
}

function parcelWinItem(item) {
  return <DefinitionItem key={`${item.x},${item.y},${item.amount},${item.id}`}
    title={`${item.x}, ${item.y} - ${item.amount} MANA`}
    description={asDate(item.updatedAt)}
  />
}

function allBidsItem(item, losing) {
  return item.bids
    .filter(losing)
    .map(bid => parcelWinItem({ ...bid, id: item.id, updatedAt: item.createdAt }))
}

function asDate(date) {
  return moment(date).format("ddd Do, H:mm")
}

function asMana(mana) {
  return `${Math.round(mana).toLocaleString()} MANA`
}

function asLand(lands) {
  return `${lands.toLocaleString()} LAND`
}
