import React from 'react'

import Icon from './Icon'

import './ShiftNotification.css'

export default function ShiftNotification() {
  return (
    <div className="ShiftNotification">
      <h3>
        <Icon name="shift" /> Shift + Click
      </h3>
      <p>
        While holding shift, clicking on a parcel will automatically add the
        minimum bid to your pending confirmations.
      </p>
    </div>
  )
}
