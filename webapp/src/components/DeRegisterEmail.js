import React from 'react'
import PropTypes from 'prop-types'

import './DeRegisterEmail.css'

export default class DeRegisterEmail extends React.Component {
  render() {
    const { currentEmail, onDeregister } = this.props

    return (
      <div className="DeRegisterEmail">
        <div className="content">
          <h3>
            Updates
            <span className="unsubscribe" onClick={onDeregister}>
              Unsubscribe
            </span>
          </h3>
          <p>You are subscribed with {currentEmail}</p>
        </div>
      </div>
    )
  }
}

DeRegisterEmail.propTypes = {
  currentEmail: PropTypes.string,
  onDeregister: PropTypes.func
}
