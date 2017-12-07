import React from 'react'

import Icon from './Icon'

import './ShiftNotification.css'

export default function ShiftNotification() {
  return <div className='shift-notification'>
    <h3>
      <Icon name='Shift' /> Shift + Click
    </h3>
    <p>
      While holding shift, clicking on a parcel will automatically
      add the minimum bid to your pending confirmations.
    </p>
  </div>
}
