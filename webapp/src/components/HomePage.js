import React from "react";

import MenuContainer from "../containers/MenuContainer";
import SearchContainer from "../containers/SearchContainer";
import PendingConfirmationBidsContainer from "../containers/PendingConfirmationBidsContainer";
import ParcelsMapContainer from "../containers/ParcelsMapContainer";
import ModalContainer from "../containers/modals/ModalContainer";

import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="HomePage">
      <div className="controls">
        <MenuContainer />
        <SearchContainer />
        <PendingConfirmationBidsContainer />
      </div>
      <ParcelsMapContainer />
      <ModalContainer />
    </div>
  );
}
