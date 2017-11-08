import React from "react";
import PropTypes from "prop-types";

import "./PendingConfirmationTable.css";

export default class PendingConfirmationTable extends React.Component {
  getTotalMana() {
    const { pendingConfirmation } = this.props;

    // TODO: Use BigNumber?
    return pendingConfirmation.reduce(
      (total, confirmation) => total + parseInt(confirmation.yourBid, 10),
      0
    );
  }

  render() {
    const { pendingConfirmation, onConfirmBids } = this.props;

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

          {pendingConfirmation.map((confirmation, index) => (
            <ConfirmationTableRow
              key={index}
              confirmation={confirmation}
              className={index % 2 === 0 ? "gray" : ""}
            />
          ))}

          <form method="POST" action="/confirmBids" onSubmit={onConfirmBids}>
            <div className="table-row confirm-bids">
              <div className="col-land">Total</div>
              <div className="col-your-bid">{this.getTotalMana()} MANA</div>
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

function ConfirmationTableRow({ confirmation, className }) {
  return (
    <div className={`table-row ${className}`}>
      <div className="col-land">{confirmation.land} </div>
      <div className="col-your-bid">{confirmation.yourBid} MANA</div>
      <div className="col-current-bid">{confirmation.currentBid} MANA</div>
      <div className="col-time-left">{confirmation.timeLeft} </div>
      <div className="col-address">{confirmation.address} </div>
    </div>
  );
}
