import L from 'leaflet'
import debounce from 'lodash.debounce'

const LeafletParcelGrid = L.FeatureGroup.extend({
  include: L.Mixin.Events,
  options: {
    getTileAttributes: () => {},
    onTileClick: () => {},
    addPopup: () => {},
    tileSize: 64,
    delayFactor: 0.05,
    smoothFactor: 2,
    style: {
      weight: 1,
      opacity: 1,

      fill: true,
      fillOpacity: 0.9,

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
    this.tiles = []
    this.popup = null
    this.debouncedOnMouseOver = debounce(this.onMouseOver, 215)
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
    this.tiles = []
  },

  moveHandler(event) {
    this.renderTiles(event.target.getBounds())
  },

  zoomHandler(event) {
    this.clearLayers()
    this.renderTiles(event.target.getBounds())
  },

  resizeHandler() {
    this.setupSize()
  },

  setupGrid(bounds) {
    this.origin = this.map.project(bounds.getNorthWest())
    this.tileSize = this.options.tileSize

    this.setupSize()

    this.loadedTiles = {}
    this.loadedCoordinates = {}

    this.clearLayers()
    this.renderTiles(bounds)
  },

  setupSize() {
    this.rows = Math.ceil(this.map.getSize().x / this.tileSize)
    this.cols = Math.ceil(this.map.getSize().y / this.tileSize)
  },

  renderTiles(bounds) {
    const tiles = this.getCellsInBounds(bounds)
    this.fire('newtiles', tiles)

    for (let index = tiles.length - 1; index >= 0; index--) {
      this.loadCell(tiles[index], this.options.delayFactor * index)
    }
  },

  loadCell(tile, renderDelay) {
    const { className, dataset, style } = this.options.getTileAttributes(
      tile.center
    )

    if (this.loadedTiles[tile.id] !== className) {
      const attributes = Object.assign({ className }, this.options.style, style)
      const { x, y } = dataset

      setTimeout(
        () => this.addRectangleLayer(tile, attributes, x, y),
        renderDelay
      )

      if (this.shouldShowCoordinates(x, y)) {
        this.loadCellCoordinates(x, y, tile)
      }

      this.loadedTiles[tile.id] = className
    }
  },

  addRectangleLayer(tile, attributes, x, y) {
    const rect = L.rectangle(tile.bounds, attributes)
    this.addLayer(rect)

    if (rect.getElement()) {
      rect
        .on('click', () => this.options.onTileClick(x, y))
        .on('mouseover', () => this.debouncedOnMouseOver(x, y, tile.center))
    }
  },

  onMouseOver(x, y, center) {
    if (this.popup) this.popup.remove()
    this.popup = this.options.addPopup(x, y, center)
  },

  loadCellCoordinates(x, y, tile) {
    if (!this.loadedCoordinates[tile.id]) {
      const marker = L.marker(tile.bounds.getNorthWest(), {
        icon: new L.DivIcon({
          className: `coordinates coordinates-zoom-${this.map.getZoom()}`,
          iconSize: new L.Point(0, 0),
          html: `${x},${y}`
        })
      })

      setTimeout(() => this.addLayer(marker))

      this.loadedCoordinates[tile.id] = true
    }
  },

  shouldShowCoordinates(x, y) {
    return x % 10 === 0 && y % 10 === 0
  },

  getCellPoint(row, col) {
    const x = this.origin.x + row * this.tileSize
    const y = this.origin.y + col * this.tileSize
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

    const tiles = []

    for (let i = 0; i <= this.rows; i++) {
      for (let j = 0; j <= this.cols; j++) {
        const row = i - offset.rows
        const col = j - offset.cols
        const tileBounds = this.getCellExtent(row, col)
        const tileCenter = tileBounds.getCenter()

        tiles.push({
          id: row + ':' + col,
          bounds: tileBounds,
          center: tileCenter,
          distance: tileCenter.distanceTo(mainCenter)
        })
      }
    }

    return tiles
  },

  getBoundsOffset(bounds) {
    const offset = this.map.project(bounds.getNorthWest())
    const offsetX = this.origin.x - offset.x
    const offsetY = this.origin.y - offset.y

    return {
      rows: Math.round(offsetX / this.tileSize),
      cols: Math.round(offsetY / this.tileSize)
    }
  }
})

export default LeafletParcelGrid
