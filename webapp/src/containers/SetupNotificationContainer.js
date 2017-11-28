import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { registerEmail, deregisterEmail } from '../actions'
import { stateData } from '../lib/propTypes'

import SetupNotification from '../components/SetupNotification'

class SetupNotificationContainer extends React.Component {
  static propTypes = {
    ongoingAuctions: stateData(PropTypes.array),
    email: PropTypes.object.isRequired,
    registerEmail: PropTypes.func.isRequired,
    deregisterEmail: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    console.log(this.props.email)
    this.state = {
      email: this.props.email.data || ''
    }
  }

  onChange(e) {
    this.setState({ email: e.target.value })
  }

  onRegister(e) {
    this.props.registerEmail(this.state.email)
    e.preventDefault()
  }

  onDeregister() {
    if (window.confirm('Are you sure to unsubscribe?')) {
      this.props.deregisterEmail()
      this.setState({ email: '' })
    }
  }

  render() {
    return (
      <SetupNotification
        email={this.state.email}
        currentEmail={this.props.email.data}
        onChange={this.onChange.bind(this)}
        onRegister={this.onRegister.bind(this)}
        onDeregister={this.onDeregister.bind(this)}
      />
    )
  }
}

export default connect(
  state => ({
    ongoingAuctions: selectors.getOngoingAuctions(state),
    email: selectors.getEmail(state)
  }),
  { registerEmail, deregisterEmail }
)(SetupNotificationContainer)
