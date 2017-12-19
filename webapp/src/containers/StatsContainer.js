import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { fetchStats, navigateTo } from '../actions'
import locations from '../locations'

import { stateData } from '../lib/propTypes'

import Stats from '../components/Stats'

class StatsContainer extends React.Component {
  static propTypes = {
    stats: stateData(PropTypes.object),
    fetchStats: PropTypes.func,
    navigateTo: PropTypes.func
  }

  componentWillMount() {
    this.props.fetchStats()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stats.error) {
      this.props.navigateTo(locations.root)
    }
  }

  render() {
    const { stats } = this.props
    return <Stats stats={stats} />
  }
}

export default connect(
  state => ({
    stats: selectors.getStats(state)
  }),
  { fetchStats, navigateTo }
)(StatsContainer)
