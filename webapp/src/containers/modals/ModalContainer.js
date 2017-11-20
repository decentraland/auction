import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../../reducers'
import { closeModal } from '../../actions'

import { preventDefault } from '../../lib/util'

import * as modals from '../../components/modals'
import * as modalContainers from './index'

class ModalContainer extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    data: PropTypes.object,
    onClose: PropTypes.func
  }

  render() {
    const { modal, closeModal } = this.props
    const { open, name, data } = modal

    let ModalComponent = modalContainers[name + 'Container'] || modals[name]

    if (!ModalComponent) {
      if (name) {
        console.warn(`Couldn't find "${name}" as a modals or modal container`)
      }
      ModalComponent = modals.Modal
    }

    return (
      <ModalComponent
        visible={open}
        data={data}
        onClose={preventDefault(closeModal)}
      />
    )
  }
}

export default connect(state => ({ modal: selectors.getModal(state) }), {
  closeModal
})(ModalContainer)
