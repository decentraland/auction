import React from "react";
import L from "leaflet";

import "./ParcelsMap.css";

L.Icon.Default.imagePath =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/images/";

export default class ParcelsMap extends React.Component {
  componentWillMount() {
    this.map = null;
  }

  componentWillUnmount() {
    this.removeMap();
  }

  createLeafletElement(container) {
    const { x, zoom, onClick } = this.props;

    var tiles = new L.GridLayer({
      tileSize: 128
    });

    tiles.createTile = createTile;

    const center = this.getCenter();

    const map = new L.Map("map", {
      center: center,
      minZoom: zoom,
      maxZoom: zoom,
      zoom: zoom,
      layers: [tiles]
    });

    map.on("click", e => {
      const c = latLngToCartesian(e.latlng);

      if (inBounds(c.x, c.y)) {
        onClick(c.x, c.y);
      }
    });

    if (!isNaN(x)) {
      L.marker(center).addTo(map);
    }

    return map;
  }

  getCenter() {
    const { x, y } = this.props;
    return isNaN(x) ? new L.LatLng(-0.08, 0) : cartesianToLatLng({ x, y });
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

function createTile(coords) {
  var tile = L.DomUtil.create("canvas", "leaflet-tile");
  var ctx = tile.getContext("2d");
  const x = coords.x - 1024;
  const y = coords.y - 1024;

  tile.width = tile.height = 128;

  var color = "white";
  var textColor = "#777";

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 255, 255);
  ctx.fillStyle = textColor;
  ctx.font = "18px sans-serif";
  ctx.fillText(`${x},${y}`, 24, 64);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(255, 0);
  ctx.lineTo(255, 255);
  ctx.lineTo(0, 255);
  ctx.closePath();
  ctx.stroke();

  return tile;
}

// fixme magic numbers
function cartesianToLatLng(c) {
  const t = 180;
  const halfTile = 0.08;
  return new L.LatLng(-c.y / 1024 * t - halfTile, c.x / 1024 * t + halfTile);
}

function latLngToCartesian(ll) {
  const t = 180;
  const halfTile = 0; // 0.04
  const x = Math.floor((ll.lng + halfTile) * 1024 / t);
  const y = Math.floor((-ll.lat + halfTile) * 1024 / t);
  return { x, y };
}

function inBounds(x, y) {
  return x >= -8 && x < 8 && y >= -8 && y < 8;
}
