import React from "react";

import MenuContainer from "../containers/MenuContainer";
import PendingConfirmationBidsContainer from "../containers/PendingConfirmationBidsContainer";
import ParcelsMapContainer from "../containers/ParcelsMapContainer";
import ModalContainer from "../containers/modals/ModalContainer";

import "./HomePage.css";

export default class HomePage extends React.Component {
  render() {
    return (
      <div className="HomePage">
        <div className="controls">
          <MenuContainer />
          <PendingConfirmationBidsContainer />
        </div>
        <ParcelsMapContainer />
        <ModalContainer />
      </div>
    );
  }
}
