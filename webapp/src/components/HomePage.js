import React from "react";

import MenuContainer from "../containers/MenuContainer";
import PendingConfirmationContainer from "../containers/PendingConfirmationContainer";
import ParcelsMapContainer from "../containers/ParcelsMapContainer";
import ModalContainer from "../containers/modals/ModalContainer";

import "./HomePage.css";

export default class HomePage extends React.Component {
  render() {
    return (
      <div className="HomePage">
        <div className="controls">
          <MenuContainer />
          <PendingConfirmationContainer />
        </div>
        <ParcelsMapContainer />
        <ModalContainer />
      </div>
    );
  }
}
