import React from 'react'

import Icon from './Icon'

import './ShiftNotification.css'

export default function ShiftNotification({ shiftUp }) {
  return (
    <div className="ShiftNotification">
      <h3>
        <Icon name="shift" /> Shift + Click
      </h3>
      <p>Click on parcels to increase the bid on them.</p>
    </div>
  )
}
