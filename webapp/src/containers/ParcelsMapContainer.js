import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import locations from "../locations";
import { parcelRangeChange, openModal, locationChange } from "../actions";
import { isEmptyObject } from "../lib/util";
import { stateData } from "../lib/propTypes";

import ParcelsMap from "../components/ParcelsMap";
import Loading from "../components/Loading";

class ParcelsMapContainer extends React.Component {
  static propTypes = {
    center: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    parcelStates: stateData(PropTypes.object).isRequired,
    addressState: stateData(PropTypes.object).isRequired,
    parcelRangeChange: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    locationChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    center: {
      x: 0,
      y: 0
    }
  };

  componentWillMount() {
    this.lowerBound = -160;
    this.upperBound = 160;
    this.bounds = [
      [this.lowerBound, this.lowerBound],
      [this.upperBound, this.upperBound]
    ];

    this.fetchCoordinateVicinity(this.props.center);
  }

  onMoveEnd = ({ position, bounds }) => {
    this.props.locationChange(locations.parcelDetail(position.x, position.y));

    this.fetchParcelRange(
      bounds.min.x,
      bounds.max.x,
      bounds.min.y,
      bounds.max.y
    );
  };

  onParcelBid = parcel => {
    this.props.openModal("BidParcelModal", parcel);
  };

  fetchCoordinateVicinity({ x, y }) {
    this.fetchParcelRange(x - 3, x + 3, y - 3, y + 3);
  }

  fetchParcelRange(minX, maxX, minY, maxY) {
    this.props.parcelRangeChange(
      this.fixToBounds(minX),
      this.fixToBounds(maxX),
      this.fixToBounds(minY),
      this.fixToBounds(maxY)
    );
  }

  fixToBounds(coordinate) {
    return Math.floor(
      coordinate < this.lowerBound || coordinate > this.upperBound
        ? this.bound
        : coordinate
    );
  }

  getAddressState = () => {
    return this.props.addressState.data;
  };

  getParcelStates = () => {
    return this.props.parcelStates;
  };

  render() {
    const { parcelStates, addressState } = this.props;
    const { x, y } = this.props.center;

    return isEmptyObject(parcelStates) || !addressState.data ? (
      <Loading />
    ) : (
      <ParcelsMap
        x={x}
        y={y}
        zoom={10}
        bounds={this.bounds}
        tileSize={128}
        getAddressState={this.getAddressState}
        getParcelStates={this.getParcelStates}
        onMoveEnd={this.onMoveEnd}
        onParcelBid={this.onParcelBid}
      />
    );
  }
}

export default connect(
  state => ({
    parcelStates: selectors.getParcelStates(state),
    addressState: selectors.getAddressState(state)
  }),
  { parcelRangeChange, openModal, locationChange }
)(ParcelsMapContainer);
