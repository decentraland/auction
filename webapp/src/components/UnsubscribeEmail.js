import React from 'react'
import PropTypes from 'prop-types'

import './UnsubscribeEmail.css'

export default class UnsubscribeEmail extends React.Component {
  static propTypes = {
    currentEmail: PropTypes.string,
    onUnsubscribe: PropTypes.func
  }

  render() {
    const { currentEmail, onUnsubscribe } = this.props

    return (
      <div className="UnsubscribeEmail">
        <div className="content">
          <h3>
            Updates
            <span className="unsubscribe" onClick={onUnsubscribe}>
              Unsubscribe
            </span>
          </h3>
          <p>You are subscribed with {currentEmail}</p>
        </div>
      </div>
    )
  }
}
