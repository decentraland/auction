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
    parcelStates: stateData(PropTypes.object).isRequired,
    ongoingAuctions: stateData(PropTypes.array),
    fetchOngoingAuctions: PropTypes.func,
    sidebar: PropTypes.shape({
      open: PropTypes.boolean
    }),
    openSidebar: PropTypes.func.isRequired,
    closeSidebar: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.fetchOngoingAuctions()
  }

  changeVisibility = visible => {
    if (visible) {
      this.props.openSidebar()
      this.props.fetchOngoingAuctions()
    } else {
      this.props.closeSidebar()
    }
  }

  getDashboardData() {
    const { ongoingAuctions, addressState } = this.props

    if (ongoingAuctions.data) {
      return {
        balance: addressState.data.balance,
        bids: ongoingAuctions.data.length,
        winning: this.countBidsByStatus('Winning'),
        losing: this.countBidsByStatus('Outbid'),
        won: this.countBidsByStatus('Won'),
        lost: this.countBidsByStatus('Lost')
      }
    } else {
      return {
        balance: '--',
        bids: '--',
        winning: '--',
        losing: '--',
        won: '--',
        lost: '--'
      }
    }
  }

  countBidsByStatus(status) {
    return this.props.ongoingAuctions.data.filter(
      auction => auction.status === status
    ).length
  }

  isLoading() {
    const { loading, addressState, parcelStates } = this.props
    return loading || addressState.loading || parcelStates.loading
  }

  render() {
    const { addressState, ongoingAuctions, sidebar } = this.props

    return (
      <Sidebar
        visible={sidebar.open}
        isLoading={this.isLoading()}
        addressState={addressState}
        ongoingAuctions={ongoingAuctions}
        dashboard={this.getDashboardData()}
        changeVisibility={this.changeVisibility}
      />
    )
  }
}

export default connect(
  state => ({
    addressState: selectors.getAddressState(state),
    parcelStates: selectors.getParcelStates(state),
    ongoingAuctions: selectors.getOngoingAuctions(state),
    loading: selectors.getLoading(state),
    sidebar: selectors.getSidebar(state)
  }),
  { fetchOngoingAuctions, openSidebar, closeSidebar }
)(SidebarContainer)
