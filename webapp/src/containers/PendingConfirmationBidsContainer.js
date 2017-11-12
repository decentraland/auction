import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import PendingConfirmationBidsTable from "../components/PendingConfirmationBidsTable";

class PendingConfirmationBidsContainer extends React.Component {
  static propTypes = {
    pendingConfirmationBids: PropTypes.array
  };

  static defaultProps = {
    pendingConfirmationBids: []
  };

  render() {
    const { pendingConfirmationBids } = this.props;

    return (
      <PendingConfirmationBidsTable
        pendingConfirmationBids={pendingConfirmationBids}
        onConfirmBids={() => {}}
      />
    );
  }
}

export default connect(
  state => ({
    pendingConfirmationBids: selectors.getPendingConfirmationBids(state)
  }),
  {}
)(PendingConfirmationBidsContainer);
