import React from "react";
import PropTypes from "prop-types";
import Autocomplete from "react-autocomplete";

import { buildCoordinate } from "../lib/util";

import "./Search.css";

export default class Search extends React.Component {
  static propTypes = {
    coordinates: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.maxResults = 10;
    this.state = {
      value: ""
    };
  }

  renderMenu(items, value, style) {
    return (
      <div style={{ ...style, ...this.menuStyle }}>
        {items.slice(0, this.maxResults)}
      </div>
    );
  }

  renderItem = (item, isHighlighted) => {
    const className = `autocomplete-item ${isHighlighted
      ? "autocomplete-highlight"
      : ""}`;

    return (
      <div key={item} className={className}>
        {item}
      </div>
    );
  };

  getItems() {
    const { coordinates } = this.props;
    const { value } = this.state;

    const sliceBegining = this.valueIsEmpty()
      ? coordinates.findIndex(coord => coord === buildCoordinate(0, 0))
      : 0;

    return coordinates
      .filter(item => this.isMatch(item, value))
      .slice(sliceBegining, sliceBegining + this.maxResults);
  }

  valueIsEmpty() {
    return this.state.value.trim() === "";
  }

  getItemValue = item => {
    return item;
  };

  shouldItemRender = (item, value) => {
    return !value || this.isMatch(item, value);
  };

  onChange = event => {
    this.setState({ value: event.target.value });
  };

  onSelect = value => {
    this.props.onSelect(value);
    this.setState({ value: "" });
  };

  isMatch(item, value) {
    return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  render() {
    const { value } = this.state;

    return (
      <Autocomplete
        wrapperProps={{ className: "Search hidden-xs" }}
        renderMenu={this.renderMenu}
        renderItem={this.renderItem}
        items={this.getItems()}
        getItemValue={this.getItemValue}
        shouldItemRender={this.shouldItemRender}
        value={value}
        placeholder="Search for districts or coordinates"
        onChange={this.onChange}
        onSelect={this.onSelect}
      />
    );
  }
}
