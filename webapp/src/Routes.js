import React from 'react'
import { Switch, Route } from 'react-router'

import locations from './locations'

import HomePageContainer from './containers/HomePageContainer'

import WalletErrorPage from './components/WalletErrorPage'
import AddressErrorPage from './components/AddressErrorPage'

export default function Routes() {
  return (
    <Switch>
      <Route exact path={locations.root} component={HomePageContainer} />
      <Route exact path={locations.parcel} component={HomePageContainer} />

      <Route exact path={locations.walletError} component={WalletErrorPage} />
      <Route exact path={locations.addressError} component={AddressErrorPage} />
      <Route exact path={locations.error} component={WalletErrorPage} />
    </Switch>
  )
}
