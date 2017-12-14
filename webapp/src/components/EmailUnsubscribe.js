import React from 'react'
import { Link } from 'react-router-dom'

import locations from '../locations'

import Navbar from './Navbar'
import Loading from './Loading'
import SuccessCheck from './SuccessCheck'
import Button from './Button'

import './EmailUnsubscribe.css'

export default function EmailUnsubscribe({ email, onUnsubscribe }) {
  return (
    <div className="EmailUnsubscribe">
      <Navbar />

      <div className="content">
        {email.loading ? (
          <Loading />
        ) : (
          <div>
            <h2>Unsubscribe</h2>

            {email.data === '' ? (
              <div>
                <p>You are now unsubscribed</p>
                <div>
                  <SuccessCheck />
                </div>
                <br />
                <Link to={locations.root}>Go back</Link>
              </div>
            ) : (
              <div>
                <p>
                  You are about to unsubscribe <b>{email.data}</b>
                  <br />
                  <br />
                  After unsubscribing, you will no longer receive email
                  notifications for existing or future bids in the Terraform
                  Auction
                </p>

                <Button type="primary" onClick={onUnsubscribe}>
                  Confirm
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
