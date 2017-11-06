import React from "react";
import { connect } from "react-redux";

import { fetchParcelStateRange } from "../actions";
import selectors from "../selectors";

import ParcelsMap from "../components/ParcelsMap";
import Loading from "../components/Loading";

class ParcelsMapContainer extends React.Component {
  componentWillMount() {
    this.props.fetchParcelStateRange("0,0", "5,5");
  }

  render() {
    const { parcelStates } = this.props;
    console.log("Got the parcels", parcelStates);

    const View =
      parcelStates.length === 0 ? (
        <Loading />
      ) : (
        <ParcelsMap
          x={10}
          y={10}
          zoom={10}
          tileSize={50}
          onClick={(...args) => console.log("MAP CLICK", args)}
        />
      );

    return View;
  }
}

export default connect(
  state => ({ parcelStates: selectors.getParcelStates(state) }),
  { fetchParcelStateRange }
)(ParcelsMapContainer);
