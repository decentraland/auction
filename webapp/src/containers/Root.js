import React from "react";
import { connect } from "react-redux";

import { connectWeb3 } from "../actions";

import Navbar from "../components/Navbar";

import "./Root.css";

class Root extends React.Component {
  componentWillMount() {
    this.props.connectWeb3();
  }

  render() {
    return (
      <div className="Root">
        <Navbar />
        {this.props.children}
      </div>
    );
  }
}

export default connect(() => ({}), {
  connectWeb3
})(Root);
