import React from "react";
import { Link } from "react-router-dom";

import ErrorPage from "./ErrorPage";

export default function WalletErrorPage(children) {
  return (
    <ErrorPage>
      <h2>Wallet error</h2>
      <p>We could not retrieve your account&#39;s information.</p>
      <p>You may not be using a dApp compatible browser.</p>
      <p>Is your account connected and unlocked?</p>
      <br />
      <p>
        You can use&nbsp;
        <Link to="https://metamask.io/" target="_blank">
          Metamask
        </Link>
        &nbsp;or&nbsp;
        <Link to="https://github.com/ethereum/mist" target="_blank">
          Mist
        </Link>.
      </p>
    </ErrorPage>
  );
}
