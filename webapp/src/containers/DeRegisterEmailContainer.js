import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { deregisterEmail } from '../actions'

import DeRegisterEmail from '../components/DeRegisterEmail'

class DeRegisterEmailContainer extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    deregisterEmail: PropTypes.func.isRequired
  }

  onDeregister = () => {
    if (window.confirm('Are you sure to unsubscribe?')) {
      this.props.deregisterEmail()
    }
  }

  isRegistered() {
    return !!this.props.email
  }

  render() {
    const { email } = this.props

    return this.isRegistered() ? (
      <DeRegisterEmail
        currentEmail={email}
        onDeregister={this.onDeregister}
      />
    ) : null
  }
}

export default connect(
  state => ({
    email: selectors.getEmail(state)
  }),
  { deregisterEmail }
)(DeRegisterEmailContainer)
