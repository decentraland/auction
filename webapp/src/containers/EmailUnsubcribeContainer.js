import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import { unsubscribeEmail, navigateTo } from '../actions'
import locations from '../locations'

import EmailUnsubscribe from '../components/EmailUnsubscribe'

class EmailUnsubcribeContainer extends React.Component {
  static propTypes = {
    email: PropTypes.string
  }

  componentWillMount(props) {
    const { email, token, navigateTo } = this.props

    if (!email || !token) {
      navigateTo(locations.root)
    }
  }

  onUnsubscribe = () => {
    unsubscribeEmail()
  }

  render() {
    const { email } = this.props

    return (
      <EmailUnsubscribe
        email={email}
        onUnsubscribe={this.onUnsubscribe}
      />
    )
  }
}

export default connect(
  (state, ownProps) => ({
    email: ownProps.match.params.email,
    token: ownProps.match.params.token
  }),
  { unsubscribeEmail, navigateTo }
)(EmailUnsubcribeContainer)
