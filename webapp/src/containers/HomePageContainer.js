import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { selectors } from "../reducers";
import { connectWeb3 } from "../actions";
import { stateData } from "../lib/propTypes";
import { isEmptyObject } from "../lib/util";

import HomePage from "../components/HomePage";

class HomePageContainer extends React.Component {
  static propTypes = {
    connectWeb3: PropTypes.func,
    parcelStates: stateData(PropTypes.object).isRequired,
    addressState: stateData(PropTypes.object).isRequired
  };

  componentWillMount() {
    this.props.connectWeb3();
  }

  render() {
    const { parcelStates, addressState } = this.props;
    const requiredDataReady = !isEmptyObject(parcelStates) && addressState.data;

    return <HomePage requiredDataReady={!!requiredDataReady} />;
  }
}

export default connect(
  state => ({
    parcelStates: selectors.getParcelStates(state),
    addressState: selectors.getAddressState(state)
  }),
  { connectWeb3 }
)(HomePageContainer);
