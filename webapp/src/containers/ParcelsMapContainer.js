import React from "react";
import { connect } from "react-redux";

import { fetchParcelStateRange } from "../actions";
import selectors from "../selectors";

import ParcelsMap from "../components/ParcelsMap";

class ParcelsMapContainer extends React.Component {
  componentWillMount() {
    this.props.fetchParcelStateRange("0,0", "5,5");
  }

  render() {
    const { parcelStates } = this.props;
    console.log("Got the parcels", parcelStates);

    return (
      <ParcelsMap
        x={10}
        y={10}
        zoom={10}
        tileSize={50}
        onClick={(...args) => console.log("MAP CLICK", args)}
      />
    );
  }
}

export default connect(
  state => ({ parcelStates: selectors.getParcelStates(state) }),
  { fetchParcelStateRange }
)(ParcelsMapContainer);
