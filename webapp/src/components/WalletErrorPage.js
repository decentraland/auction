import React from 'react'
import { Link } from 'react-router-dom'

import ErrorPage from './ErrorPage'

export default function WalletErrorPage() {
  return (
    <ErrorPage>
      <h2>
        Uh-oh. <br />
        We couldn’t retrieve your wallet information.
      </h2>
      <div className="error-message">
        <p>
          Please make sure your&nbsp;
          <Link to="https://metamask.io" target="_blank">
            Metamask
          </Link>
          &nbsp; or&nbsp;
          <Link to="https://github.com/ethereum/mist" target="_blank">
            Mist
          </Link>
          &nbsp;account is connected and unlocked, then refresh the page.
        </p>
        <br />
        <p>
          If you’ve just installed Metamask or Mist, restarting your browser
          usually fixes the problem.
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
