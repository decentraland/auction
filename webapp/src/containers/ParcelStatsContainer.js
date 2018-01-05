import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { fetchParcelStats, navigateTo } from '../actions'
import locations from '../locations'

import { stateData } from '../lib/propTypes'

import ParcelStats from '../components/ParcelStats'

class ParcelStatsContainer extends React.Component {
  static propTypes = {
    parcelStats: stateData(PropTypes.object),
    x: PropTypes.string,
    y: PropTypes.string,
    fetchParcelStats: PropTypes.func,
    navigateTo: PropTypes.func
  }

  componentWillMount() {
    const { x, y, fetchParcelStats } = this.props
    fetchParcelStats(x, y)
  }

  componentWillReceiveProps(nextProps) {
    const { parcelStats } = nextProps

    if (!parcelStats.loading && (!parcelStats.data || !!parcelStats.error)) {
      this.props.navigateTo(locations.root)
    }
  }

  render() {
    const { parcelStats } = this.props
    return <ParcelStats parcelStats={parcelStats} />
  }
}

export default connect(
  (state, ownProps) => ({
    parcelStats: selectors.getParcelStats(state),
    x: ownProps.match.params.x,
    y: ownProps.match.params.y
  }),
  { fetchParcelStats, navigateTo }
)(ParcelStatsContainer)
