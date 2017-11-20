import React from 'react'
import PropTypes from 'prop-types'

import Icon from './Icon'

import './ShowMenu.css'

export default class ShowMenu extends React.Component {
  render() {
    const { onShow } = this.props

    return (
      <div className="ShowMenu" onClick={() => onShow()}>
        <Icon name="hamburger" />
      </div>
    )
  }
}

ShowMenu.propTypes = {
  onShow: PropTypes.func.isRequired
}
