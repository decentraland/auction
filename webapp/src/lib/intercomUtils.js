import { env } from 'decentraland-commons'
import { insertScript } from './util'

const APP_ID = env.get('REACT_APP_INTERCOM_APP_ID', 'z0h94kay')

const intercomUtils = {
  inject() {
    return new Promise((resolve, reject) => {
      if (this.injected()) return resolve()

      window.intercomSettings = {
        alignment: 'left',
        horizontal_padding: 10,
        vertical_padding: 10
      }

      const script = insertScript({
        src: `https://widget.intercom.io/widget/${APP_ID}`
      })
      script.addEventListener('load', resolve, true)
    })
  },

  injected() {
    return typeof window.Intercom === 'function'
  },

  render(address, email) {
    IntercomFn('reattach_activator')
    IntercomFn('update', { app_id: APP_ID, address, email })
  },

  showNewMessage(text) {
    IntercomFn('showNewMessage', text)
  },

  shutdown() {
    IntercomFn('shutdown')
  }
}

function IntercomFn(...args) {
  if (!intercomUtils.injected()) {
    return console.warn('Intercom called before injection')
  }

  window.Intercom(...args)
}

export default intercomUtils
