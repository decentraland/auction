import React from "react";
import { Route } from "react-router";

import locations from "./locations";

import Root from "./components/Root";
import Parcels from "./components/Parcels";

export default function Routes() {
  return (
    <Root>
      <Route exact path={locations.root} component={Parcels} />
    </Root>
  );
}
