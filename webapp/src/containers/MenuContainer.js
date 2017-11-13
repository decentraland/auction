import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import addHours from "date-fns/add_hours";

import { selectors } from "../reducers";
import { stateData } from "../lib/propTypes";

import ShowMenu from "../components/ShowMenu";
import Menu from "../components/Menu";

class MenuContainer extends React.Component {
  static propTypes = {
    addressState: stateData(PropTypes.object).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      menuVisible: false
    };
  }

  changeMenuVisibility(menuVisible) {
    this.setState({
      menuVisible
    });
  }

  render() {
    const { menuVisible } = this.state;
    const outgoingAuctions = [
      {
        x: 1,
        y: 3,
        status: "Outbid",
        amount: "15.000 MANA",
        endsAt: addHours(new Date(), 23),
        address: "0x8f649FE750340A295dDdbBd7e1EC8f378cF24b42"
      },
      {
        x: 2,
        y: 1,
        status: "Won",
        amount: "3.300 MANA",
        endsAt: addHours(new Date(), -2),
        address: ""
      },
      {
        x: 1,
        y: 3,
        status: "Winning",
        amount: "15.000 MANA",
        endsAt: addHours(new Date(), 12),
        address: ""
      },
      {
        x: 3,
        y: 3,
        status: "Lost",
        amount: "3.926 MANA",
        endsAt: addHours(new Date(), -5),
        address: "0x8f649FE750340A295dDdbBd7e1EC8f378cF24b42"
      }
    ];
    const { addressState } = this.props;

    return [
      <ShowMenu key="1" onShow={() => this.changeMenuVisibility(true)} />,
      <Menu
        key="2"
        addressState={addressState}
        visible={menuVisible}
        outgoingAuctions={outgoingAuctions}
        onHide={() => this.changeMenuVisibility(false)}
      />
    ];
  }
}

export default connect(
  state => ({ addressState: selectors.getAddressState(state) }),
  {}
)(MenuContainer);
