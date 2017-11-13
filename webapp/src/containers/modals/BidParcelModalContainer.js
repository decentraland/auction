import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectors } from "../../reducers";
import { appendUnconfirmedBid } from "../../actions";
import { stateData } from "../../lib/propTypes";

import { BidParcelModal } from "../../components/modals";

class BidParcelModalContainer extends React.Component {
  static propTypes = {
    addressState: stateData(PropTypes.object).isRequired,
    pendingConfirmationBids: PropTypes.array.isRequired,
    appendUnconfirmedBid: PropTypes.func.isRequired
  };

  onBid = (parcel, value) => {
    const { appendUnconfirmedBid, addressState, onClose } = this.props;

    appendUnconfirmedBid({
      address: addressState.data.address,
      x: parcel.x,
      y: parcel.y,
      currentBid: parcel.amount,
      yourBid: value,
      endsAt: parcel.endsAt
    });

    onClose();
  };

  render() {
    const { data, addressState, ...props } = this.props;

    return (
      <BidParcelModal
        parcel={data}
        addressState={addressState}
        onBid={this.onBid}
        {...props}
      />
    );
  }
}

export default connect(
  state => ({
    addressState: selectors.getAddressState(state),
    pendingConfirmationBids: selectors.getPendingConfirmationBids(state)
  }),
  { appendUnconfirmedBid }
)(BidParcelModalContainer);
