import React from "react";
import { connect } from "react-redux";

import { changeLocation } from "../actions";
import locations from "../locations";

import * as parcelUtils from "../lib/parcelUtils";

import Search from "../components/Search";

class MenuContainer extends React.Component {
  onSelect = coordinate => {
    const [x, y] = coordinate.split(",");
    this.props.changeLocation(locations.parcelDetail(x, y));
  };

  getCoordinates() {
    return parcelUtils.generateMatrix(-160, -160, 160, 160);
  }

  render() {
    return (
      <Search coordinates={this.getCoordinates()} onSelect={this.onSelect} />
    );
  }
}

export default connect(state => ({}), { changeLocation })(MenuContainer);
