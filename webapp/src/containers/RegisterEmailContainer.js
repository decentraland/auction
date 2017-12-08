import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { registerEmail } from '../actions'

import RegisterEmail from '../components/RegisterEmail'

class RegisterEmailContainer extends React.Component {
  static propTypes = {
    email: PropTypes.object.isRequired,
    registerEmail: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      email: ''
    }
  }

  onChange = e => {
    this.setState({ email: e.target.value })
  }

  onRegister = e => {
    this.props.registerEmail(this.state.email)
    e.preventDefault()
  }

  isRegistered() {
    return !!this.props.email.data
  }

  render() {
    return !this.isRegistered() ? (
      <RegisterEmail
        email={this.state.email}
        onChange={this.onChange}
        onRegister={this.onRegister}
      />
    ) : null
  }
}

export default connect(
  state => ({
    email: selectors.getEmail(state)
  }),
  { registerEmail }
)(RegisterEmailContainer)
