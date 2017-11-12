import React from "react";
import PropTypes from "prop-types";

import preventDefault from "../../lib/preventDefault";
import { ONE_LAND_IN_MANA } from "../../lib/land";

import Modal from "./Modal";
import Button from "../Button";

import "./BidParcelModal.css";

export default class BidParcelModal extends React.Component {
  static propTypes = {
    ...Modal.propTypes,
    parcel: PropTypes.object.isRequired,
    manaBalance: PropTypes.string.isRequired,
    onBid: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      bidValue: null
    };
  }

  onBid = event => {
    const { bidValue } = this.state;
    const { parcel, manaBalance } = this.props;

    // TODO: Check the bidValue is bigger than the current bid
    if (bidValue >= ONE_LAND_IN_MANA && bidValue <= manaBalance) {
      this.props.onBid(parcel, bidValue);
    }
  };

  onBidValueChange = event => {
    const bidValue = parseFloat(event.currentTarget.value, 10);
    this.setState({ bidValue: bidValue || ONE_LAND_IN_MANA });
  };

  render() {
    const { parcel, manaBalance, onClose, ...props } = this.props;

    return (
      <Modal className="BidParcelModal" onClose={onClose} {...props}>
        <div className="modal-body">
          <p className="text">
            You are bidding on the LAND {parcel.x},{parcel.y}
            <br />
            The minimun cost is 1,000 MANA
          </p>

          {manaBalance >= ONE_LAND_IN_MANA ? (
            <BidForm
              manaBalance={manaBalance}
              onBid={preventDefault(this.onBid)}
              onBidValueChange={this.onBidValueChange}
              onClose={onClose}
            />
          ) : (
            <p className="text">You don&#39;t have enough balance to bid.</p>
          )}
        </div>
      </Modal>
    );
  }
}

function BidForm({ manaBalance, onBid, onBidValueChange, onClose }) {
  return (
    <form action="POST" onSubmit={onBid}>
      <div className="manaInput">
        <span className="text">{ONE_LAND_IN_MANA}</span>
        <input
          type="number"
          required="required"
          placeholder="Mana to bid"
          className="manaToBid"
          min={ONE_LAND_IN_MANA}
          max={manaBalance}
          onChange={onBidValueChange}
        />
        <span className="text">{manaBalance}</span>
      </div>

      <div className="buttons">
        <Button type="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="primary" isSubmit={true}>
          Bid
        </Button>
      </div>
    </form>
  );
}
