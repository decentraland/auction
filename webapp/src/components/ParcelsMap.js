import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import L from "leaflet";
import addHours from "date-fns/add_hours";

import distanceInWordsToNow from "../lib/distanceInWordsToNow";
import LeafletMapCoordinates from "../lib/LeafletMapCoordinates";

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
    onParcelClick: PropTypes.func,
    onMoveEnd: PropTypes.func,
    onParcelBid: PropTypes.func
  };

  static defaultProps = {
    bounds: [],
    onParcelClick: () => {},
    onMoveEnd: () => {},
    onParcelBid: () => {}
  };

  componentWillMount() {
    this.map = null;
    this.mapCoordinates = new LeafletMapCoordinates(this.props.zoom);
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
    this.map.setMaxBounds(this.mapCoordinates.toLatLngBounds(bounds));

    this.map.on("click", this.onMapClick);
    this.map.on("onmoveend", this.onMapMoveEnd);

    return this.map;
  }

  onMapClick = event => {
    const { x, y } = this.mapCoordinates.latLngToCartesian(event.latlng);

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.addPopup(event.latlng, {
      x,
      y,
      address: "0xdeadbeef22",
      amount: "1800",
      endsAt: addHours(new Date(), 2)
    });

    this.props.onParcelClick(x, y);
  };

  onMapMoveEnd = event => {
    const bounds = { min: {}, max: {} };
    const position = this.mapCoordinates.latLngToCartesian(event.latlng);
    const mapBounds = this.map.getBounds();

    const sw = mapBounds.getSouthWest();
    const ne = bounds.getNorthWest();
    bounds.min = this.mapCoordinates.latLngToCartesian(sw);
    bounds.max = this.mapCoordinates.latLngToCartesian(ne);

    this.props.onMoveEnd({ position, bounds });
  };

  addPopup(latlng, parcel) {
    const leafletPopup = L.popup({
      className: "parcel-popup",
      direction: "top"
    });

    const popup = renderToDOM(
      <ParcelPopup
        parcel={parcel}
        onBid={parcel => {
          this.onParcelBid(parcel);
          leafletPopup.remove();
        }}
      />
    );

    leafletPopup
      .setLatLng(latlng)
      .setContent(popup)
      .addTo(this.map);
  }

  onParcelBid(parcel, leafletPopup) {
    this.props.onParcelBid(parcel);
  }

  getGridLayer() {
    const { tileSize } = this.props;
    const tiles = new L.GridLayer({ tileSize });

    tiles.createTile = coords => this.createTile(coords, tileSize);

    return tiles;
  }

  getCenter() {
    const { x, y } = this.props;

    return isNaN(x)
      ? new L.LatLng(0, 0)
      : this.mapCoordinates.cartesianToLatLng({ x, y });
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

  createTile(coords, size) {
    const { x, y } = this.mapCoordinates.coordsToCartesian(coords);
    return renderToDOM(<Tile x={x} y={y} width={size} height={size} />);
  }

  render() {
    return <div id={MAP_ID} ref={this.bindMap.bind(this)} />;
  }
}

function ParcelPopup({ parcel, onBid }) {
  return (
    <div>
      <div>{parcel.address}</div>
      <strong>
        {parcel.x},{parcel.y}
      </strong>
      <div>{parcel.amount} MANA</div>
      <div>Ends in {distanceInWordsToNow(parcel.endsAt)}</div>
      <span onClick={event => onBid(parcel)}>BID</span>
    </div>
  );
}

function Tile({ x, y, width, height }) {
  const style = { width, height };

  return (
    <div className="leaflet-tile" style={style}>
      <div className="leaflet-coordinates">
        {x},{y}
      </div>
    </div>
  );
}

function renderToDOM(Component) {
  const div = L.DomUtil.create("div");
  ReactDOM.render(Component, div);
  return div;
}
