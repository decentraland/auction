import React from 'react'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { deregisterEmail } from '../actions'

import EmailUnsubscribe from '../components/EmailUnsubscribe'

class EmailUnsubcribeContainer extends React.Component {
  onUnsubscribe = () => {
    deregisterEmail()
  }

  render() {
    const email = this.props.match.params.email
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
