import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import moment from 'moment'

import locations from '../locations'
import { stateData } from '../lib/propTypes'
import { shortenAddress } from '../lib/util'

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
        <AddressStatsView address={address} addressStats={addressStats.data} />
      )}
    </StaticPage>
  )
}

AddressStats.propTypes = {
  address: PropTypes.string,
  addressStats: stateData(PropTypes.object)
}

class AddressStatsView extends React.Component {
  getUpdatedSorter() {
    return (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  }

  getPriceSorter() {
    return (a, b) => b.amount - a.amount
  }

  getContributedDistrictsSummary() {
    const { lockedMana } = this.props.addressStats

    return `${asLand(lockedMana.totalLandMANA / 1000)} (${asMana(
      lockedMana.totalLandMANA
    )})`
  }

  getLosingBidFilter() {
    const { winningBids } = this.props.addressStats

    const winningMap = {}
    winningBids.forEach(parcel => {
      winningMap[`${parcel.x},${parcel.y},${parcel.amount}`] = true
    })

    return item => !winningMap[`${item.x},${item.y},${item.amount}`]
  }

  getTotalWinningBids() {
    const { winningBids } = this.props.addressStats
    return asMana(winningBids.reduce((sum, e) => sum + +e.amount, 0))
  }

  hasTerraformActivity() {
    const { lockEvents, districtContributions } = this.props.addressStats
    return lockEvents.length > 0 || districtContributions.length > 0
  }

  hasBids() {
    const { winningBids } = this.props.addressStats
    const { bidGroups } = this.getAddressState()
    return winningBids.length > 0 || bidGroups.length > 0
  }

  getAddressState() {
    return (
      this.props.addressStats.addressState || {
        balance: 0,
        bidGroups: []
      }
    )
  }

  render() {
    const { address, addressStats } = this.props
    const {
      lockEvents,
      lockedMana,
      districtContributions,
      winningBids
    } = addressStats

    const { balance, bidGroups } = this.getAddressState()

    return (
      <div className="container-fluid">
        <h1>Auction Address</h1>

        <div>
          <h4>Address: {address}</h4>
          <Box className="row">
            <div className="col-xs-12 col-sm-6 box-section">
              <Definition
                title="Initial Balance"
                description={asMana(
                  lockedMana.totalLockedMANA - lockedMana.totalLandMANA
                )}
              />
              <Definition
                title="Current Balance"
                description={asMana(balance)}
              />
            </div>
            <div className="col-xs-12 col-sm-6 box-section">
              <Definition
                title="MANA sent to Contract"
                description={asMana(lockedMana.lockedInContract)}
              />
              <Definition
                title="District Contributions"
                description={this.getContributedDistrictsSummary()}
              />
            </div>
          </Box>
        </div>

        {this.hasTerraformActivity() && (
          <div>
            <h4>Terraform Registration</h4>
            <Box className="row">
              {lockEvents.length > 0 && (
                <div className="col-xs-12 col-sm-6 box-section definition-long-list">
                  <div className="title">Confirmed transactions</div>
                  <Definition>{lockEvents.map(LockEventItem)}</Definition>
                </div>
              )}

              {districtContributions.length > 0 && (
                <div className="col-xs-12 col-sm-6 box-section definition-long-list">
                  <div className="title">District contributions</div>
                  <Definition>
                    {districtContributions.map(DistrictItem)}
                  </Definition>
                </div>
              )}
            </Box>
          </div>
        )}

        {this.hasBids() && (
          <div>
            <h4>Auction Bids</h4>

            <Box className="row">
              {winningBids.length > 0 && (
                <div className="col-xs-12 col-sm-6 definition-long-list">
                  <div className="title">
                    Winning bids ({this.getTotalWinningBids()})
                  </div>
                  <Definition>
                    {winningBids
                      .sort(this.getPriceSorter())
                      .map((bid, index) => (
                        <ParcelWinItem key={index} {...bid} />
                      ))}
                  </Definition>
                </div>
              )}

              {bidGroups.length > 0 && (
                <div className="col-xs-12 col-sm-6 definition-long-list">
                  <div className="title">Unsuccesful bids</div>
                  <Definition>
                    {bidGroups
                      .sort(this.getUpdatedSorter())
                      .map(bidGroup =>
                        allBidsItem(bidGroup, this.getLosingBidFilter())
                      )}
                  </Definition>
                </div>
              )}
            </Box>
          </div>
        )}
      </div>
    )
  }
}

function LockEventItem(item, index) {
  return (
    <div key={index} className="col-xs-12">
      <DefinitionItem
        title={
          <div>
            <Link to={getEtherscanLink(item.txId)}>
              {shortenAddress(item.txId)}
            </Link>
            <small>{asFullDate(item.createdAt)}</small>
          </div>
        }
        description={<div className="mana">{asMana(item.mana)}</div>}
      />
    </div>
  )
}

function DistrictItem(item, index) {
  return (
    <div key={index} className="col-xs-12">
      <DefinitionItem
        title={<small>{asFullDate(+item.userTimestamp)}</small>}
        description={
          <div>
            <div className="mana">{asLand(item.lands)}</div>
            <Link to={item.link}>{item.name}</Link>
          </div>
        }
      />
    </div>
  )
}

function getEtherscanLink(tx) {
  return 'https://etherscan.io/tx/' + tx
}

function ParcelWinItem(item) {
  return (
    <div className="col-xs-12">
      <DefinitionItem
        title={<small>{asDate(item.updatedAt)}</small>}
        description={
          <div>
            <div className="mana">{asMana(item.amount)}</div>
            <Link to={locations.parcelDetail(item.x, item.y)}>
              {item.x}, {item.y}
            </Link>
          </div>
        }
      />
    </div>
  )
}

function allBidsItem(item, losing) {
  return item.bids
    .filter(losing)
    .map((bid, index) => (
      <ParcelWinItem
        key={index}
        id={item.id}
        updatedAt={item.createdAt}
        {...bid}
      />
    ))
}

function asDate(date) {
  return moment(date).format('ddd Do, H:mm')
}

function asFullDate(date) {
  return moment(date).format('MMMM Do, h:mm:ss a')
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
