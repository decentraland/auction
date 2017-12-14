import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { openModal, closeSidebar } from '../actions'

import SubscribeEmail from '../components/SubscribeEmail'

class SubscribeEmailContainer extends React.Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    openModal: PropTypes.func.isRequired,
    closeSidebar: PropTypes.func.isRequired
  }

  onSignup = () => {
    this.props.openModal('LinkEmailModal')
    this.props.closeSidebar()
  }

  isRegistered() {
    return !!this.props.email
  }

  render() {
    return !this.isRegistered() ? (
      <SubscribeEmail onSignup={this.onSignup} />
    ) : null
  }
}

export default connect(
  state => ({
    email: selectors.getEmailData(state)
  }),
  { openModal, closeSidebar }
)(SubscribeEmailContainer)
