import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import addHours from "date-fns/add_hours";

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

    // TODO: currentBid should come from the parcel
    // TODO: endsAt?

    appendUnconfirmedBid({
      address: addressState.data.address,
      x: parcel.x,
      y: parcel.y,
      currentBid: null,
      yourBid: value,
      endsAt: addHours(new Date(), 12)
    });

    // TODO: update in-memory manaBalance

    onClose();
  };

  render() {
    const { data, addressState, ...props } = this.props;

    // TODO: addressState could be loading here

    return (
      <BidParcelModal
        parcel={data}
        manaBalance={addressState.data.balance}
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
