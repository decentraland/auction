import React from 'react'
import PropTypes from 'prop-types'

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

function StatsView({ address, addressStats }) {
  const {
    lockedMana,
    bonusPerMonth,
    districtContributions,
    winningBids,
    balance
  } = addressStats

  return (
    <div className="container-fluid">
      <h1>Decentraland Auction</h1>

      <div className="row">
        <div className="col-xs-12">
          <Definition title="Address summary" description={address} />
        </div>
      </div>
    </div>
  )
}

AddressStats.propTypes = {
  address: PropTypes.string,
  addressStats: stateData(PropTypes.object)
}
