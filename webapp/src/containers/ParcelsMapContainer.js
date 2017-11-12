import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import { parcelRangeChange, openModal } from "../actions";
import { isEmptyObject, buildCoordinate } from "../lib/util";
import { stateData } from "../lib/propTypes";

import ParcelsMap from "../components/ParcelsMap";

class ParcelsMapContainer extends React.Component {
  static propTypes = {
    parcelStates: stateData(PropTypes.object).isRequired,
    parcelRangeChange: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.props.parcelRangeChange(-10, 10, -10, 10);
  }

  getParcelData = (x, y) => {
    // TODO: What if the parcel does not exist
    return this.props.parcelStates[buildCoordinate(x, y)];
  };

  onMoveEnd = ({ bounds }) => {
    this.props.parcelRangeChange(
      bounds.min.x,
      bounds.max.x,
      bounds.min.y,
      bounds.max.y
    );
  };

  onParcelBid = parcel => {
    this.props.openModal("BidParcelModal", parcel);
  };

  render() {
    const { parcelStates } = this.props;

    console.log("Got the parcels", parcelStates);
    // TODO: x,y from URL
    // TODO: review getParcelData. We could pass all parcel states and leave it to the component to fetch each one

    const View = isEmptyObject(parcelStates) ? null : (
      <ParcelsMap
        x={0}
        y={0}
        zoom={10}
        bounds={[[-20.5, -20.5], [20.5, 20.5]]}
        tileSize={128}
        getParcelData={this.getParcelData}
        onMoveEnd={this.onMoveEnd}
        onParcelBid={this.onParcelBid}
      />
    );

    return View;
  }
}

export default connect(
  state => ({ parcelStates: selectors.getParcelStates(state) }),
  { parcelRangeChange, openModal }
)(ParcelsMapContainer);
