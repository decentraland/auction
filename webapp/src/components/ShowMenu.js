import React from 'react'
import PropTypes from 'prop-types'

import Icon from './Icon'
import Loading from './Loading'

import './ShowMenu.css'

export default class ShowMenu extends React.Component {
  render() {
    const { isLoading, onShow } = this.props
    const className = `ShowMenu ${isLoading ? 'ShowMenu-loading' : ''}`

    return (
      <div className={className} onClick={() => onShow()}>
        {isLoading ? <Loading /> : <Icon name="hamburger" />}
      </div>
    )
  }
}

ShowMenu.propTypes = {
  loading: PropTypes.bool,
  onShow: PropTypes.func.isRequired
}

ShowMenu.defaultProps = {
  loading: false
}
