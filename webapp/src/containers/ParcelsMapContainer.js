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
    center: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    parcelStates: stateData(PropTypes.object).isRequired,
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
    // TODO: Don't overfetch. Check the bounds
    this.props.parcelRangeChange(x - 2, x + 2, y - 2, y + 2);
  }

  getParcelData = (x, y) => {
    // TODO: What if the parcel does not exist. We should probably fetch on-demand
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
    const { x, y } = this.props.center;

    console.log("Got the parcels", parcelStates);

    // TODO: Review getParcelData. We could pass all parcel states and leave it to the component to get each one
    const View = isEmptyObject(parcelStates) ? null : (
      <ParcelsMap
        x={x}
        y={y}
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
