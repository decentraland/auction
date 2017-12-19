import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import moment from 'moment'

import { stateData } from '../lib/propTypes'

import locations from '../locations'
import Box from './Box'
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
  const totalBid = asMana(winningBids.reduce((sum, e) => sum + (+e.amount), 0))
  const losing = item => !winningMap[`${item.x},${item.y},${item.amount}`]

  return (
    <div className="container-fluid">
      <h1>Terraform Auction: Address Summary</h1>
      <h3>{address}</h3>

      <Box>
      <h4>Address Summary</h4>
      <div className="row">
        <div className="col-xs-6">
          <Definition
            title="Initial Balance"
            description={asMana(lockedMana.totalLockedMANA - lockedMana.totalLandMANA)}
          />
          <Definition
            title="Current Balance"
            description={asMana(balance)}
          />
        </div>
        <div className="col-xs-6">
          <Definition title="MANA sent to Contract" description={asMana(lockedMana.lockedInContract)} />
          <Definition title="District Contributions" description={contributedDistrictsSummary} />
        </div>
      </div>
      </Box>

      <Box>
      <h4>Terraform Registration</h4>
      <div className="row">
        <div className="col-xs-6">
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
    </Box>

      <Box>
      <h4>Auction Bids</h4>
      <div className="row">
        <div className="col-xs-6">
          <div className="title">Winning bids ({totalBid})</div>
          { winningBids.sort(price).map(parcelWinItem) }
        </div>
        <div className="col-xs-6">
          <div className="title">Unsuccesful bids</div>
          { addressState.bidGroups.sort(updated).map(bidGroup => allBidsItem(bidGroup, losing)) }
        </div>
      </div>
      </Box>
    </div>
  )
}

AddressStats.propTypes = {
  address: PropTypes.string,
  addressStats: stateData(PropTypes.object)
}

function districtItem(item) {
  return <div className='districtInfo'>
    <div className='row'>
      <div className='col-xs-9 districtName'>
        <strong>{item.name}</strong>
      </div>
      <div className='col-xs-3 districtLand'>
        {asLand(item.lands)}
      </div>
      <div className='col-xs-12 dateContainer'>
        {moment(item.confirmedAt).format('MMMM Do, h:mm:ss a')}
      </div>
    </div>
  </div>
}

function lockEventItem(item) {
  return <div className='lockEvent'>
    <div className='row'>
      <div className='col-xs-12 txContainer'>
        <a href={etherscan(item.txId)} target="_blank">
          <tt>{item.txId}</tt>
        </a>
      </div>
      <div className='col-xs-6'>
        {moment(item.createdAt).format('MMMM Do, h:mm:ss a')}
      </div>
      <div className='xs-col-xs-6 manaContainer'>
        {asMana(item.mana)}
      </div>
    </div>
  </div>
}

function etherscan(tx) {
  return 'https://etherscan.io/tx/' + tx
}

function parcelWinItem(item) {
  return <div className='row parcelItem'>
      <div className='col-xs-4 parcelLink'>
        <Link to={locations.parcelDetail(item.x, item.y)}>{item.x}, {item.y}</Link>
      </div>
      <div className='col-xs-4 manaAmount'>
        {asMana(item.amount)}
      </div>
      <div className='col-xs-4 updatedAt'>
        {asDate(item.updatedAt)}
      </div>
    </div>
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
  return `${localAmount(mana)} MANA`
}

function localAmount(mana) {
  return `${Math.round(mana).toLocaleString()}`
}

function asLand(lands) {
  return `${lands.toLocaleString()} LAND`
}
