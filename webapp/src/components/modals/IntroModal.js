import React from 'react'

import Modal from './Modal'
import Icon from '../Icon'
import Button from '../Button'

import './IntroModal.css'

export default class IntroModal extends React.Component {
  static propTypes = {
    ...Modal.propTypes
  }

  render() {
    const { onClose, ...props } = this.props

    return (
      <Modal className="IntroModal modal-lg" onClose={onClose} {...props}>
        <div className="banner">
          <Icon name="decentraland" />
          <h2>Welcome to the Terraform Auction</h2>
        </div>

        <div className="modal-body">
          <p className="text">
            From December 12 to December 20 the community is shaping the world
            of Decentraland.
          </p>
          <p className="text">
            <b>Parcels</b>
            <br />
            There are 250,000 parcels of land available in Decentraland,
            bringing the average price of a parcel to 3,400 MANA. Districts have
            been placed around the world.
          </p>

          <p className="text">
            <b>Minimum Bids</b>
            <br />
            Each parcel of land has a minimum bid amount 10% higher than the
            previous bid.
          </p>

          <p className="text">
            <b>Timeline</b>
            <br />
            The auction will be open for 120 hours. Any parcels with active bids
            at that time will remain active, with a 36-hour closing period after
            each new bid. Once all active bids have been won, Unused MANA will
            be returned.
          </p>

          <div className="land-color-keys">
            <h3>Land Color Key</h3>

            <div className="left">
              <div className="lands">
                <div className="land">
                  <div className="key">
                    <div className="key active active-top-half" />
                    <div className="key active active-bottom-half" />
                  </div>
                  <div className="text">ACTIVE</div>
                </div>
                <div className="land">
                  <div className="key won" />
                  <div className="text">WON</div>
                </div>
                <div className="land">
                  <div className="key lost" />
                  <div className="text">LOST</div>
                </div>
              </div>

              <div className="lands">
                <div className="land">
                  <div className="key outbid" />
                  <div className="text">OUTBID</div>
                </div>
                <div className="land">
                  <div className="key winning" />
                  <div className="text">WINNING</div>
                </div>
                <div className="land">
                  <div className="key pending" />
                  <div className="text">PENDING</div>
                </div>
              </div>
            </div>

            <div className="right">
              <div className="lands">
                <div className="land">
                  <div className="key reserved" />
                  <div className="text">RESERVED</div>
                </div>
                <div className="land">
                  <div className="key taken" />
                  <div className="text">TAKEN</div>
                </div>
              </div>

              <div className="lands">
                <div className="land">
                  <div className="key default" />
                  <div className="text">EMPTY</div>
                </div>
                <div className="land">
                  <div className="key loading" />
                  <div className="text">LOADING</div>
                </div>
              </div>
            </div>
          </div>

          <div className="get-started">
            <Button type="primary" onClick={onClose}>
              Get Started
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
