import React from "react";
import { Switch, Route } from "react-router";

import locations from "./locations";

import Root from "./containers/Root";
import HomePage from "./components/HomePage";
import WalletErrorPage from "./components/WalletErrorPage";
import AddressErrorPage from "./components/AddressErrorPage";

export default function Routes() {
  return (
    <Root>
      <Switch>
        <Route exact path={locations.root} component={HomePage} />
        <Route exact path={locations.walletError} component={WalletErrorPage} />
        <Route
          exact
          path={locations.addressError}
          component={AddressErrorPage}
        />
        <Route exact path={locations.error} component={WalletErrorPage} />
      </Switch>
    </Root>
  );
}
