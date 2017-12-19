import React from 'react'
import PropTypes from 'prop-types'

import './Box.css'

export default function Box({ children, className }) {
  return <div className={'Box ' + className}>{children}</div>
}

Box.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
}

Box.defaultProps = {
  className: ''
}
