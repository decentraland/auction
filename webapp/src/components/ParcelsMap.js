import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import L from 'leaflet'
import debounce from 'lodash.debounce'

import { buildCoordinate } from '../lib/util'
import * as parcelUtils from '../lib/parcelUtils'
import LeafletMapCoordinates from '../lib/LeafletMapCoordinates'

import ParcelPopup from './ParcelPopup'

import './ParcelsMap.css'

const MAP_ID = 'map'

L.Icon.Default.imagePath = 'https://cdnjs..com/ajax/libs/leaflet/1.0.3/images/'

export default class ParcelsMap extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    bounds: PropTypes.arrayOf(PropTypes.array),
    minZoom: PropTypes.number.isRequired,
    maxZoom: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    tileSize: PropTypes.number.isRequired,
    getAddressState: PropTypes.func.isRequired,
    getParcelStates: PropTypes.func.isRequired,
    onMoveEnd: PropTypes.func,
    onZoomEnd: PropTypes.func,
    onParcelBid: PropTypes.func
  }

  static defaultProps = {
    bounds: [[], []],
    onMoveEnd: () => {},
    onZoomEnd: () => {},
    onParcelBid: () => {}
  }

  componentWillMount() {
    this.panInProgress = false
    this.map = null
    this.mapCoordinates = new LeafletMapCoordinates(this.props.zoom)

    this.debounceMapMethodsByTileSize(this.props.tileSize)

    setTimeout(() => this.onMapMoveEnd())
  }

  componentWillUnmount() {
    this.removeMap()
  }

  componentWillReceiveProps(nextProps) {
    const shouldUpdateCenter =
      !this.panInProgress &&
      (this.props.x !== nextProps.x || this.props.y !== nextProps.y)

    const shouldRedraw = this.map && !nextProps.getParcelStates().loading

    const shouldDebounce = this.props.tileSize !== nextProps.tileSize

    if (shouldUpdateCenter) {
      const newCenter = this.getCenter(nextProps.x, nextProps.y)
      this.setView(newCenter)
    }

    if (shouldRedraw) {
      this.debouncedRedrawMap()
    }

    if (shouldDebounce) {
      this.debounceMapMethodsByTileSize(nextProps.tileSize)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.tileSize !== nextProps.tileSize
  }

  debounceMapMethodsByTileSize(tileSize) {
    this.debouncedRedrawMap = debounce(this.redrawMap, 32000 / tileSize)
    this.debouncedOnMapMoveEnd = debounce(this.onMapMoveEnd, 64000 / tileSize)
  }

  createMap(container) {
    const { x, y, minZoom, maxZoom, bounds, zoom } = this.props

    this.map = new L.Map(MAP_ID, {
      minZoom,
      maxZoom,
      zoom,
      center: this.getCenter(x, y),
      layers: [this.getGridLayer()],
      fadeAnimation: false,
      zoomAnimation: false
    })

    this.map.zoomControl.setPosition('topright')
    this.map.setMaxBounds(this.mapCoordinates.toLatLngBounds(bounds))

    this.attachMapEvents()

    return this.map
  }

  attachMapEvents() {
    this.map.on('movestart', this.onMapMoveStart)
    this.map.on('click', this.onMapClick)
    this.map.on('moveend', this.debouncedOnMapMoveEnd)
    this.map.on('zoomend', this.onZoomEnd)
  }

  setView(center) {
    this.map.off('movestart moveend')
    this.map.on('moveend', () => {
      this.attachMapEvents()

      this.onMapMoveStart()
      this.debouncedOnMapMoveEnd()
    })
    this.map.setView(center)
  }

  redrawMap = () => {
    this.map.eachLayer(layer => {
      if (layer.redraw) {
        layer.redraw()
      }
    })

    this.panInProgress = false
  }

  onMapMoveStart = event => {
    this.panInProgress = true
  }

  onMapClick = event => {
    const parcelStates = this.props.getParcelStates()

    if (!parcelStates.loading) {
      this.addPopup(event.latlng)
    }
  }

  onMapMoveEnd = event => {
    this.props.onMoveEnd(this.getCurrentPositionAndBounds())
  }

  onZoomEnd = event => {
    this.props.onZoomEnd(this.map.getZoom())
    this.debouncedOnMapMoveEnd()
  }

  getCurrentPositionAndBounds() {
    const bounds = { min: {}, max: {} }
    const latlng = this.map.getCenter()
    const position = this.mapCoordinates.latLngToCartesian(latlng)
    const mapBounds = this.map.getBounds()

    const sw = this.mapCoordinates.latLngToCartesian(mapBounds.getSouthWest())
    const ne = this.mapCoordinates.latLngToCartesian(mapBounds.getNorthEast())

    bounds.min = {
      x: sw.x,
      y: ne.y
    }

    bounds.max = {
      x: ne.x,
      y: sw.y
    }

    return { position, bounds }
  }

  addPopup(latlng) {
    const { x, y } = this.mapCoordinates.latLngToCartesian(latlng)
    const parcel = this.getParcelData(x, y)
    const addressState = this.props.getAddressState()

    if (!parcel) return // TODO: could we fetch on-demand here?

    const leafletPopup = L.popup({
      className: 'parcel-popup',
      direction: 'top'
    })

    const popup = renderToDOM(
      <ParcelPopup
        x={x}
        y={y}
        parcel={parcel}
        addressState={addressState}
        onBid={parcel => {
          this.onParcelBid(parcel)
          leafletPopup.remove()
        }}
      />
    )

    leafletPopup
      .setLatLng(latlng)
      .setContent(popup)
      .addTo(this.map)
  }

  onParcelBid(parcel, leafletPopup) {
    this.props.onParcelBid(parcel)
  }

  getGridLayer() {
    const { tileSize } = this.props
    const tiles = new L.GridLayer({ tileSize })

    tiles.createTile = coords => this.createTile(coords, tileSize)

    return tiles
  }

  getCenter(x, y) {
    return isNaN(x)
      ? new L.LatLng(0, 0)
      : this.mapCoordinates.cartesianToLatLng({ x, y })
  }

  bindMap(container) {
    if (container) {
      this.removeMap()
      this.createMap(container)
    }
  }

  removeMap() {
    if (this.map) {
      this.map.off()
      this.map.remove()
      this.map = null
    }
  }

  createTile(coords, size) {
    const { x, y } = this.mapCoordinates.coordsToCartesian(coords)
    const parcel = this.getParcelData(x, y)
    const addressState = this.props.getAddressState()

    const div = document.createElement('div')
    const className = parcelUtils.getClassName(parcel, addressState)

    if (!className) {
      div.style = {
        backgroundColor: parcelUtils.getColorByAmount(parcel.amount)
      }
    }

    div.className = `tile ${className}`

    if (x % 5 === 0 && y % 5 === 0) {
      div.innerHTML = buildCoordinate(x, y)
    }

    return div
  }

  getParcelData = (x, y) => {
    const parcelStates = this.props.getParcelStates()
    let parcel = parcelStates[buildCoordinate(x, y)]

    if (parcelStates.error && !parcel) {
      parcel = { error: true }
    }

    return parcel
  }

  render() {
    return <div id={MAP_ID} ref={this.bindMap.bind(this)} />
  }
}

function renderToDOM(Component) {
  const div = L.DomUtil.create('div')
  ReactDOM.render(Component, div)
  return div
}
