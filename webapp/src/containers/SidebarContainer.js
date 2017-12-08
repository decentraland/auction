import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { fetchOngoingAuctions, openSidebar, closeSidebar } from '../actions'
import { stateData } from '../lib/propTypes'

import Sidebar from '../components/Sidebar'

class SidebarContainer extends React.Component {
  static propTypes = {
    addressState: stateData(PropTypes.object).isRequired,
    ongoingAuctions: stateData(PropTypes.array),
    fetchOngoingAuctions: PropTypes.func,
    sidebar: PropTypes.shape({
      open: PropTypes.boolean
    }),
    openSidebar: PropTypes.func.isRequired,
    closeSidebar: PropTypes.func.isRequired
  }

  changeVisibility = visible => {
    if (visible) {
      this.props.openSidebar()

      // Skip a frame to avoid lagging the sidebar animation
      setTimeout(() => this.props.fetchOngoingAuctions(), 0)
    } else {
      this.props.closeSidebar()
    }
  }

  render() {
    const { parcelStates, addressState, ongoingAuctions, sidebar } = this.props
    const isLoading = parcelStates.loading || addressState.loading

    return isLoading ? null : (
      <Sidebar
        key="2"
        addressState={addressState}
        visible={sidebar.open}
        ongoingAuctions={ongoingAuctions}
        changeVisibility={this.changeVisibility}
      />
    )
  }
}

export default connect(
  state => ({
    parcelStates: selectors.getParcelStates(state),
    addressState: selectors.getAddressState(state),
    ongoingAuctions: selectors.getOngoingAuctions(state),
    sidebar: selectors.getSidebar(state)
  }),
  { fetchOngoingAuctions, openSidebar, closeSidebar }
)(SidebarContainer)
