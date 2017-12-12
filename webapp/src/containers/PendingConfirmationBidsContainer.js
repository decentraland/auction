import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { openModal, confirmBids, deleteUnconfirmedBid } from '../actions'
import { stateData } from '../lib/propTypes'
import { buildCoordinate } from '../lib/util'

import PendingConfirmationBidsTable from '../components/PendingConfirmationBidsTable'

class PendingConfirmationBidsContainer extends React.Component {
  static propTypes = {
    pendingConfirmationBids: stateData(PropTypes.array),
    deleteUnconfirmedBid: PropTypes.func,
    confirmBids: PropTypes.func,
    openModal: PropTypes.func
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

  editBid = bid => {
    const parcel = {
      id: buildCoordinate(bid.x, bid.y),
      x: bid.x,
      y: bid.y,
      address: bid.address,
      amount: bid.currentBid,
      yourBid: bid.yourBid,
      endsAt: bid.endsAt
    }

    this.props.openModal('BidParcelModal', parcel)
  }

  deleteBid = bid => this.props.deleteUnconfirmedBid(bid)

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

  setContentElement = element => {
    this.contentElement = element
  }

  render() {
    const { pendingConfirmationBids } = this.props

    return (
      <PendingConfirmationBidsTable
        pendingConfirmationBids={pendingConfirmationBids}
        onConfirmBids={this.confirmBids}
        onEditBid={this.editBid}
        onDeleteBid={this.deleteBid}
        contentRef={this.setContentElement}
      />
    )
  }
}

export default connect(
  state => ({
    pendingConfirmationBids: selectors.getPendingConfirmationBids(state)
  }),
  { openModal, confirmBids, deleteUnconfirmedBid }
)(PendingConfirmationBidsContainer)
