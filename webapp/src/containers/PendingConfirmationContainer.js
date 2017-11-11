import React from "react";
import { connect } from "react-redux";
import addHours from "date-fns/add_hours";

import PendingConfirmationTable from "../components/PendingConfirmationTable";

class PendingConfirmationContainer extends React.Component {
  render() {
    const pendingConfirmation = [
      {
        land: "1.32",
        yourBid: "16000",
        currentBid: "15000",
        endsAt: addHours(new Date(), 12),
        address: "0x8f649FE750340A295dDdbBd7e1EC8f378cF24b42"
      },
      {
        land: "14.50",
        yourBid: "3300",
        currentBid: null,
        endsAt: undefined,
        address: ""
      },
      {
        land: "9.3",
        yourBid: "15000",
        currentBid: undefined,
        endsAt: null,
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
