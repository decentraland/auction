import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { fetchOngoingAuctions } from '../actions'
import { stateData } from '../lib/propTypes'

import ShowMenu from '../components/ShowMenu'
import Menu from '../components/Menu'

class MenuContainer extends React.Component {
  static propTypes = {
    addressState: stateData(PropTypes.object).isRequired,
    ongoingAuctions: stateData(PropTypes.array),
    fetchOngoingAuctions: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      menuVisible: false
    }
  }

  changeMenuVisibility(menuVisible) {
    this.setState({ menuVisible })

    if (menuVisible) {
      // Wait a bit for the Menu animation to end
      setTimeout(() => this.props.fetchOngoingAuctions(), 500)
    }
  }

  render() {
    const { menuVisible } = this.state
    const { addressState, ongoingAuctions } = this.props

    return [
      <ShowMenu key="1" onShow={() => this.changeMenuVisibility(true)} />,
      <Menu
        key="2"
        addressState={addressState}
        visible={menuVisible}
        ongoingAuctions={ongoingAuctions}
        onHide={() => this.changeMenuVisibility(false)}
      />
    ]
  }
}

export default connect(
  state => ({
    addressState: selectors.getAddressState(state),
    ongoingAuctions: selectors.getOngoingAuctions(state)
  }),
  { fetchOngoingAuctions }
)(MenuContainer)
