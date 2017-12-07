import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'

import Minimap from '../components/Minimap.js'

class MinimapContainer extends React.Component {
  static propTypes = {
    range: PropTypes.shape({
      minX: PropTypes.number,
      minY: PropTypes.number,
      maxX: PropTypes.number,
      maxY: PropTypes.number
    })
  }

  render() {
    return <Minimap {...this.props.range} />
  }
}

export default connect(state => ({
  range: selectors.getRange(state)
}))(MinimapContainer)
