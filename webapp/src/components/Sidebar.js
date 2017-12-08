import React from 'react'
import PropTypes from 'prop-types'
import { stateData } from '../lib/propTypes'

import Icon from './Icon'
import ExpandedSidebar from './ExpandedSidebar'
import CollapsedSidebar from './CollapsedSidebar'

import './Sidebar.css'

export default class Sidebar extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    addressState: stateData(PropTypes.object).isRequired,
    ongoingAuctions: stateData(PropTypes.array).isRequired,
    dashboard: PropTypes.object.isRequired,
    changeVisibility: PropTypes.func.isRequired
  }

  static defaultProps = {
    visible: false
  }

  toggle = () => {
    const { visible, changeVisibility } = this.props
    changeVisibility(!visible)
  }

  hide = () => {
    this.props.changeVisibility(false)
  }

  getVisibilityClassName() {
    return this.props.visible ? 'in' : 'out'
  }

  render() {
    const { visible, addressState, ongoingAuctions, dashboard } = this.props

    return (
      <div className={`Sidebar ${this.getVisibilityClassName()}`}>
        <header>
          <Icon name="decentraland" />
          {visible && <h1 className="sidebar-title fadein">Decentraland</h1>}
        </header>

        {visible ? (
          <ExpandedSidebar
            addressState={addressState}
            dashboard={dashboard}
            ongoingAuctions={ongoingAuctions}
            onHide={this.hide}
          />
        ) : (
          <CollapsedSidebar dashboard={dashboard} />
        )}

        <div
          className={`toggle-button ${this.getVisibilityClassName()}`}
          onClick={this.toggle}
        />
      </div>
    )
  }
}
