import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { fetchStats } from '../actions'

import Stats from '../components/Stats'

class StatsContainer extends React.Component {
  static propTypes = {
    addressState: PropTypes.object,
    fetchStats: PropTypes.func
  }

  componentWillMount() {

  }

  render() {
    const { getAddressState } = this.props
    return <Stats getAddressState={getAddressState} />
  }
}

export default connect(
  state => ({
    addressState: selectors.getAddressState(state)
  }),
  { fetchStats }
)(StatsContainer)
