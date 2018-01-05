import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { connectWeb3, openModal } from '../actions'
import { stateData } from '../lib/propTypes'
import { isEmptyObject } from '../lib/util'
import localStorage from '../lib/localStorage'

import HomePage from '../components/HomePage'

const AUCTION_CLOSED = true

class HomePageContainer extends React.Component {
  static propTypes = {
    connectWeb3: PropTypes.func,
    openModal: PropTypes.func,
    parcelStates: stateData(PropTypes.object).isRequired,
    addressState: stateData(PropTypes.object).isRequired
  }

  constructor(props) {
    super(props)

    this.seenClosingModal = false
  }

  componentDidMount() {
    this.props.connectWeb3()
  }

  componentDidUpdate(prevProps, prevState) {
    if (AUCTION_CLOSED && this.seenClosingModal) return

    const isReady = this.isRequiredDataReady()

    if (isReady && AUCTION_CLOSED) {
      this.props.openModal('ClosingModal')
      this.seenClosingModal = true
    } else if (isReady && !localStorage.getItem('seenIntro')) {
      this.props.openModal('IntroModal')
      localStorage.setItem('seenIntro', new Date().getTime())
    }
  }

  isRequiredDataReady() {
    const { parcelStates, addressState } = this.props
    const requiredDataReady = !isEmptyObject(parcelStates) && addressState.data

    return !!requiredDataReady
  }

  render() {
    return <HomePage requiredDataReady={this.isRequiredDataReady()} />
  }
}

export default connect(
  state => ({
    parcelStates: selectors.getParcelStates(state),
    addressState: selectors.getAddressState(state)
  }),
  { connectWeb3, openModal }
)(HomePageContainer)
