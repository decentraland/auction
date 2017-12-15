import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { connectWeb3, unsubscribeEmail, navigateTo } from '../actions'
import locations from '../locations'

import EmailUnsubscribe from '../components/EmailUnsubscribe'

class EmailUnsubcribeContainer extends React.Component {
  static propTypes = {
    email: PropTypes.object,
    unsubscribeEmail: PropTypes.func
  }

  componentWillMount(props) {
    this.props.connectWeb3()
  }

  componentDidUpdate(prevProps, prevState) {
    const { email, navigateTo } = this.props

    if (!email.loading && email.data === null) {
      navigateTo(locations.root)
    }
  }

  onUnsubscribe = () => {
    this.props.unsubscribeEmail()
  }

  render() {
    const { email } = this.props
    return <EmailUnsubscribe email={email} onUnsubscribe={this.onUnsubscribe} />
  }
}

export default connect(
  state => ({
    email: selectors.getEmail(state)
  }),
  { connectWeb3, unsubscribeEmail, navigateTo }
)(EmailUnsubcribeContainer)
