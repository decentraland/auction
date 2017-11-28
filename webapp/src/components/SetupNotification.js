import React from 'react'
import PropTypes from 'prop-types'

import Button from './Button'

import './SetupNotification.css'

export default class SetupNotification extends React.Component {
  render() {
    const {
      email,
      currentEmail,
      onChange,
      onRegister,
      onDeregister
    } = this.props

    return (
      <div className="SetupNotification">
        {currentEmail && (
          <div className="EmailRegistered">
            <p>
              You are subscribed with <b>{currentEmail}</b>
            </p>
            <Button onClick={onDeregister}>X</Button>
          </div>
        )}
        {!currentEmail && (
          <form action="POST" onSubmit={onRegister}>
            <div className="EmailRegistered">
              <input
                type="email"
                value={email}
                required="required"
                placeholder="Enter your email to be notified if something happens"
                className="email"
                onChange={onChange}
              />
              <input type="submit" value="&rsaquo;" />
            </div>
          </form>
        )}
      </div>
    )
  }
}

SetupNotification.propTypes = {
  email: PropTypes.string,
  currentEmail: PropTypes.string,
  onChange: PropTypes.func,
  onRegister: PropTypes.func,
  onDeregister: PropTypes.func
}
