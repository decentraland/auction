import React from "react";
import { Link } from "react-router-dom";

import locations from "../locations";

import ErrorPage from "./ErrorPage";

export default function WalletErrorPage() {
  return (
    <ErrorPage>
      <h2>Address error</h2>
      <p>
        We couldn&#39;t retrieve any account information for your current
        address.
      </p>
      <p>Maybe you need to use another account?</p>
      <br />
      <p>
        If your think this is a mistake, please please contact us using&nbsp;
        <Link to="https://chat.decentraland.org" target="_blank">
          Rocket Chat
        </Link>.
      </p>
      <br />
      <p>
        Once you&#39;re done you can try again&nbsp;
        <Link to={locations.root}>here</Link>.
      </p>
    </ErrorPage>
  );
}
