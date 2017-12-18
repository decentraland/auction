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
          <Definition
            title="Initial balance (including bonus)"
            description={asMana(12313)}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-xs-6">
          <Definition title="MANA commited" description={asMana(123123)} />

          <div>
            <div className="title">Confirmed transactions</div>
            <Definition>
              <DefinitionItem
                title="0xdeadbeef"
                description="10.000 MANA Oct 10th"
              />
              <DefinitionItem
                title="0xdeadbeef"
                description="10.000 MANA Oct 10th"
              />
              <DefinitionItem
                title="0xdeadbeef"
                description="10.000 MANA Oct 10th"
              />
            </Definition>
          </div>
        </div>
        <div className="col-xs-6">
          <Definition title="MANA contributed to districts" description={asMana(123123)} />

          <div>
            <div className="title">District contributions</div>
            <Definition>
              <DefinitionItem
                title="10.000 LAND Vegas"
                description="10th Oct"
              />
              <DefinitionItem
                title="10.000 LAND Vegas"
                description="10th Oct"
              />
              <DefinitionItem
                title="10.000 LAND Vegas"
                description="10th Oct"
              />
            </Definition>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-xs-6">
          <div className="title">Winning bids</div>

        </div>
        <div className="col-xs-6">
          <div className="title">Alls bids</div>
        </div>
      </div>
    </div>
  )
}

AddressStats.propTypes = {
  address: PropTypes.string,
  addressStats: stateData(PropTypes.object)
}

function asMana(mana) {
  return `${Math.round(mana).toLocaleString()} MANA`
}

function asLand(lands) {
  return `${lands.toLocaleString()} LANDs`
}
