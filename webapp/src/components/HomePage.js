import React from 'react'
import PropTypes from 'prop-types'

import SidebarContainer from '../containers/SidebarContainer'
import SearchContainer from '../containers/SearchContainer'
import PendingConfirmationBidsContainer from '../containers/PendingConfirmationBidsContainer'
import ParcelsMapContainer from '../containers/ParcelsMapContainer'
import ShiftNotificationContainer from '../containers/ShiftNotificationContainer'
import MinimapContainer from '../containers/MinimapContainer'
import GoogleAnalyticsContainer from '../containers/GoogleAnalyticsContainer'
import HelpButtonContainer from '../containers/HelpButtonContainer'
import ModalContainer from '../containers/modals/ModalContainer'

import './HomePage.css'

export default function HomePage({ requiredDataReady }) {
  return (
    <div className="HomePage">
      {requiredDataReady && (
        <div className="controls">
          <SidebarContainer />
          <div className="top-controls">
            <SearchContainer />
            <PendingConfirmationBidsContainer />
          </div>
          <ShiftNotificationContainer />
        </div>
      )}
      <ParcelsMapContainer requiredDataReady={requiredDataReady} />
      {requiredDataReady && <MinimapContainer />}
      {requiredDataReady && <HelpButtonContainer />}
      <ModalContainer />
      <GoogleAnalyticsContainer />
    </div>
  )
}

HomePage.propTypes = {
  requiredDataReady: PropTypes.bool
}
