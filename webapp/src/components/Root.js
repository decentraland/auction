import React from "react";

import Navbar from "./Navbar";

import "./Root.css";

class Root extends React.Component {
  render() {
    return (
      <div className="Root">
        <Navbar />
        {this.props.children}
      </div>
    );
  }
}

export default Root;
