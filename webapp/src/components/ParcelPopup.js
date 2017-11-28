import React from 'react'

import shortenAddress from '../lib/shortenAddress'
import * as dateUtils from '../lib/dateUtils'
import * as parcelUtils from '../lib/parcelUtils'

import Button from './Button'
import CurrentBidStatus from './CurrentBidStatus'

export default function ParcelPopup(props) {
  const { x, y, parcel, addressState, projects, onBid } = props

  const unBiddable =
    parcel.error || parcelUtils.isTaken(parcel) || parcelUtils.hasEnded(parcel)

  let endsAt = dateUtils.distanceInWordsToNow(parcel.endsAt, { endedText: '' })

  if (!dateUtils.isBeforeToday(parcel.endsAt)) {
    endsAt = `Ends in ${endsAt}`
  }

  return (
    <div>
      <div className="coordinates">
        {x},{y}
      </div>
      <div className="text">
        {shortenAddress(parcel.address)}
        <CurrentBidStatus
          addressState={addressState}
          parcel={parcel}
          projects={projects}
        />
      </div>
      <div className="text mana">
        {parcel.amount && `${parcel.amount} MANA`}
      </div>
      <div className="text">{endsAt}</div>

      <div className="text-center">
        {!unBiddable && (
          <Button onClick={event => onBid(parcel)}>Place bid</Button>
        )}
      </div>
    </div>
  )
}
