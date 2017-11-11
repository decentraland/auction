import React from "react";
import { connect } from "react-redux";
import addHours from "date-fns/add_hours";

import { selectors } from "../reducers";

import ShowMenu from "../components/ShowMenu";
import Menu from "../components/Menu";

class MenuContainer extends React.Component {
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
        land: "1.32",
        status: "Outbid",
        amount: "15.000 MANA",
        endsAt: addHours(new Date(), 23),
        address: "0x8f649FE750340A295dDdbBd7e1EC8f378cF24b42"
      },
      {
        land: "14.50",
        status: "Won",
        amount: "3.300 MANA",
        endsAt: addHours(new Date(), -2),
        address: ""
      },
      {
        land: "9.3",
        status: "Winning",
        amount: "15.000 MANA",
        endsAt: addHours(new Date(), 12),
        address: ""
      },
      {
        land: "46.3",
        status: "Lost",
        amount: "3.926 MANA",
        endsAt: addHours(new Date(), -5),
        address: "0x8f649FE750340A295dDdbBd7e1EC8f378cF24b42"
      }
    ];
    const { manaBalance } = this.props;

    return [
      <ShowMenu key="1" onShow={() => this.changeMenuVisibility(true)} />,
      <Menu
        key="2"
        manaBalance={manaBalance}
        visible={menuVisible}
        outgoingAuctions={outgoingAuctions}
        onHide={() => this.changeMenuVisibility(false)}
      />
    ];
  }
}

export default connect(
  state => ({ manaBalance: selectors.getManaBalance(state) }),
  {}
)(MenuContainer);
