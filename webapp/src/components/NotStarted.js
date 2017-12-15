import React from 'react'

import ErrorPage from './ErrorPage'

export default function NotStarted() {
  return (
    <ErrorPage>
      <h2>
        Welcome!<br />
        <br />
        The auction has not started yet.
      </h2>
      <div className="error-message">
        <br />
        <p>
          In the meanwhile, check out the&nbsp;
          <a
            href="https://auction.decentraland.online/"
            target="_blank"
            rel="noopener noreferrer"
          >
            mock auction
          </a>{' '}
          to try out the interface, or join our&nbsp;
          <a
            href="https://chat.decentraland.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            community chat
          </a>!
        </p>
      </div>
    </ErrorPage>
  )
}
