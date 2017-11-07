import React from "react";
import { Switch, Route } from "react-router";

import locations from "./locations";

import Root from "./containers/Root";
import HomePage from "./components/HomePage";
import ErrorPage from "./components/ErrorPage";

export default function Routes() {
  return (
    <Root>
      <Switch>
        <Route exact path={locations.root} component={HomePage} />
        <Route exact path={locations.error} component={ErrorPage} />
      </Switch>
    </Root>
  );
}
