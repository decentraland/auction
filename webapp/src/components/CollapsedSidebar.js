import React from 'react'

import SidebarDashboard from './SidebarDashboard'
import HelpButtonContainer from '../containers/HelpButtonContainer'

import './CollapsedSidebar.css'

export default function CollapsedSidebar({ dashboard, onClick }) {
  return (
    <div className="CollapsedSidebar" onClick={onClick}>
      <SidebarDashboard dashboard={dashboard} />
      <HelpButtonContainer />
    </div>
  )
}
