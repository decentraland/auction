import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { openModal, closeSidebar } from '../actions'

import RegisterEmail from '../components/RegisterEmail'

class RegisterEmailContainer extends React.Component {
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
      <RegisterEmail onSignup={this.onSignup} />
    ) : null
  }
}

export default connect(
  state => ({
    email: selectors.getEmail(state)
  }),
  { openModal, closeSidebar }
)(RegisterEmailContainer)
