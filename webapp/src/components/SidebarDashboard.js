import React from 'react'
import PropTypes from 'prop-types'

import './SidebarDashboard.css'

export default function SidebarDashboard({ dashboard }) {
  return (
    <ul className="SidebarDashboard">
      <li className="balance">
        <div className="dashboard-heading">BALANCE</div>
        <div className="dashboard-value">{dashboard.balance}</div>
      </li>
      <li>
        <div className="dashboard-heading">BIDS</div>
        <div className="dashboard-value">{dashboard.bids}</div>
      </li>
      <li>
        <div className="dashboard-heading">WINNING</div>
        <div className="dashboard-value">{dashboard.winning}</div>
      </li>
      <li>
        <div className="dashboard-heading">LOSING</div>
        <div className="dashboard-value">{dashboard.losing}</div>
      </li>
      <li>
        <div className="dashboard-heading">WON</div>
        <div className="dashboard-value">{dashboard.won}</div>
      </li>
      <li>
        <div className="dashboard-heading">LOST</div>
        <div className="dashboard-value">{dashboard.lost}</div>
      </li>
    </ul>
  )
}

SidebarDashboard.propTypes = {
  dashboard: PropTypes.object
}
