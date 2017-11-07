import React from "react";
import PropTypes from "prop-types";

import "./PendingConfirmationTable.css";

export default class PendingConfirmationTable extends React.Component {
  render() {
    const { pendingConfirmation, onConfirmBids } = this.props;

    // TODO: pendingConfirmation to render data

    return (
      <div className="PendingConfirmationTable">
        <h3>Pending Confirmation</h3>

        <div className="table">
          <div className="table-row table-header">
            <div className="col-land">LAND</div>
            <div className="col-your-bid">YOUR BID</div>
            <div className="col-current-bid">CURRENT BID</div>
            <div className="col-time-left">TIME LEFT</div>
            <div className="col-address">ADDRESS</div>
          </div>

          <div className="table-row">
            <div className="col-land">1.32</div>
            <div className="col-your-bid">16.000 MANA</div>
            <div className="col-current-bid">15.000 MANA</div>
            <div className="col-time-left">12 hours</div>
            <div className="col-address">0x34…abcd</div>
          </div>

          <div className="table-row gray">
            <div className="col-land">14.50</div>
            <div className="col-your-bid">3.300 MANA</div>
            <div className="col-current-bid">N/A</div>
            <div className="col-time-left">Not started yet</div>
            <div className="col-address" />
          </div>

          <form method="POST" action="/confirmBids" onSubmit={onConfirmBids}>
            <div className="table-row confirm-bids">
              <div className="col-land">Total</div>
              <div className="col-your-bid">19.000 MANA</div>
              <div className="col-current-bid" />
              <div className="col-time-left" />
              <div className="col-address btn btn-default">Confirm Bids</div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

PendingConfirmationTable.propTypes = {
  pendingConfirmation: PropTypes.array.isRequired,
  onConfirmBids: PropTypes.func.isRequired
};
