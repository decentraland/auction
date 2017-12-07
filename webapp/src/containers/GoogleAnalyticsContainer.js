import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { stateData } from '../lib/propTypes'

class GoogleAnalyticsContainer extends React.Component {
  static propTypes = {
    addressState: stateData(PropTypes.object).isRequired
  }

  constructor(props) {
    super(props)
    this.configurated = false
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.shouldConfig()) {
      this.config()
    }
  }

  shouldConfig() {
    const { addressState } = this.props
    return !this.configurated && !addressState.loading && !addressState.error
  }

  config() {
    if (!window.gtag) {
      throw new Error(
        'Tried to config google analytics tracking code without injecting the script on the HTML first'
      )
    }

    const { address } = this.props.addressState.data

    window.gtag('js', new Date())
    window.gtag('config', window.GA_TRACKING_ID, {
      user_id: address
    })
  }

  render() {
    return null
  }
}

export default connect(
  state => ({
    addressState: selectors.getAddressState(state)
  }),
  {}
)(GoogleAnalyticsContainer)
