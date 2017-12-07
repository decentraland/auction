import React from 'react'
import PropTypes from 'prop-types'

import MenuContainer from '../containers/MenuContainer'
import SearchContainer from '../containers/SearchContainer'
import PendingConfirmationBidsContainer from '../containers/PendingConfirmationBidsContainer'
import ParcelsMapContainer from '../containers/ParcelsMapContainer'
import ModalContainer from '../containers/modals/ModalContainer'

import ShiftNotification from './ShiftNotification'

import './HomePage.css'

export default function HomePage({ requiredDataReady, shiftNeverPressed }) {
  return (
    <div className="HomePage">
      {requiredDataReady && (
        <div className="controls">
          <MenuContainer />
          <SearchContainer />
          <PendingConfirmationBidsContainer />
        </div>
      )}
      <ParcelsMapContainer requiredDataReady={requiredDataReady} />
      <ModalContainer />
      { shiftNeverPressed && <ShiftNotification /> }
    </div>
  )
}

HomePage.propTypes = {
  requiredDataReady: PropTypes.bool
}
