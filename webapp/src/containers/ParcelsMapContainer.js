import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import { parcelRangeChange, openModal } from "../actions";
import { stateData } from "../lib/propTypes";

import ParcelsMap from "../components/ParcelsMap";

class ParcelsMapContainer extends React.Component {
  static propTypes = {
    center: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    parcelStates: stateData(PropTypes.object).isRequired,
    addressState: stateData(PropTypes.object).isRequired,
    parcelRangeChange: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired
  };

  static defaultProps = {
    center: {
      x: 0,
      y: 0
    }
  };

  componentWillMount() {
    const { x, y } = this.props.center;

    this.lowerBound = -160;
    this.upperBound = 160;
    this.bounds = [
      [this.lowerBound, this.lowerBound],
      [this.upperBound, this.upperBound]
    ];

    this.fetchParcelRange(x - 10, x + 10, y - 10, y + 10);
  }

  onMoveEnd = ({ bounds }) => {
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

  render() {
    const { parcelStates, addressState } = this.props;
    const { x, y } = this.props.center;

    return (
      <ParcelsMap
        x={x}
        y={y}
        zoom={10}
        bounds={this.bounds}
        tileSize={128}
        parcelStates={parcelStates}
        addressState={addressState}
        getParcelData={this.getParcelData}
        getParcelColor={this.getParcelColor}
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
  { parcelRangeChange, openModal }
)(ParcelsMapContainer);
