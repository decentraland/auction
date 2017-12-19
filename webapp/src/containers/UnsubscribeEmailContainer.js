import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { unsubscribeEmail } from '../actions'

import UnsubscribeEmail from '../components/UnsubscribeEmail'

class UnsubscribeEmailContainer extends React.Component {
  static propTypes = {
    email: PropTypes.bool,
    unsubscribeEmail: PropTypes.func.isRequired
  }

  static defaultProps = {
    email: false
  }

  onUnsubscribe = () => {
    this.props.unsubscribeEmail()
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
