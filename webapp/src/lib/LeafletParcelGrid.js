import L from 'leaflet'

const LeafletParcelGrid = L.FeatureGroup.extend({
  include: L.Mixin.Events,
  options: {
    cellSize: 64,
    delayFactor: 0.05,
    smoothFactor: 2,
    style: {
      weight: 2,
      opacity: 1,

      fill: true,
      fillOpacity: 0.85,

      clickable: true
    }
  },

  initialize(options) {
    L.Util.setOptions(this, options)
    L.FeatureGroup.prototype.initialize.call(this, [], options)
  },

  onAdd(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map)
    this.map = map
    this.cells = []
    this.setupGrid(map.getBounds())

    map.on('moveend', this.moveHandler, this)
    map.on('zoomend', this.zoomHandler, this)
    map.on('resize', this.resizeHandler, this)
  },

  onRemove(map) {
    L.FeatureGroup.prototype.onRemove.call(this, map)

    map.off('moveend', this.moveHandler, this)
    map.off('zoomend', this.zoomHandler, this)
    map.off('resize', this.resizeHandler, this)
  },

  clearLayer() {
    this.cells = []
  },

  moveHandler(event) {
    this.renderCells(event.target.getBounds())
  },

  zoomHandler(event) {
    this.clearLayers()
    this.renderCells(event.target.getBounds())
  },

  resizeHandler() {
    this.setupSize()
  },

  setupGrid(bounds) {
    this.origin = this.map.project(bounds.getNorthWest())
    this.cellSize = this.options.cellSize

    this.setupSize()

    this.loadedCells = {}
    this.loadedCoordinates = {}

    this.clearLayers()
    this.renderCells(bounds)
  },

  setupSize() {
    this.rows = Math.ceil(this.map.getSize().x / this.cellSize)
    this.cols = Math.ceil(this.map.getSize().y / this.cellSize)
  },

  renderCells(bounds) {
    const cells = this.getCellsInBounds(bounds)
    this.fire('newcells', cells)

    for (let index = cells.length - 1; index >= 0; index--) {
      this.loadCell(cells[index], this.options.delayFactor * index)
    }
  },

  loadCell(cell, renderDelay) {
    const { className, dataset, style } = this.options.getTileAttributes(
      cell.center
    )

    if (this.loadedCells[cell.id] !== className) {
      const attributes = Object.assign({ className }, this.options.style, style)
      const { x, y } = dataset

      setTimeout(
        () => this.addRectangleLayer(cell, attributes, dataset),
        renderDelay
      )

      if (this.shouldShowCoordinates(x, y)) {
        this.loadCellCoordinates(cell, x, y)
      }

      this.loadedCells[cell.id] = className
    }
  },

  addRectangleLayer(cell, attributes, dataset) {
    const rect = L.rectangle(cell.bounds, attributes)
    this.addLayer(rect)

    const element = rect.getElement()
    if (element) {
      // Important! this will be used to determine the x,y position later on
      // Check ParcelsMap#addPopup
      Object.assign(element.dataset, dataset)
    }
  },

  loadCellCoordinates(cell, x, y) {
    if (!this.loadedCoordinates[cell.id]) {
      const marker = L.marker(cell.bounds.getNorthWest(), {
        icon: new L.DivIcon({
          className: `coordinates coordinates-zoom-${this.map.getZoom()}`,
          iconSize: new L.Point(0, 0),
          html: `${x},${y}`
        })
      })

      setTimeout(() => this.addLayer(marker))

      this.loadedCoordinates[cell.id] = true
    }
  },

  shouldShowCoordinates(x, y) {
    return x % 10 === 0 && y % 10 === 0
  },

  getCellPoint(row, col) {
    const x = this.origin.x + row * this.cellSize
    const y = this.origin.y + col * this.cellSize
    return new L.Point(x, y)
  },

  getCellExtent(row, col) {
    const swPoint = this.getCellPoint(row, col)
    const nePoint = this.getCellPoint(row - 1, col - 1)
    const sw = this.map.unproject(swPoint)
    const ne = this.map.unproject(nePoint)
    return new L.LatLngBounds(ne, sw)
  },

  getCellsInBounds(bounds) {
    const offset = this.getBoundsOffset(bounds)
    const mainCenter = bounds.getCenter()

    const cells = []

    for (let i = 0; i <= this.rows; i++) {
      for (let j = 0; j <= this.cols; j++) {
        const row = i - offset.rows
        const col = j - offset.cols
        const cellBounds = this.getCellExtent(row, col)
        const cellCenter = cellBounds.getCenter()

        cells.push({
          id: row + ':' + col,
          bounds: cellBounds,
          center: cellCenter,
          distance: cellCenter.distanceTo(mainCenter)
        })
      }
    }

    return cells
  },

  getBoundsOffset(bounds) {
    const offset = this.map.project(bounds.getNorthWest())
    const offsetX = this.origin.x - offset.x
    const offsetY = this.origin.y - offset.y

    return {
      rows: Math.round(offsetX / this.cellSize),
      cols: Math.round(offsetY / this.cellSize)
    }
  }
})

export default LeafletParcelGrid
