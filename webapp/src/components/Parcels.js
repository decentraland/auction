import React from "react";
import { connect } from "react-redux";

import { fetchParcelStateRange } from "../actions";

class Parcels extends React.Component {
  componentWillMount() {
    this.props.fetchParcelStateRange("0,0", "5,5");
  }

  render() {
    return (
      <div className="container">
        <h1>Parcels</h1>
      </div>
    );
  }
}

export default connect(() => ({}), {
  fetchParcelStateRange
})(Parcels);
