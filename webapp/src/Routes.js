import React from 'react'
import { Switch, Route } from 'react-router'

import locations from './locations'

import HomePageContainer from './containers/HomePageContainer'
import IntercomContainer from './containers/IntercomContainer'
import EmailUnsubcribeContainer from './containers/EmailUnsubcribeContainer'

import WalletErrorPage from './components/WalletErrorPage'
import ServerError from './components/ServerError'
import AddressErrorPage from './components/AddressErrorPage'

export default function Routes() {
  return [
    <Switch key="1">
      <Route exact path={locations.root} component={HomePageContainer} />
      <Route exact path={locations.parcel} component={HomePageContainer} />

      <Route
        exact
        path={locations.unsubscribe}
        component={EmailUnsubcribeContainer}
      />

      <Route exact path={locations.walletError} component={WalletErrorPage} />
      <Route exact path={locations.serverError} component={ServerError} />
      <Route exact path={locations.addressError} component={AddressErrorPage} />
      <Route exact path={locations.error} component={WalletErrorPage} />
    </Switch>,
    <IntercomContainer key="2" />
  ]
}
