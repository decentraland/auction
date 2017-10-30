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

    return <ParcelsMap position={[51.505, -0.09]} zoom={13} />;
  }
}

export default connect(
  state => ({
    parcelStates: selectors.getParcelStates(state)
  }),
  {
    fetchParcelStateRange
  }
)(ParcelsMapContainer);
