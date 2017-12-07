import React from 'react'
import { Link } from 'react-router-dom'

import ErrorPage from './ErrorPage'

export default function AddressErrorPage() {
  return (
    <ErrorPage>
      <h2>
        Uh-oh.<br /> We couldn&#39;t retrieve your account information.
      </h2>
      <div className="error-message">
        <p>
          We couldn&#39;t retrieve any account information associated with your
          current address. Are you using the correct address?
        </p>
        <br />
        <p>
          Remember that you to participate in the auction
          <br />you need to have MANA staked on the&nbsp;
          <Link to="https://terraform.decentraland.org" target="_blank">
            Terraform Registration
          </Link>
        </p>
        <br />
        <p>
          If your think this is a mistake, please please contact us using&nbsp;
          <Link to="https://chat.decentraland.org" target="_blank">
            Rocket Chat
          </Link>.
        </p>
        <br />
        <p>
          Confused about what&#39;s going on? Check out the&nbsp;
          <Link to="https://wiki.decentraland.org/" target="_blank">
            wiki
          </Link>&nbsp; for answers.
        </p>
      </div>
    </ErrorPage>
  )
}
