import React from 'react'

import './FlashNotice.css'

export default class FlashNotice extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visible: true }
  }

  dismiss = () => this.setState({ visible: false })

  render() {
    return (
      this.state.visible && (
        <div className="FlashNotice">
          {this.props.children} &nbsp;
          <span onClick={this.dismiss} className="cross">
            ✕
          </span>
        </div>
      )
    )
  }
}
