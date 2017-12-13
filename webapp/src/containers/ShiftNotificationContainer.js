import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actions from '../actions'
import { selectors } from '../reducers'

import ShiftNotification from '../components/ShiftNotification'

const SHIFT = 'Shift'

class ShiftNotificationContainer extends React.Component {
  static propTypes = {
    hasPlacedBids: PropTypes.bool,
    isPressed: PropTypes.bool,
    shiftDown: PropTypes.func,
    shiftUp: PropTypes.func
  }

  constructor(props) {
    super(props)

    this.listenDown = event => {
      if (event.key === SHIFT) {
        this.props.shiftDown()
      }
    }
    this.listenUp = event => {
      if (event.key === SHIFT) {
        this.props.shiftUp()
      }
    }
    this.clear = () => this.props.shiftUp()
  }

  componentWillMount() {
    window.addEventListener('keydown', this.listenDown)
    window.addEventListener('keyup', this.listenUp)
    window.addEventListener('focus', this.clear)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.listenUp)
    window.removeEventListener('keydown', this.listenDown)
    window.removeEventListener('focus', this.clear)
  }

  render() {
    return this.props.hasPlacedBids && this.props.isPressed ? (
      <ShiftNotification />
    ) : (
      <span />
    )
  }
}

export default connect(
  state => ({
    hasPlacedBids: selectors.hasPlacedBids(state),
    isPressed: selectors.isShiftPressed(state)
  }),
  {
    shiftDown: actions.shiftDown,
    shiftUp: actions.shiftUp
  }
)(ShiftNotificationContainer)
