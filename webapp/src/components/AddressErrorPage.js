import React from "react";
import { Link } from "react-router-dom";

import ErrorPage from "./ErrorPage";

export default function WalletErrorPage(children) {
  return (
    <ErrorPage>
      <h2>Address error</h2>
      <p>
        We could not retrieve any account information for your current address.
      </p>
      <p>
        If your think this is a mistake, please please contact us using{" "}
        <Link to="https://chat.decentraland.org" target="_blank">
          Rocket Chat
        </Link>.
      </p>
    </ErrorPage>
  );
}
