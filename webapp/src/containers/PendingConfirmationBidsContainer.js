import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import { deleteUnconfirmedBid } from "../actions";
import PendingConfirmationBidsTable from "../components/PendingConfirmationBidsTable";

class PendingConfirmationBidsContainer extends React.Component {
  static propTypes = {
    pendingConfirmationBids: PropTypes.array,
    deleteUnconfirmedBid: PropTypes.func
  };

  static defaultProps = {
    pendingConfirmationBids: []
  };

  deleteBid = bid => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete your bid for ${bid.x},${bid.y} ?`
    );

    if (isConfirmed) {
      this.props.deleteUnconfirmedBid(bid);
    }
  };

  confirmBids = bids => {
    console.log("Confirming bids", bids);
  };

  render() {
    const { pendingConfirmationBids } = this.props;

    return (
      <PendingConfirmationBidsTable
        pendingConfirmationBids={pendingConfirmationBids}
        onConfirmBids={this.confirmBids}
        onDeleteBid={this.deleteBid}
      />
    );
  }
}

export default connect(
  state => ({
    pendingConfirmationBids: selectors.getPendingConfirmationBids(state)
  }),
  { deleteUnconfirmedBid }
)(PendingConfirmationBidsContainer);
