import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from '../reducers'
import { changeLocation, fetchProjects } from '../actions'
import locations from '../locations'

import * as parcelUtils from '../lib/parcelUtils'

import Search from '../components/Search'

class SearchContainer extends React.Component {
  static propTypes = {
    projects: PropTypes.array
  }

  constructor(...args) {
    super(...args)

    const { minX, minY, maxX, maxY } = parcelUtils.getBounds()
    this.coordinates = parcelUtils
      .generateMatrix(minX, minY, maxX, maxY)
      .map(coordinate => ({ name: coordinate }))
      .sort((a, b) => a.name.length - b.name.length)
  }

  componentWillMount() {
    this.props.fetchProjects()
  }

  onSelect = coordinate => {
    const [x, y] = coordinate.split(',')
    this.props.changeLocation(locations.parcelDetail(x, y))
  }

  render() {
    const { projects } = this.props

    return (
      <Search
        coordinates={this.coordinates}
        projects={projects}
        onSelect={this.onSelect}
      />
    )
  }
}

export default connect(
  state => ({
    projects: selectors.getProjectsData(state)
  }),
  { changeLocation, fetchProjects }
)(SearchContainer)
