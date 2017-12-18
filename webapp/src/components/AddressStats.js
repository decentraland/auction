import React from 'react'
import PropTypes from 'prop-types'

import { stateData } from '../lib/propTypes'

import Loading from './Loading'

import './AddressStats.css'

export default function AddressStats({ addressStats }) {
  return addressStats.loading ? (
    <Loading />
  ) : (
    <div className="AddressStats">{addressStats}</div>
  )
}

AddressStats.propTypes = {
  addressStats: stateData(PropTypes.object)
}
