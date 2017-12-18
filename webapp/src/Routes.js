import React from 'react'
import { Switch, Route } from 'react-router'

import locations from './locations'
import { started } from './lib/util'
import { env } from 'decentraland-commons'

import HomePageContainer from './containers/HomePageContainer'
import IntercomContainer from './containers/IntercomContainer'
import EmailUnsubscribeContainer from './containers/EmailUnsubscribeContainer'
import StatsContainer from './containers/StatsContainer'
import AddressStatsContainer from './containers/AddressStatsContainer'

import NotStarted from './components/NotStarted'
import WalletErrorPage from './components/WalletErrorPage'
import ServerError from './components/ServerError'
import AddressErrorPage from './components/AddressErrorPage'
import FAQPage from './components/FAQPage'

export default function Routes() {
  if (started() || env.isDevelopment()) {
    return [
      <Switch key="1">
        <Route exact path={locations.root} component={HomePageContainer} />

        <Route
          exact
          path={locations.addressStats}
          component={AddressStatsContainer}
        />
        <Route exact path={locations.stats} component={StatsContainer} />

        <Route exact path={locations.parcel} component={HomePageContainer} />

        <Route
          exact
          path={locations.unsubscribe}
          component={EmailUnsubscribeContainer}
        />

        <Route exact path={locations.faq} component={FAQPage} />

        <Route exact path={locations.walletError} component={WalletErrorPage} />
        <Route exact path={locations.serverError} component={ServerError} />
        <Route
          exact
          path={locations.addressError}
          component={AddressErrorPage}
        />
        <Route exact path={locations.error} component={WalletErrorPage} />
      </Switch>,
      <IntercomContainer key="2" />
    ]
  } else {
    return <Route path="*" component={NotStarted} />
  }
}
