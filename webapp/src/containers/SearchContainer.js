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

  componentWillMount() {
    this.props.fetchProjects()
  }

  onSelect = coordinate => {
    const [x, y] = coordinate.split(',')
    this.props.changeLocation(locations.parcelDetail(x, y))
  }

  getCoordinates() {
    const { minX, minY, maxX, maxY } = parcelUtils.getBounds()

    return parcelUtils
      .generateMatrix(minX, minY, maxX, maxY)
      .map(coordinate => ({ name: coordinate }))
  }

  render() {
    const { projects } = this.props

    return (
      <Search
        coordinates={this.getCoordinates()}
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
