import React from "react";
import PropTypes from "prop-types";

import { distanceInWordsToNow } from "../lib/dateUtils";
import { buildCoordinate } from "../lib/util";
import shortenAddress from "../lib/shortenAddress";

import "./PendingConfirmationBidsTable.css";

export default class PendingConfirmationBidsTable extends React.Component {
  getTotalMana() {
    const { pendingConfirmationBids } = this.props;

    // TODO: Use BigNumber?
    return pendingConfirmationBids.reduce(
      (total, confirmation) => total + parseFloat(confirmation.yourBid, 10),
      0
    );
  }

  render() {
    const { pendingConfirmationBids, onConfirmBids } = this.props;

    if (pendingConfirmationBids.length === 0) {
      return null;
    }

    // TODO: Add `remove` button
    return (
      <div className="PendingConfirmationBidsTable">
        <h3>Pending Confirmation</h3>

        <div className="table">
          <div className="table-row table-header">
            <div className="col-land">LAND</div>
            <div className="col-your-bid">YOUR BID</div>
            <div className="col-current-bid">CURRENT BID</div>
            <div className="col-time-left">TIME LEFT</div>
            <div className="col-address">ADDRESS</div>
          </div>

          {pendingConfirmationBids.map((confirmation, index) => (
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

PendingConfirmationBidsTable.propTypes = {
  pendingConfirmationBids: PropTypes.array.isRequired,
  onConfirmBids: PropTypes.func.isRequired
};

function ConfirmationTableRow({ confirmation, className }) {
  const land = buildCoordinate(confirmation.x, confirmation.y);

  const currentBid = isAvailable(confirmation.currentBid)
    ? `${confirmation.currentBid} MANA`
    : "N/A";

  const timeLeft = distanceInWordsToNow(confirmation.endsAt, {
    endedText: "Not started yet"
  });

  return (
    <div className={`table-row ${className}`}>
      <div className="col-land">{land}</div>
      <div className="col-your-bid">{confirmation.yourBid} MANA</div>
      <div className="col-current-bid">{currentBid}</div>
      <div className="col-time-left">{timeLeft} </div>
      <div className="col-address">{shortenAddress(confirmation.address)} </div>
    </div>
  );
}

function isAvailable(bidValue) {
  return bidValue !== "N/A" && parseFloat(bidValue) > 0;
}
