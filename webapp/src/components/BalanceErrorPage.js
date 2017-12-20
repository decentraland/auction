import React from 'react'

import StaticPage from './StaticPage'

export default function BalanceErrorPage() {
  return (
    <StaticPage>
      <h2>
        Uh-oh.<br /> We couldn&#39;t retrieve your account information.
      </h2>

      <div className="message">
        <p>
          It looks like you’ve contributed all your MANA to districts.
          <br />
          Good news: these parcels have already been placed in the world, eliminating
          the need to bid! Because you don’t have an active balance, you can’t access the auction
        </p>
        <br />
        <p>
          We re-opened the registration! you can commit more MANA&nbsp;
          <a
            href="https://terraform.decentraland.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
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
        <br />
        <p>
          You can also check out the current status of the auction &nbsp;
          <a
            href="https://auction.decentraland.org/stats"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>.
        </p>
      </div>
    </StaticPage>
  )
}

BalanceErrorPage.propTypes = {}
