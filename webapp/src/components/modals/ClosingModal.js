import React from 'react'

import Modal from './Modal'
import Icon from '../Icon'
import Button from '../Button'

import './ClosingModal.css'

export default class ClosingModal extends React.Component {
  static propTypes = {
    ...Modal.propTypes
  }

  render() {
    const { onClose, ...props } = this.props

    return (
      <Modal className="ClosingModal modal-lg" onClose={onClose} {...props}>
        <div className="banner">
          <h2>
            <Icon name="decentraland" /> <p>Thank you for participating</p>
          </h2>
        </div>

        <div className="modal-body">
          <div className="text">
            <h4>Bidding has ended</h4>
            <p>
              Thank you making the Genesis City auction the largest virtual land
              auction in history. Collectively, Genesis City is now owned by 57
              districts and 3,047 individuals from accross the Decentraland
              community.
            </p>
          </div>

          <div className="text">
            <h4>MANA Return</h4>
            <p>
              Unused MANA will be returned to your account. If you don't see
              your returned MANA and believe there has been a mistake, check
              your address stats page for transactions and make sure you're
              using the address you used for the auction. If you still see a
              mistake, reach out to us on{' '}
              <a href="https://chat.decentraland.org/channel/general">
                RocketChat
              </a>.
            </p>
          </div>

          <div className="text">
            <h4>Auction Statistics</h4>
            <p>
              MANA to be burned: 161,351,111. Average parcel price: 3,647 MANA.
              For a full list of{' '}
              <a href="https://auction.decentraland.org/stats">
                global auction stats
              </a>, check out the stats page.
            </p>
          </div>

          <div className="get-started">
            <Button type="primary" onClick={onClose}>
              Explore Genesis City
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
