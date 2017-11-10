import React from "react";
import PropTypes from "prop-types";
import L from "leaflet";

import "./ParcelsMap.css";

const MAP_ID = "map";

L.Icon.Default.imagePath =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/images/";

export default class ParcelsMap extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    bounds: PropTypes.arrayOf(PropTypes.array),
    zoom: PropTypes.number.isRequired,
    tileSize: PropTypes.number.isRequired,
    center: PropTypes.number,
    onClick: PropTypes.func,
    onMoveEnd: PropTypes.func
  };

  static defaultProps = {
    bounds: [],
    onClick: () => {},
    onMoveEnd: () => {}
  };

  componentWillMount() {
    this.map = null;
    this.marker = null;
  }

  componentWillUnmount() {
    this.removeMap();
  }

  createLeafletElement(container) {
    const { bounds, zoom } = this.props;

    this.map = new L.Map(MAP_ID, {
      center: this.getCenter(),
      minZoom: zoom,
      maxZoom: zoom,
      zoom: zoom,
      layers: [this.getGridLayer()]
    });

    this.map.zoomControl.setPosition("topright");
    this.map.setMaxBounds(point.toLatLngBounds(bounds));

    this.map.on("click", this.onMapClick);
    this.map.on("onmoveend", this.onMapMoveEnd);

    return this.map;
  }

  onMapClick = event => {
    const { x, y } = point.latLngToCartesian(event.latlng);

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker(event.latlng, { opacity: 0.01 });

    this.marker
      .bindTooltip(`${x},${y}`, {
        className: "parcel-tooltip",
        direction: "top",
        offset: new L.Point(-2, 10)
      })
      .addTo(this.map);

    this.marker.openTooltip();

    this.props.onClick(x, y);
  };

  onMapMoveEnd = event => {
    let bounds = {};
    const position = point.latLngToCartesian(event.latlng);

    const mapBounds = this.map.getBounds();
    const sw = mapBounds.getSouthWest();
    bounds.min = point.latLngToCartesian(sw);
    const ne = bounds.getNorthWest();
    bounds.max = point.latLngToCartesian(ne);
    this.props.onMoveEnd({ position, bounds });
  };

  getGridLayer() {
    const { tileSize } = this.props;
    const tiles = new L.GridLayer({ tileSize });

    tiles.createTile = createTile.bind(tiles);

    return tiles;
  }

  getCenter() {
    const { x, y } = this.props;
    return isNaN(x) ? new L.LatLng(0, 0) : point.cartesianToLatLng({ x, y });
  }

  bindMap(container) {
    if (container) {
      this.removeMap();
      this.createLeafletElement(container);
    }
  }

  removeMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  render() {
    return <div id={MAP_ID} ref={this.bindMap.bind(this)} />;
  }
}

const OFFSET = 1024;

function createTile(coords) {
  const tile = L.DomUtil.create("div", "leaflet-tile");
  const size = this.getTileSize();

  tile.style.width = size.x;
  tile.style.height = size.y;
  tile.style.backgroundColor = "#EAEAEA";
  tile.style.border = "1px solid #FFF";

  return tile;
}

const point = {
  toLatLngBounds(bounds) {
    let [lower, upper] = bounds;

    lower = point.cartesianToLatLng({ x: lower[0], y: lower[1] });
    upper = point.cartesianToLatLng({ x: upper[0], y: upper[1] });

    return new L.LatLngBounds(lower, upper);
  },

  cartesianToLatLng({ x, y }) {
    const t = 180;
    const halfTile = 0.08;

    const lat = -y / OFFSET * t - halfTile;
    const lng = x / OFFSET * t + halfTile;

    return new L.LatLng(lat, lng);
  },

  latLngToCartesian({ lng, lat }) {
    const t = 180;
    const halfTile = 0;
    const x = Math.floor((lng + halfTile) * OFFSET / t);
    const y = Math.floor((-lat + halfTile) * OFFSET / t);
    return { x, y };
  }
};
