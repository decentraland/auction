import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../../reducers'
import { intentUnconfirmedBid, closeMenu } from '../../actions'
import { stateData } from '../../lib/propTypes'

import { BidParcelModal } from '../../components/modals'

class BidParcelModalContainer extends React.Component {
  static propTypes = {
    addressState: stateData(PropTypes.object).isRequired,
    pendingConfirmationBids: stateData(PropTypes.array).isRequired,
    intentUnconfirmedBid: PropTypes.func.isRequired,
    closeMenu: PropTypes.func.isRequired
    // Here we should extend ...ModelContainer.propTypes but webpack is broken and doesn't understand the import
    // Try it yourself: import ModalContainer from "./ModalContainer"
  }

  onBid = value => {
    const {
      data,
      intentUnconfirmedBid,
      addressState,
      onClose,
      closeMenu
    } = this.props
    const parcel = data

    intentUnconfirmedBid({
      address: addressState.data.address,
      x: parcel.x,
      y: parcel.y,
      currentBid: parcel.amount,
      yourBid: value,
      endsAt: parcel.endsAt
    })
    closeMenu()
    onClose()
  }

  render() {
    const { data, addressState, pendingConfirmationBids, ...props } = this.props

    return (
      <BidParcelModal
        parcel={data}
        addressState={addressState}
        pendingConfirmationBids={pendingConfirmationBids}
        onBid={this.onBid}
        {...props}
      />
    )
  }
}

export default connect(
  state => ({
    addressState: selectors.getAddressState(state),
    pendingConfirmationBids: selectors.getPendingConfirmationBids(state)
  }),
  { intentUnconfirmedBid, closeMenu }
)(BidParcelModalContainer)
