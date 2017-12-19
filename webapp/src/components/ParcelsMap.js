import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import L from 'leaflet'
import debounce from 'lodash.debounce'

import { buildCoordinate } from '../lib/util'
import * as parcelUtils from '../lib/parcelUtils'
import LeafletMapCoordinates from '../lib/LeafletMapCoordinates'
import LeafletParcelGrid from '../lib/LeafletParcelGrid'

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
    baseZoom: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    tileSize: PropTypes.number.isRequired,

    getAddressState: PropTypes.func.isRequired,
    getParcelStates: PropTypes.func.isRequired,
    getProjects: PropTypes.func.isRequired,
    getMaxAmount: PropTypes.func.isRequired,
    getPendingConfirmationBids: PropTypes.func.isRequired,

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
    this.map = null
    this.parcelGrid = null
    this.mapCoordinates = null

    this.debounceMapMethodsByTileSize(this.props.tileSize)
  }

  componentWillUnmount() {
    this.removeMap()
  }

  componentWillReceiveProps(nextProps) {
    if (this.shouldUpdateCenter(nextProps)) {
      const newCenter = this.getCenter(nextProps.x, nextProps.y)
      this.setView(newCenter)
    }

    if (this.shouldRedraw(nextProps)) {
      this.debouncedRedrawMap()
    }

    if (this.shouldDebounce(nextProps)) {
      this.debounceMapMethodsByTileSize(nextProps.tileSize)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.tileSize !== nextProps.tileSize
  }

  shouldUpdateCenter(nextProps) {
    return (
      !this.panInProgress &&
      (this.props.x !== nextProps.x || this.props.y !== nextProps.y)
    )
  }

  shouldRedraw(nextProps) {
    const nextParcelStates = nextProps.getParcelStates()
    const nextPendingConfirmationBids = nextProps.getParcelStates()

    const pendingConfirmationBids = this.props.getPendingConfirmationBids()

    return (
      (this.map && !nextParcelStates.loading) ||
      pendingConfirmationBids.length !== nextPendingConfirmationBids.length
    )
  }

  shouldDebounce(nextProps) {
    return this.props.tileSize !== nextProps.tileSize
  }

  debounceMapMethodsByTileSize(tileSize) {
    const delay = 6400
    this.debouncedRedrawMap = debounce(
      this.redrawMap,
      Math.min(200, delay / tileSize)
    )
    this.debouncedOnMoveEnd = debounce(
      this.onMoveEnd,
      Math.min(200, delay / tileSize)
    )
  }

  createMap(container) {
    const { x, y, tileSize, minZoom, maxZoom, bounds, zoom } = this.props

    this.map = new L.Map(MAP_ID, {
      minZoom,
      maxZoom,
      zoom,
      center: new L.LatLng(0, 0),
      layers: [],
      renderer: L.svg(),
      zoomAnimation: false,
      scrollWheelZoom: false,
      boxZoom: false,
      doubleClickZoom: false
    })

    this.mapCoordinates = new LeafletMapCoordinates(this.map, tileSize)

    this.parcelGrid = new LeafletParcelGrid({
      getTileAttributes: this.getTileAttributes,
      onTileClick: this.onTileClick,
      addPopup: this.addPopup,
      tileSize: tileSize
    })

    this.map.zoomControl.setPosition('topright')
    this.map.setMaxBounds(this.mapCoordinates.toLatLngBounds(bounds))
    this.map.addLayer(this.parcelGrid)
    this.map.setView(this.getCenter(x, y))

    this.attachMapEvents()

    return this.map
  }

  attachMapEvents() {
    this.map.on('movestart', this.onMapMoveStart)
    this.map.on('moveend', this.onMapMoveEnd)
    this.map.on('zoomend', this.onZoomEnd)
  }

  setView(center) {
    this.map.setView(center)
    this.redrawMap()
  }

  redrawMap = () => {
    if (this.map) {
      this.parcelGrid.renderTiles(this.map.getBounds())
    }
  }

  onMapMoveStart = () => {
    this.props.onMoveStart()
  }

  onMapMoveEnd = () => {
    this.debouncedOnMoveEnd()
  }

  onZoomEnd = () => {
    this.props.onZoomEnd(this.map.getZoom())
    this.debouncedOnMoveEnd()
  }

  onMoveEnd = () => {
    const { bounds, position } = this.getCurrentPositionAndBounds()

    this.parcelGrid.setCenter(position)
    this.props.onMoveEnd({ bounds, position })
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
      y: sw.y
    }

    bounds.max = {
      x: ne.x,
      y: ne.y
    }

    return { position, bounds }
  }

  onParcelBid(parcel) {
    this.props.onParcelBid(parcel)
  }

  getCenter(x, y) {
    return this.mapCoordinates.cartesianToLatLng({ x, y })
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

  // Called by the Parcel Grid on each tile render
  getTileAttributes = center => {
    const { x, y } = this.mapCoordinates.latLngToCartesian(center)
    const parcel = this.getParcelData(x, y)
    const addressState = this.props.getAddressState()
    const maxAmount = this.props.getMaxAmount()
    const pendingConfirmationBids = this.props.getPendingConfirmationBids()

    const className = parcelUtils.getClassName(
      parcel,
      addressState,
      pendingConfirmationBids
    )
    const dataset = { x, y }

    let fillColor = null

    if (!className) {
      fillColor = parcelUtils.getColorByAmount(parcel.amount, maxAmount)
    }

    return {
      className,
      dataset,
      fillColor
    }
  }

  // Called by the Parcel Grid on each tile click
  onTileClick = (x, y, tile) => {
    const parcel = this.getParcelData(x, y)

    const unBiddable =
      !parcel ||
      parcel.error ||
      parcelUtils.isReserved(parcel) ||
      parcelUtils.hasEnded(parcel)

    if (unBiddable) return

    this.onParcelBid(parcel)
    setTimeout(() => this.parcelGrid && this.parcelGrid.loadCell(tile, 0), 10)
  }

  // Called by the Parcel Grid on each tile hover
  addPopup = (x, y, latlng) => {
    const parcel = this.getParcelData(x, y)

    if (!parcel) return

    const addressState = this.props.getAddressState()
    const projects = this.props.getProjects()

    const leafletPopup = L.popup({ direction: 'top', autoPan: false })

    const popup = renderToDOM(
      <ParcelPopup
        x={x}
        y={y}
        parcel={parcel}
        addressState={addressState}
        projects={projects}
      />
    )

    leafletPopup
      .setLatLng(latlng)
      .setContent(popup)
      .addTo(this.map)

    return leafletPopup
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
