import React from 'react'
import PropTypes from 'prop-types'

import './Minimap.css'

const PARCELS = 500
const MINIMAP_SIZE = 150

export default class Minimap extends React.Component {
  static propTypes = {
    minX: PropTypes.number,
    minY: PropTypes.number,
    maxX: PropTypes.number,
    maxY: PropTypes.number
  }

  render() {
    const top = (this.props.minY + 250) * MINIMAP_SIZE / PARCELS
    const left = (this.props.minX + 250) * MINIMAP_SIZE / PARCELS
    const width = (this.props.maxX - this.props.minX) * MINIMAP_SIZE / PARCELS
    const height = (this.props.maxY - this.props.minY) * MINIMAP_SIZE / PARCELS

    return (
      <div className="minimap">
        <div
          className="minimap-focus"
          style={{
            top,
            left,
            width,
            height
          }}
        />
      </div>
    )
  }
}
