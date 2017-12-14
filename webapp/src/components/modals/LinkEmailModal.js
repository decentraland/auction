import React from 'react'
import PropTypes from 'prop-types'

import { preventDefault } from '../../lib/util'

import Modal from './Modal'
import Icon from '../Icon'
import Button from '../Button'
import SuccessCheck from '../SuccessCheck'

import './LinkEmailModal.css'

export default class LinkEmailModal extends React.Component {
  static propTypes = {
    ...Modal.propTypes,
    currentEmail: PropTypes.string,
    email: PropTypes.string.isRequired,
    onEmailChange: PropTypes.func.isRequired,
    onSign: PropTypes.func.isRequired
  }

  getLinkGraphName() {
    return this.props.currentEmail ? 'linked-graph' : 'link-graph'
  }

  render() {
    const {
      currentEmail,
      email,
      onEmailChange,
      onSign,
      onClose,
      ...props
    } = this.props

    return (
      <Modal className="LinkEmailModal modal-lg" onClose={onClose} {...props}>
        <div className="banner">
          <Icon name="decentraland" />
          <h2>Link your email to your public wallet address</h2>
          <Icon name={this.getLinkGraphName()} />
        </div>

        <div className="modal-body">
          <div>
            <p>Please link your MetaMask or Mist to your email address.</p>
            <p>This email is where you will recieve bid status updates.</p>
            <p>
              By entering it below and signing it to your MetaMask or Mist, you
              prevent others from stealing your notifications and ensure you
              recieve the correct status update
            </p>
          </div>

          {currentEmail ? (
            <div className="success">
              <SuccessCheck />
            </div>
          ) : (
            <form action="POST" onSubmit={preventDefault(onSign)}>
              <div className="email-container">
                <input
                  type="email"
                  className="email"
                  placeholder="Email"
                  value={email}
                  onChange={onEmailChange}
                />
              </div>

              <div className="sign-button">
                <Button type="primary" isSubmit={true}>
                  Sign
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    )
  }
}
