import React from "react";

import MenuContainer from "../containers/MenuContainer";
import SearchContainer from "../containers/SearchContainer";
import PendingConfirmationBidsContainer from "../containers/PendingConfirmationBidsContainer";
import ParcelsMapContainer from "../containers/ParcelsMapContainer";
import ModalContainer from "../containers/modals/ModalContainer";

import "./HomePage.css";

export default class HomePage extends React.Component {
  getCenter() {
    const { x, y } = this.props.match.params;

    return {
      x: parseInt(x, 10) || 0,
      y: parseInt(y, 10) || 0
    };
  }

  render() {
    return (
      <div className="HomePage">
        <div className="controls">
          <MenuContainer />
          <SearchContainer />
          <PendingConfirmationBidsContainer />
        </div>
        <ParcelsMapContainer center={this.getCenter()} />
        <ModalContainer />
      </div>
    );
  }
}
