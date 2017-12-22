import React from 'react'
import PropTypes from 'prop-types'

import './Definition.css'

export default function Definition(props) {
  const { className, title, description, children } = props
  return (
    <dl className={`Definition dl-horizontal ${className}`}>
      {children || <DefinitionItem title={title} description={description} />}
    </dl>
  )
}

Definition.propTypes = {
  className: PropTypes.string
}

Definition.defaultProps = {
  className: ''
}

export function DefinitionItem({ title, description }) {
  return [<dt key="1">{title}</dt>, <dd key="2">{description}</dd>]
}
