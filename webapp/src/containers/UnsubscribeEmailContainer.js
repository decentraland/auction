import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { unsubscribeEmail } from '../actions'

import UnsubscribeEmail from '../components/UnsubscribeEmail'

class UnsubscribeEmailContainer extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    unsubscribeEmail: PropTypes.func.isRequired
  }

  onUnsubscribe = () => {
    if (window.confirm('Are you sure to unsubscribe?')) {
      this.props.unsubscribeEmail()
    }
  }

  isRegistered() {
    return !!this.props.email
  }

  render() {
    const { email } = this.props

    return this.isRegistered() ? (
      <UnsubscribeEmail
        currentEmail={email}
        onUnsubscribe={this.onUnsubscribe}
      />
    ) : null
  }
}

export default connect(
  state => ({
    email: selectors.getEmailData(state)
  }),
  { unsubscribeEmail }
)(UnsubscribeEmailContainer)
