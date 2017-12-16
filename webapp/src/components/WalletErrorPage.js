import React from 'react'

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
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Metamask
          </a>
          &nbsp; or&nbsp;
          <a
            href="https://github.com/ethereum/mist"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mist
          </a>
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
          <a
            href="https://wiki.decentraland.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            wiki
          </a>&nbsp; for answers.
        </p>
      </div>

      <a className="btn retry" href="/">
        Retry
      </a>
    </ErrorPage>
  )
}
