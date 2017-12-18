import React from 'react'

import StaticPage from './StaticPage'

export default function NotStarted() {
  return (
    <StaticPage>
      <h2>
        Welcome!<br />
        <br />
        The auction has not started yet.
      </h2>
      <div className="message">
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
    </StaticPage>
  )
}
