import React from 'react'
import PropTypes from 'prop-types'

import { stateData } from '../lib/propTypes'

import Loading from './Loading'

import './Stats.css'

export default function Stats({ stats }) {
  return stats.loading ? (
    <Loading />
  ) : (
    <div className="Stats">
      <pre>{JSON.stringify(stats)}</pre>
    </div>
  )
}

Stats.propTypes = {
  stats: stateData(PropTypes.object)
}
