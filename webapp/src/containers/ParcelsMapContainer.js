import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import locations from "../locations";
import { parcelRangeChange, openModal, changeLocation } from "../actions";
import * as parcelUtils from "../lib/parcelUtils";
import { stateData } from "../lib/propTypes";

import ParcelsMap from "../components/ParcelsMap";
import Loading from "../components/Loading";

class ParcelsMapContainer extends React.Component {
  static propTypes = {
    parcelStates: stateData(PropTypes.object).isRequired,
    addressState: stateData(PropTypes.object).isRequired,
    parcelRangeChange: PropTypes.func.isRequired,
    requiredDataReady: PropTypes.bool,
    center: PropTypes.shape({
      x: PropTypes.string,
      y: PropTypes.string
    }),
    openModal: PropTypes.func.isRequired,
    changeLocation: PropTypes.func.isRequired
  };

  static defaultProps = {
    center: {
      x: "0",
      y: "0"
    }
  };

  constructor(props) {
    super(props);

    const { minX, minY, maxX, maxY } = parcelUtils.getBounds();
    this.bounds = [[minX, minY], [maxX, maxY]];

    this.baseZoom = 10;
    this.baseTileSize = 128;

    this.state = {
      zoom: this.baseZoom
    };
  }

  componentWillMount() {
    this.fetchCoordinateVicinity(this.getCenter());
  }

  getCenter() {
    const { x, y } = this.props.center;
    return {
      x: parseInt(x, 10) || 0,
      y: parseInt(y, 10) || 0
    };
  }

  onMoveEnd = ({ position, bounds }) => {
    this.props.changeLocation(locations.parcelDetail(position.x, position.y));

    const offset = this.getBoundsOffset();

    this.fetchParcelRange(
      bounds.min.x + offset,
      bounds.min.y + offset,
      bounds.max.x - offset,
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
    this.fetchParcelRange(x - 3, y - 3, x + 3, y + 3);
  }

  fetchParcelRange(minX, minY, maxX, maxY) {
    const bounds = parcelUtils.getBounds();

    this.props.parcelRangeChange(
      bounds.minX > minX ? bounds.minX : minX,
      bounds.minY > minY ? bounds.minY : minY,
      bounds.maxX < maxX ? bounds.maxX : maxX,
      bounds.maxY < maxY ? bounds.maxY : maxY
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
    const { requiredDataReady } = this.props;
    const { x, y } = this.getCenter();

    return requiredDataReady ? (
      <ParcelsMap
        x={x}
        y={y}
        minZoom={this.baseZoom - 1}
        maxZoom={this.baseZoom + 1}
        zoom={zoom}
        bounds={this.bounds}
        tileSize={this.getTileSize()}
        getAddressState={this.getAddressState}
        getParcelStates={this.getParcelStates}
        onMoveEnd={this.onMoveEnd}
        onZoomEnd={this.onZoomEnd}
        onParcelBid={this.onParcelBid}
      />
    ) : (
      <Loading />
    );
  }
}

export default withRouter(
  connect(
    (state, ownProps) => ({
      parcelStates: selectors.getParcelStates(state),
      addressState: selectors.getAddressState(state),
      requiredDataReady: ownProps.requiredDataReady,
      center: ownProps.match.params // from withRouter
    }),
    { parcelRangeChange, openModal, changeLocation }
  )(ParcelsMapContainer)
);
