import React from "react";
import { connect } from "react-redux";

import actions from "../actions";

class Parcels extends React.Component {
  componentWillMount() {
    this.props.dispatch(actions.fetchParcelStateRange("0,0", "5,5"));
  }

  render() {
    return (
      <div className="container">
        <h1>Parcels</h1>
      </div>
    );
  }
}

export default connect((state, ownProps) => ({}))(Parcels);
