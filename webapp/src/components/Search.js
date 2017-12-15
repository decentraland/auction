import React from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'
import Highlighter from 'react-highlight-words'

import './Search.css'

const hasLettersRegex = /[a-zA-Z]/

export default class Search extends React.Component {
  static propTypes = {
    coordinates: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    projects: PropTypes.arrayOf(PropTypes.object),
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    coordinates: [],
    projects: []
  }

  constructor(props) {
    super(props)

    this.maxResults = 5
    this.state = {
      value: ''
    }
  }

  renderMenu(menuItems, value, style) {
    // This is (sadly) the only way to make a custom menu for react-autocomplete
    // See: https://github.com/reactjs/react-autocomplete/blob/master/examples/custom-menu/app.js
    let headers = {
      coords: false,
      projects: false
    }

    style = {
      ...style,
      ...this.menuStyle,
      background: 'rgba(255, 255, 255, 1)',
      minWidth: '425px',
      left: '165px',
      zIndex: -1,
      borderRadius: '0 0 3px 3px',
      padding: 0
    }

    return (
      <div style={style}>
        {menuItems.map(menuItem => {
          if (headers.coordinates && headers.projects) {
            return menuItem
          }

          const name = menuItem.props.name

          if (name.match(hasLettersRegex)) {
            if (!headers.projects) {
              menuItem = [<h4 key="projects-header">Projects</h4>, menuItem]
              headers.projects = true
            }
          } else {
            if (!headers.coordinates) {
              menuItem = [<h4 key="coords-header">Coordinates</h4>, menuItem]
              headers.coordinates = true
            }
          }

          return menuItem
        })}
      </div>
    )
  }

  renderItem = (item, isHighlighted) => {
    const highlightClass = isHighlighted ? 'autocomplete-highlight' : ''
    const className = `autocomplete-item ${highlightClass}`
    const { value } = this.state

    return (
      <div key={item.name} className={className} name={item.name}>
        <p>
          <Highlighter
            highlightClassName="matched"
            searchWords={[value]}
            autoEscape={true}
            textToHighlight={item.name}
          />
        </p>
      </div>
    )
  }

  getItems() {
    let { coordinates, projects } = this.props
    const { value } = this.state

    if (this.valueIsEmpty(value)) {
      coordinates = [
        { name: '0,0' },
        { name: '0,1' },
        { name: '1,0' },
        { name: '1,1' }
      ]

      projects = projects.slice(0, this.maxResults)
    } else {
      if (value.match(hasLettersRegex)) {
        coordinates = []
      }

      coordinates = coordinates
        .filter(coord => this.isMatch(coord.name, value))
        .slice(0, this.maxResults)

      projects = projects
        .filter(project => this.isMatch(project.name, value))
        .slice(0, this.maxResults)
    }

    return coordinates.concat(projects)
  }

  valueIsEmpty(value) {
    return value == null || value.trim() === ''
  }

  getItemValue = item => {
    return item.name
  }

  onChange = event => {
    this.setState({ value: event.target.value })
  }

  onSelect = (value, item) => {
    if (item.id) {
      // Get the project center
      value = item.lookup || '0,0'
    }

    this.props.onSelect(value)
    this.setState({ value: '' })
  }

  onMenuVisibilityChange = isOpen => {
    this.setState({ isOpen })
  }

  isMatch(itemValue, value) {
    itemValue = itemValue.toLowerCase()
    value = value.toLowerCase()
    return itemValue === value || itemValue.startsWith(value)
  }

  render() {
    const { value, isOpen } = this.state
    const searchActive = isOpen ? 'search-active' : ''
    return (
      <Autocomplete
        wrapperProps={{ className: `Search hidden-xs ${searchActive}` }}
        renderMenu={this.renderMenu}
        renderItem={this.renderItem}
        items={this.getItems()}
        getItemValue={this.getItemValue}
        value={value}
        inputProps={{ placeholder: 'Search for districts or coordinates...' }}
        onChange={this.onChange}
        onSelect={this.onSelect}
        onClick={this.onSelect}
        onMenuVisibilityChange={this.onMenuVisibilityChange}
      />
    )
  }
}
