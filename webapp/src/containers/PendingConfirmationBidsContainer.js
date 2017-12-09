import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { confirmBids, deleteUnconfirmedBid } from '../actions'
import { stateData } from '../lib/propTypes'

import PendingConfirmationBidsTable from '../components/PendingConfirmationBidsTable'

class PendingConfirmationBidsContainer extends React.Component {
  static propTypes = {
    pendingConfirmationBids: stateData(PropTypes.array),
    deleteUnconfirmedBid: PropTypes.func,
    confirmBids: PropTypes.func
  }

  deleteBid = bid => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete your bid for ${bid.x},${bid.y} ?`
    )

    if (isConfirmed) {
      this.props.deleteUnconfirmedBid(bid)
    }
  }

  confirmBids = event => {
    const { pendingConfirmationBids, confirmBids } = this.props

    const bids = pendingConfirmationBids.data.map(bid => ({
      x: bid.x,
      y: bid.y,
      bidGroupId: bid.bidGroupId,
      bidIndex: bid.bidIndex,
      address: bid.address,
      amount: bid.yourBid
    }))

    confirmBids(bids)
  }

  componentDidUpdate(prevProps, prevState) {
    const { pendingConfirmationBids } = this.props

    // scroll down on insert
    if (
      pendingConfirmationBids.data.length >
      prevProps.pendingConfirmationBids.data.length
    ) {
      this.contentElement.scrollTop = this.contentElement.scrollHeight
    }
  }

  render() {
    const { pendingConfirmationBids } = this.props

    return (
      <PendingConfirmationBidsTable
        pendingConfirmationBids={pendingConfirmationBids}
        onConfirmBids={this.confirmBids}
        onDeleteBid={this.deleteBid}
        contentRef={e => (this.contentElement = e)}
      />
    )
  }
}

export default connect(
  state => ({
    pendingConfirmationBids: selectors.getPendingConfirmationBids(state)
  }),
  { confirmBids, deleteUnconfirmedBid }
)(PendingConfirmationBidsContainer)
