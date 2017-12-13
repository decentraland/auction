import L from 'leaflet'
import { eth } from 'decentraland-commons'

export default class LeafletMapCoordinates {
  constructor(baseZoom) {
    this.zoom = baseZoom
    this.offset = Math.pow(2, baseZoom)
  }

  toLatLngBounds(bounds) {
    const [lower, upper] = bounds

    const southWest = this.cartesianToLatLng({ x: lower[0], y: lower[1] })
    const northEast = this.cartesianToLatLng({ x: upper[0], y: upper[1] })

    return new L.LatLngBounds(southWest, northEast)
  }

  cartesianToLatLng({ x, y }) {
    const mapSize = this.getMapSize()
    const offset = this.getOffset()

    const lat = y / offset * mapSize
    const lng = x / offset * mapSize

    return new L.LatLng(lat, lng)
  }

  latLngToCartesian({ lng, lat }) {
    const mapSize = getBn(this.getMapSize())
    const offset = getBn(this.getOffset())

    const x = getBn(lng)
      .mul(offset)
      .dividedBy(mapSize)
      .round()
      .toNumber()

    const y = getBn(lat)
      .mul(offset)
      .dividedBy(mapSize)
      .round()
      .toNumber()

    return { x, y }
  }

  coordsToCartesian({ x, y }) {
    const offset = this.getOffset()
    return {
      x: x - offset,
      y: y - offset
    }
  }

  getOffset() {
    // leaflet renders `2^zoomlevel` tiles across
    return this.offset
  }

  getMapSize() {
    // leaflet considers the map as going from `-180` to `180
    return 180
  }
}

const bnCache = {}
function getBn(number) {
  if (!bnCache[number]) {
    bnCache[number] = new eth.utils.toBigNumber(number)
  }
  return bnCache[number]
}
