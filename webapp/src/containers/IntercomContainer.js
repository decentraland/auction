import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'

import { stateData } from '../lib/propTypes'
import intercomUtils from '../lib/intercomUtils'

import './Intercom.css'

class IntercomContainer extends React.Component {
  static propTypes = {
    addressState: stateData(PropTypes.object)
  }

  componentDidUpdate(prevProps, prevState) {
    const { addressState } = this.props

    if (addressState.data) {
      this.injectIntercom()
    }
  }

  injectIntercom() {
    const { address, email } = this.props.addressState.data

    intercomUtils
      .inject()
      .then(() => intercomUtils.render(address, email))
      .catch(err => console.error('Could not inject intercom', err))
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
)(IntercomContainer)
