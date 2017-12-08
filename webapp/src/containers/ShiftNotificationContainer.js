import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as actions from '../actions'
import { selectors } from '../reducers'

import ShiftNotification from '../components/ShiftNotification'

const SHIFT = 'Shift'

class ShiftNotificationContainer extends React.Component {
  static propTypes = {
    shiftneverPressed: PropTypes.boolean,
    shiftDown: PropTypes.function,
    shiftUp: PropTypes.function
  }

  constructor(...args) {
    super(...args)

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
  }

  componentWillMount() {
    window.addEventListener('keydown', this.listenDown)
    window.addEventListener('keyup', this.listenUp)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.listenUp)
    window.removeEventListener('keydown', this.listenDown)
  }

  render() {
    return this.props.shiftneverPressed && <ShiftNotification />
  }
}

export default connect(
  state => ({
    shiftneverPressed: selectors.getShift(state).never
  }),
  {
    shiftDown: actions.shiftDown,
    shiftUp: actions.shiftUp
  }
)(ShiftNotificationContainer)
