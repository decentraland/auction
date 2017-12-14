import React from 'react'
import PropTypes from 'prop-types'

import './RegisterEmail.css'

export default class RegisterEmail extends React.Component {
  static propTypes = {
    onSignup: PropTypes.func
  }

  render() {
    const { onSignup } = this.props

    return (
      <div className="RegisterEmail">
        <div>
          <div className="updates-text">
            <h3>Sign up for updates</h3>
            <p>
              Sign up for updates on your bids every 8 hours. Any new parcels
              will be added to your notification emails automatically.
            </p>
            <span className="link" onClick={onSignup}>Click here to start</span>
          </div>
        </div>
      </div>
    )
  }
}
