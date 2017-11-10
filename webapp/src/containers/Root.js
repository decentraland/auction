import React from "react";

import "./Root.css";

export default class Root extends React.Component {
  render() {
    return this.props.children;
  }
}
