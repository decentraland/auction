import React from "react";
import PropTypes from "prop-types";
import L from "leaflet";

import "./ParcelsMap.css";

L.Icon.Default.imagePath =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/images/";

export default class ParcelsMap extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    tileSize: PropTypes.number.isRequired,
    center: PropTypes.number,
    onClick: PropTypes.func
  };

  static defaultProps = {
    onClick: () => {}
  };

  componentWillMount() {
    this.map = null;
  }

  componentWillUnmount() {
    this.removeMap();
  }

  createLeafletElement(container) {
    const { zoom, onClick } = this.props;

    const map = new L.Map("map", {
      center: this.getCenter(),
      minZoom: zoom,
      maxZoom: zoom,
      zoom: zoom,
      layers: [this.getGridLayer()]
    });

    let marker = null;

    map.on("click", event => {
      const { x, y } = point.latLngToCartesian(event.latlng);

      if (marker) {
        map.removeLayer(marker);
      }

      marker = L.marker(event.latlng, { opacity: 0.01 });
      marker
        .bindTooltip(`${x},${y}`, {
          className: "parcel-tooltip",
          direction: "top",
          offset: new L.Point(-2, 10)
        })
        .addTo(map);

      onClick(x, y);
    });

    return map;
  }

  getGridLayer() {
    const { tileSize } = this.props;

    const tiles = new L.GridLayer({ tileSize });

    tiles.createTile = createTile.bind(tiles, this.map);

    return tiles;
  }

  getCenter() {
    const { x, y } = this.props;
    return isNaN(x) ? new L.LatLng(0, 0) : point.cartesianToLatLng({ x, y });
  }

  bindMap(container) {
    if (container) {
      this.removeMap();
      this.map = this.createLeafletElement(container);
    }
  }

  removeMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  render() {
    return <div id="map" ref={this.bindMap.bind(this)} />;
  }
}

const OFFSET = 2622;

function createTile(map, coords) {
  const tile = L.DomUtil.create("div", "leaflet-tile");

  const size = this.getTileSize();

  tile.style.width = size.x;
  tile.style.height = size.y;
  tile.style.backgroundColor = "white";
  tile.style.border = "1px solid #CCC";

  return tile;
}

const point = {
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
