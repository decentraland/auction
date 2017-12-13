import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { deregisterEmail } from '../actions'

import EmailUnsubscribe from '../components/EmailUnsubscribe'

class EmailUnsubcribeContainer extends React.Component {
  onUnsubscribe() {
    deregisterEmail()
  }

  render() {
    console.log(this.props)
    const email = 'abarmat@gmail.com'
    return <EmailUnsubscribe email={email} onUnsubscribe={this.onUnsubscribe} />
  }
}

export default connect(
  state => ({
    parcelStates: selectors.getParcelStates(state),
    addressState: selectors.getAddressState(state)
  }),
  { deregisterEmail }
)(EmailUnsubcribeContainer)
