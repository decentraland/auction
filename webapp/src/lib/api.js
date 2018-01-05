import axios from 'axios'

import { env } from 'decentraland-commons'

const httpClient = axios.create()
const URL = env.get('REACT_APP_API_URL', '')

class API {
  fetchParcelStateRange(mincoords, maxcoords) {
    return this.request(
      'get',
      `/parcelState/range/${mincoords}/${maxcoords}`,
      {}
    )
  }

  fetchParcelStates(parcels) {
    return this.request('post', '/parcelState/group', { coordinates: parcels })
  }

  fetchFullAddressState(address) {
    return this.request('get', `/addressState/full/${address}`, {})
  }

  postBidGroup(bidGroup) {
    return this.request('post', '/bidGroup', { bidGroup })
  }

  fetchDistricts(address) {
    return this.request('get', `/districts/${address}`, {})
  }

  fetchProjects(address) {
    return this.request('get', '/projects', {})
  }

  postSignedOutbidNotification(message, signature, parcelStateIds) {
    return this.request('post', '/outbidNotification', {
      message,
      signature
    })
  }

  postOutbidNotification(address) {
    return this.request('post', '/outbidNotification', { address })
  }

  deleteOutbidNotifications(address) {
    return this.request('delete', '/outbidNotification', { address })
  }

  deleteSignedOutbidNotifications(message, signature) {
    return this.request('delete', '/outbidNotification', { message, signature })
  }

  fetchStats() {
    return this.request('get', '/stats', {})
  }

  fetchAddressStats(address) {
    return this.request('get', `/addressStats/${address}`, {})
  }

  fetchParcelStats(x, y) {
    return this.request('get', `/parcelStats/${x}/${y}`, {})
  }

  request(method, path, params) {
    let options = {
      method,
      url: this.getUrl(path)
    }

    if (params) {
      if (method === 'get') {
        options.params = { params }
      } else {
        options.data = params
      }
    }

    console.log(`[API] ${method} ${path}`, options)

    return httpClient
      .request(options)
      .then(response => {
        const data = response.data
        const result = data.data // One for axios data, another for the servers data

        if (data && !data.ok) {
          const errorMessage = response.error || data.error
          return Promise.reject({ message: errorMessage, data: result })
        }

        return result
      })
      .catch(err => {
        let error

        if (err.status === 401) {
          error = new AuthorizationError()
        } else {
          error = new Error(
            '[API] HTTP request failed. Inspect this error for more info'
          )
          Object.assign(error, err)
        }

        console.warn(`[WARN] ${error.message || ''}`, error)

        throw error
      })
  }

  getUrl(path) {
    return `${URL}/api${path}`
  }
}

export class AuthorizationError {
  constructor() {
    this.status = 401
    this.message = 'Server rejected credentials. Logging out'
  }

  toString() {
    return this.message
  }
}

export default new API()
