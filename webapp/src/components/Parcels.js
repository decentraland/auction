import React from "react";
import { connect } from "react-redux";

import { fetchParcelStateRange } from "../actions";
import selectors from "../selectors";

class Parcels extends React.Component {
  componentWillMount() {
    this.props.fetchParcelStateRange("0,0", "5,5");
  }

  render() {
    const { parcelStates } = this.props;

    console.log("Got the parcels", parcelStates);

    return (
      <div className="container">
        <h1>Parcels</h1>
      </div>
    );
  }
}

export default connect(
  state => ({
    parcelStates: selectors.getParcelStates(state)
  }),
  {
    fetchParcelStateRange
  }
)(Parcels);
