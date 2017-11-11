import React from "react";
import PropTypes from "prop-types";

import preventDefault from "../../lib/preventDefault";

import Modal from "./Modal";
import Button from "../Button";

import "./BidParcelModal.css";

export default class BidParcelModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bidValue: null
    };
  }

  onBid = event => {
    this.props.onBid(this.state.bidValue);
  };

  onBidValueChange = event => {
    const bidValue = parseFloat(event.currentTarget.value, 10) || 1000;
    this.setState({ bidValue });
  };

  render() {
    const { parcel, manaBalance, onClose, ...props } = this.props;

    return (
      <Modal className="BidParcelModal" onClose={onClose} {...props}>
        <div className="modal-body">
          <p>
            You are bidding on the LAND {parcel.x},{parcel.y}
            <br />
            The minimun cost is 1,000 MANA
          </p>

          {manaBalance >= 1000 ? (
            <BidForm
              manaBalance={manaBalance}
              onBid={preventDefault(this.onBid)}
              onBidValueChange={this.onBidValueChange}
              onClose={onClose}
            />
          ) : (
            <p>You don&#39;t have enough balance to bid.</p>
          )}
        </div>
      </Modal>
    );
  }
}

BidParcelModal.propTypes = {
  ...Modal.propTypes,
  parcel: PropTypes.object.isRequired,
  manaBalance: PropTypes.number.isRequired,
  onBid: PropTypes.func.isRequired
};

function BidForm({ manaBalance, onBid, onBidValueChange, onClose }) {
  return (
    <form action="POST" onSubmit={onBid}>
      <span className="limit">1000</span>
      <input
        type="number"
        required="required"
        placeholder="Mana to bid"
        min="1000"
        max={manaBalance}
        onChange={onBidValueChange}
      />
      <span className="limit">{manaBalance}</span>

      <div className="buttons">
        <Button type="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="primary" isSubmit={ true }>Bid</Button>
      </div>
    </form>
  );
}
