import React from 'react'

import locations from '../locations'
import { shortenAddress } from '../lib/util'
import * as dateUtils from '../lib/dateUtils'
import * as parcelUtils from '../lib/parcelUtils'

import CurrentBidStatus from './CurrentBidStatus'

import './ParcelPopup.css'

export default function ParcelPopup(props) {
  const { x, y, parcel, addressState, projects } = props

  const className = parcelUtils.getClassName(parcel, addressState)

  let endsAt = dateUtils.distanceInWordsToNow(parcel.endsAt, { endedText: '' })

  if (!dateUtils.isBeforeToday(parcel.endsAt)) {
    endsAt = `Ends in ${endsAt}`
  }

  return (
    <div className="parcel-popup">
      {className && (
        <div className={`header ${className}`}>
          {parcelUtils.getBidStatus(parcel, addressState)}
        </div>
      )}
      <div className="body">
        <div className="coordinates">
          {x},{y}
        </div>

        {parcel.address && (
          <div className="address-link">
            <a href={locations.addressStatsDetails(parcel.address)} target="_blank">
              {shortenAddress(parcel.address)}
            </a>
          </div>
        )}

        <CurrentBidStatus
          addressState={addressState}
          parcel={parcel}
          projects={projects}
        />

        {parcel.amount && <div className="text mana">{parcel.amount} MANA</div>}

        {endsAt && <div className="text">{endsAt}</div>}
      </div>
    </div>
  )
}
