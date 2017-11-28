import L from 'leaflet'

export default class LeafletMapCoordinates {
  constructor(zoom) {
    this.zoom = zoom
    this.offset = Math.pow(2, this.zoom)
  }

  toLatLngBounds(bounds) {
    let [lower, upper] = bounds

    lower = this.cartesianToLatLng({ x: lower[0], y: lower[1] })
    upper = this.cartesianToLatLng({ x: upper[0], y: upper[1] })

    return new L.LatLngBounds(lower, upper)
  }

  cartesianToLatLng({ x, y }) {
    const mapSize = this.getMapSize()
    const offset = this.getOffset()

    const lat = -y / offset * mapSize
    const lng = x / offset * mapSize

    return new L.LatLng(lat, lng)
  }

  latLngToCartesian({ lng, lat }) {
    const mapSize = this.getMapSize()
    const offset = this.getOffset()

    const x = Math.floor(lng * offset / mapSize)
    const y = Math.floor(-lat * offset / mapSize)

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
