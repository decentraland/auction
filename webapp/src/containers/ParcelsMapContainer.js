import React from "react";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import { fetchParcelStateRange } from "../actions";

import ParcelsMap from "../components/ParcelsMap";
import Loading from "../components/Loading";

class ParcelsMapContainer extends React.Component {
  componentWillMount() {
    // TODO: fetch on pan
    // this.props.fetchParcelStateRange("0,0", "5,5");
  }

  render() {
    const { parcelStates } = this.props;

    console.log("Got the parcels", parcelStates);
    // TODO: x,y from URL

    const View =
      parcelStates.length === 0 ? (
        <Loading />
      ) : (
        <ParcelsMap
          x={0}
          y={0}
          zoom={10}
          bounds={[[-20.5, -20.5], [20.5, 20.5]]}
          tileSize={128}
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
