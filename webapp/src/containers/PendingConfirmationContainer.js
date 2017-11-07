import React from "react";
import { connect } from "react-redux";

import PendingConfirmationTable from "../components/PendingConfirmationTable";

class PendingConfirmationContainer extends React.Component {
  render() {
    const pendingConfirmation = [
      {
        land: "1.32",
        yourBid: "16.000 MANA",
        currentBid: "15.000 MANA",
        timeLeft: "12 hours",
        address: "0x34…abcd"
      },
      {
        land: "14.50",
        yourBid: "3.300 MANA",
        currentBid: "N/A",
        timeLeft: "Not started yet",
        address: ""
      },
      {
        land: "9.3",
        yourBid: "15.000 MANA",
        currentBid: "N/A",
        timeLeft: "Not started yet",
        address: ""
      }
    ];

    return (
      <PendingConfirmationTable
        pendingConfirmation={pendingConfirmation}
        onConfirmBids={() => {}}
      />
    );
  }
}

export default connect(state => () => ({}), {})(PendingConfirmationContainer);
