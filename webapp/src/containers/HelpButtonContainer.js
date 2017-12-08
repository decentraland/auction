import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { openModal } from '../actions'

import HelpButton from '../components/HelpButton'

class HelpButtonContainer extends React.Component {
  static propTypes = {
    openModal: PropTypes.func
  }

  openIntroModal = () => {
    this.props.openModal('IntroModal')
  }

  render() {
    return <HelpButton onClick={this.openIntroModal} />
  }
}

export default connect(() => ({}), { openModal })(HelpButtonContainer)
