import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { registerEmail } from '../actions'
import { stateData } from '../lib/propTypes'

import Button from '../components/Button'

class SetupNotificationContainer extends React.Component {
  static propTypes = {
    ongoingAuctions: stateData(PropTypes.array),
    registerEmail: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      email: window.localStorage ? window.localStorage.getItem('email') : ''
    }
  }

  onChange(e) {
    this.setState({ email: e.target.value })
  }

  onClick() {
    this.props.registerEmail(this.state.email)
  }

  render() {
    return (
      <div className="SetupNotification">
        <input
          type="email"
          value={this.state.email}
          required="required"
          placeholder="Enter your email to be notified if something happens"
          className="email"
          onChange={this.onChange.bind(this)}
        />
        <Button onClick={this.onClick.bind(this)}>&rsaquo;</Button>
      </div>
    )
  }
}

export default connect(
  state => ({
    ongoingAuctions: selectors.getOngoingAuctions(state)
  }),
  { registerEmail }
)(SetupNotificationContainer)
