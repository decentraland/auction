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
            <a
              className="Unsubscribe"
              onClick={onDeregister}
            >
              Unsubscribe
            </a>
          </div>
        )}
        {!currentEmail && (
          <form action="POST" onSubmit={onRegister}>
            <div className="EmailRegistered">
              <input
                type="email"
                value={email}
                required="required"
                placeholder="Enter your email to be notified about the auction"
                className="Email"
                onChange={onChange}
              />
              <input
                className="Submit btn btn-primary Button"
                type="submit"
                value="Subscribe"
              />
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
