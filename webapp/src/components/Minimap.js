import React from 'react'

import { getBounds } from '../lib/parcelUtils'

import './Minimap.css'

const MINIMAP_SIZE = 150 /* pixels */
const bounds = getBounds()
const PARCELS = bounds.maxX - bounds.minX

const baseY = Math.abs(bounds.minY)
const baseX = Math.abs(bounds.minX)

export default function Minimap({ minY, minX, maxY, maxX }) {
  const top = (minY + baseY) * MINIMAP_SIZE / PARCELS
  const left = (minX + baseX) * MINIMAP_SIZE / PARCELS

  const height = (maxY - minY) * MINIMAP_SIZE / PARCELS
  const width = (maxX - minX) * MINIMAP_SIZE / PARCELS

  return (
    <div className="Minimap">
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
