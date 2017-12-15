import React from 'react'
import ReactDOM from 'react-dom'

import FlashNotice from '../components/FlashNotice'

export function buildCoordinate(x, y) {
  return `${x},${y}`
}

let timeoutId = null
export function flashNotice(message, timeout = 3000) {
  const notice = <FlashNotice> {message} </FlashNotice>
  const target = document.getElementById('notice')
  ReactDOM.render(notice, target)
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => ReactDOM.unmountComponentAtNode(target), timeout)
}

export function started() {
  return new Date().getTime() >= 1513375200000
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

export function preventDefault(fn) {
  return function(event) {
    if (event) {
      event.preventDefault()
    }
    fn.call(this, event)
  }
}

export function shortenAddress(address) {
  if (address) {
    return address.slice(0, 6) + '...' + address.slice(42 - 5)
  }
}

export function capitalize(str) {
  if (typeof str !== 'string') return null
  if (!str.trim()) return str

  let firstLetter = str.charAt(0).toUpperCase()
  let rest = str.slice(1)

  return firstLetter + rest
}

export function insertScript({
  type = 'text/javascript',
  async = true,
  ...props
}) {
  const script = document.createElement('script')
  Object.assign(script, { type, async: async, ...props }) // WARN, babel breaks on `{ async }`

  document.body.appendChild(script)

  return script
}
