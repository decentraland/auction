import axios from "axios";

import { env } from "decentraland-commons";

const httpClient = axios.create();
const URL = env.get("REACT_APP_API_URL", "");

class API {
  fetchParcelStateRange(mincoords, maxcoords) {
    return this.request(
      "get",
      `/parcelState/range/${mincoords}/${maxcoords}`,
      {}
    );
  }

  fetchParcelStates(parcels) {
    return this.request("post", "/parcelState/group", { coordinates: parcels });
  }

  fetchFullAddressState(address) {
    return this.request("get", `/addressState/full/${address}`, {});
  }

  postBidGroup(bidGroup) {
    return this.request("post", "/bidGroup", { bidGroup });
  }

  fetchProjects(address) {
    return this.request("get", '/projects', {});
  }

  request(method, path, params) {
    let options = {
      method,
      url: this.getUrl(path)
    };

    if (params) {
      if (method === "get") {
        options.params = { params };
      } else {
        options.data = params;
      }
    }

    console.log(`[API] ${method} ${path}`, options);

    return httpClient
      .request(options)
      .then(({ data, error }) => {
        if (data && !data.ok) {
          return Promise.reject({ message: error });
        }

        return data.data; // One for axios data, another for the servers data
      })
      .catch(err => {
        let error;

        if (err.status === 401) {
          error = new AuthorizationError();
        } else {
          error = new Error(
            "[API] HTTP request failed. Inspect this error for more info"
          );
          Object.assign(error, err);
        }

        console.warn(`[WARN] ${error.message}`);

        throw error;
      });
  }

  getUrl(path) {
    return `${URL}/api${path}`;
  }
}

export class AuthorizationError {
  constructor() {
    this.status = 401;
    this.message = "Server rejected credentials. Logging out";
  }

  toString() {
    return this.message;
  }
}

export default new API();
