import L from 'leaflet'

import { buildCoordinate } from './util'

const LeafletParcelGrid = L.FeatureGroup.extend({
  include: L.Mixin.Events,
  options: {
    cellSize: 64,
    delayFactor: 0.1,
    smoothFactor: 2,
    style: {
      weight: 2,
      opacity: 1,

      fill: true,
      fillOpacity: 0.85,

      clickable: true
    }
  },

  initialize: function(options) {
    L.Util.setOptions(this, options)
    L.FeatureGroup.prototype.initialize.call(this, [], options)
  },

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map)
    this.map = map
    this.cells = []
    this.setupGrid(map.getBounds())

    map.on('moveend', this.moveHandler, this)
    map.on('zoomend', this.zoomHandler, this)
    map.on('resize', this.resizeHandler, this)
  },

  onRemove: function(map) {
    L.FeatureGroup.prototype.onRemove.call(this, map)

    map.off('moveend', this.moveHandler, this)
    map.off('zoomend', this.zoomHandler, this)
    map.off('resize', this.resizeHandler, this)
  },

  clearLayer: function(e) {
    this.cells = []
  },

  moveHandler: function(e) {
    this.renderCells(e.target.getBounds())
  },

  zoomHandler: function(e) {
    this.clearLayers()
    this.renderCells(e.target.getBounds())
  },

  renderCells: function(bounds) {
    let cells = this.cellsInBounds(bounds)
    this.fire('newcells', cells)

    for (let index = cells.length - 1; index >= 0; index--) {
      this.loadCell(cells[index], index)
    }
  },

  loadCell(cell, index) {
    const { className, style, coordinates } = this.options.getTileAttributes(
      cell.center
    )

    if (this.loadedCells[cell.id] !== className) {
      const rectStyles = Object.assign({ className }, this.options.style, style)
      const delay = this.options.delayFactor * index

      setTimeout(
        () => this.addLayer(L.rectangle(cell.bounds, rectStyles)),
        delay
      )

      if (coordinates) {
        this.loadCellCoordinates(cell, coordinates)
      }

      this.loadedCells[cell.id] = className
    }
  },

  loadCellCoordinates(cell, coordinates) {
    if (!this.loadedCoordinates[cell.id]) {
      const marker = L.marker(cell.bounds.getNorthWest(), {
        icon: new L.DivIcon({
          className: `coordinates coordinates-zoom-${this.map.getZoom()}`,
          iconSize: new L.Point(0, 0),
          html: coordinates
        })
      })
      setTimeout(() => this.addLayer(marker))
      this.loadedCoordinates[cell.id] = true
    }
  },

  resizeHandler: function(e) {
    this.setupSize()
  },

  setupSize: function() {
    this.rows = Math.ceil(this.map.getSize().x / this.cellSize)
    this.cols = Math.ceil(this.map.getSize().y / this.cellSize)
  },

  setupGrid: function(bounds) {
    this.origin = this.map.project(bounds.getNorthWest())
    this.cellSize = this.options.cellSize
    this.setupSize()
    this.loadedCells = {}
    this.loadedCoordinates = {}
    this.clearLayers()
    this.renderCells(bounds)
  },

  cellPoint: function(row, col) {
    let x = this.origin.x + row * this.cellSize
    let y = this.origin.y + col * this.cellSize
    return new L.Point(x, y)
  },

  cellExtent: function(row, col) {
    let swPoint = this.cellPoint(row, col)
    let nePoint = this.cellPoint(row - 1, col - 1)
    let sw = this.map.unproject(swPoint)
    let ne = this.map.unproject(nePoint)
    return new L.LatLngBounds(ne, sw)
  },

  cellsInBounds: function(bounds) {
    let offset = this.map.project(bounds.getNorthWest())
    let center = bounds.getCenter()
    let offsetX = this.origin.x - offset.x
    let offsetY = this.origin.y - offset.y
    let offsetRows = Math.round(offsetX / this.cellSize)
    let offsetCols = Math.round(offsetY / this.cellSize)

    let cells = []

    for (let i = 0; i <= this.rows; i++) {
      for (let j = 0; j <= this.cols; j++) {
        let row = i - offsetRows
        let col = j - offsetCols
        let cellBounds = this.cellExtent(row, col)

        cells.push({
          id: buildCoordinate(row, col),
          bounds: cellBounds,
          center: cellBounds.getCenter(),
          distance: cellBounds.getCenter().distanceTo(center)
        })
      }
    }

    cells.sort((a, b) => a.distance - b.distance)

    return cells
  }
})

export default LeafletParcelGrid
