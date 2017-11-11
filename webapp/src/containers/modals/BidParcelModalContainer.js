import React from "react";
import { connect } from "react-redux";

import { selectors } from "../../reducers";

import { BidParcelModal } from "../../components/modals";

class BidParcelModalContainer extends React.Component {
  onBid = value => {
    console.log("BIDDING ", value);
  };

  render() {
    const { data, manaBalance, ...props } = this.props;

    // TODO: Handle loading mana balance on BidParcelModal

    return (
      <BidParcelModal
        parcel={data}
        manaBalance={manaBalance.data}
        onBid={this.onBid}
        {...props}
      />
    );
  }
}

export default connect(
  state => ({ manaBalance: selectors.getManaBalance(state) }),
  {}
)(BidParcelModalContainer);
