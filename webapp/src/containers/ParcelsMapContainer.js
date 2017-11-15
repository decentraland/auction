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

  constructor(props) {
    super(props);

    this.lowerBound = -160;
    this.upperBound = 160;

    this.bounds = [
      [this.lowerBound, this.lowerBound],
      [this.upperBound, this.upperBound]
    ];

    this.baseZoom = 10;
    this.baseTileSize = 128;

    this.state = {
      zoom: this.baseZoom
    };
  }

  componentWillMount() {
    this.fetchCoordinateVicinity(this.props.center);
  }

  onMoveEnd = ({ position, bounds }) => {
    this.props.locationChange(locations.parcelDetail(position.x, position.y));

    const offset = this.getBoundsOffset();

    this.fetchParcelRange(
      bounds.min.x + offset,
      bounds.max.x - offset,
      bounds.min.y + offset,
      bounds.max.y - offset
    );
  };

  onZoomEnd = zoom => {
    this.setState({ zoom });
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

  getTileSize() {
    const zoomDifference = this.baseZoom - this.state.zoom;
    return this.baseTileSize / Math.pow(2, zoomDifference);
  }

  getBoundsOffset() {
    return 3 * (this.baseZoom - this.state.zoom);
  }

  render() {
    const { zoom } = this.state;
    const { parcelStates, addressState } = this.props;
    const { x, y } = this.props.center;

    return isEmptyObject(parcelStates) || !addressState.data ? (
      <Loading />
    ) : (
      <ParcelsMap
        x={x}
        y={y}
        zoom={zoom}
        bounds={this.bounds}
        tileSize={this.getTileSize()}
        getAddressState={this.getAddressState}
        getParcelStates={this.getParcelStates}
        onMoveEnd={this.onMoveEnd}
        onZoomEnd={this.onZoomEnd}
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
