import React from 'react'

import './Definition.css'

export default function Definition({ title, description, children }) {
  return (
    <dl className="Definition dl-horizontal">
      {children || <DefinitionItem title={title} description={description} />}
    </dl>
  )
}

export function DefinitionItem({ title, description }) {
  return [<dt key="1">{title}</dt>, <dd key="2">{description}</dd>]
}
