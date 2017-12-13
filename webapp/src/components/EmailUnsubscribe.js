import React from 'react'

import Navbar from './Navbar'

import Button from './Button'
import './EmailUnsubscribe.css'

export default function EmailUnsubscribe(props) {
  return (
    <div className="EmailUnsubscribe">
      <Navbar />

      <div className="content">
        <div>
          <h2>Unsubscribe</h2>
          <p>
            You are about to unsubscribe <b>{props.email}</b>
          </p>
          <Button type="primary" onClick={props.onUnsubscribe}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
