import React from 'react'

import './HelpButton.css'

export default function HelpButton({ onClick }) {
  return (
    <div className="HelpButton" onClick={onClick}>
      ?
    </div>
  )
}
