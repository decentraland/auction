import React from 'react'

import SidebarDashboard from './SidebarDashboard'

import './CollapsedSidebar.css'

export default function CollapsedSidebar({ dashboard }) {
  return (
    <div className="CollapsedSidebar">
      <SidebarDashboard dashboard={dashboard} />
    </div>
  )
}
