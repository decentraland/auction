import React from "react";
import PropTypes from "prop-types";

import Navbar from "./Navbar";
import "./ErrorPage.css";

export default function ErrorPage({ children }) {
  return (
    <div className="ErrorPage">
      <Navbar />
      <div className="error-message">
        <div>{children}</div>
      </div>
    </div>
  );
}

ErrorPage.propTypes = {
  children: PropTypes.node.isRequired
};
