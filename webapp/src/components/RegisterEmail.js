import React from 'react'
import PropTypes from 'prop-types'

import './RegisterEmail.css'

export default class RegisterEmail extends React.Component {
  render() {
    const { email, onChange, onRegister } = this.props

    return (
      <div className="RegisterEmail">
        <form action="POST" onSubmit={onRegister}>
          <div className="updates-text">
            <h3>Sign up for updates</h3>
            <p>
              Sign up for updates on your bids every 8 hours. Any new parcels
              will be added to your notification emails automatically.
            </p>
          </div>

          <div className="inputs">
            <input
              type="email"
              value={email}
              required="required"
              placeholder="Email"
              className="email"
              onChange={onChange}
            />

            <input className="submit" type="submit" value="" />
          </div>
        </form>
      </div>
    )
  }
}

RegisterEmail.propTypes = {
  email: PropTypes.string,
  onChange: PropTypes.func,
  onRegister: PropTypes.func
}
