import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

// import { selectors } from '../../reducers'
import { registerEmail } from '../../actions'
// import { stateData } from '../../lib/propTypes'

import { LinkEmailModal } from '../../components/modals'

class LinkEmailModalContainer extends React.Component {
  static propTypes = {
    email: PropTypes.object,
    registerEmail: PropTypes.func
    // Here we should extend ...ModalContainer.propTypes but webpack is broken and doesn't understand the import
    // Try it yourself: import ModalContainer from "./ModalContainer"
  }

  constructor(props) {
    super(props)

    this.state = {
      email: ''
    }
  }

  onEmailChange = event => {
    this.setState({ email: event.target.value })
  }

  onRegister = event => {
    this.props.registerEmail(this.state.email)
    event.preventDefault()
  }

  onSign = () => {
    const { onClose } = this.props
    console.log('SIEEEEGGGNN', this.state.email)
    onClose()
    this.setState({ email: '' })
  }

  isRegistered() {
    return false // !!this.props.email.data
  }

  render() {
    console.log('*********************************************')
    console.log(this.state)
    console.log(this.state.email)
    console.log('*********************************************')
    return !this.isRegistered() ? (
      <LinkEmailModal
        {...this.props}
        email={this.state.email}
        onEmailChange={this.onEmailChange}
        onSign={this.onSign}
      />
    ) : null
  }
}

export default connect(state => ({}), {
  registerEmail
})(LinkEmailModalContainer)
