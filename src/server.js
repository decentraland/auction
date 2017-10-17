import http from "http";
import express from "express";
import bodyParser from "body-parser";
import path from "path";

import { server, env } from "decentraland-commons";
import db from "./lib/db";

import { AddressState } from "./lib/models";

env.load();

const SERVER_PORT = env.getEnv("SERVER_PORT", 5000);

const app = express();
const httpServer = http.Server(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (env.isProduction()) {
  const webappPath = env.getEnv(
    "WEBAPP_PATH",
    path.join(__dirname, "..", "webapp/build")
  );

  app.use("/", express.static(webappPath, { extensions: ["html"] }));
} else {
  app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    next();
  });
}

/**
 * AddressState fetch by address: without bidgroups, to sign with last id.
 * @param  {string} address - User address
 * @return {object}         - Address state object
 */
app.get(
  "/api/addressState/simple/:address",
  server.handleRequest(async (req, res) => {
    const address = server.extractFromReq("address");
    return await AddressState.findByAddress(address);
  })
);

/**
 * AddressState fetch by address: /full contains all BidGroups.
 * @param  {string} address - User address
 * @return {object}         - Address state object
 */
app.get(
  "/api/addressState/full/:address",
  server.handleRequest(async (req, res) => {
    const address = server.extractFromReq(req, "address");
    return await AddressState.findByAddressWithBids(address);
  })
);

/**
 * ParcelState fetch by id. Attachs the bid history to the response
 * @param  {string} id - ParcelState id
 * @return {object}    - ParcelState object
 */
app.get(
  "/api/parcelState/:id",
  server.handleRequest(async (req, res) => {
    // const param = server.extractFromReq(req, 'param')
    return "success";
  })
);

/**
 * ParcelState group fetch. Get multiple parcel states at a time using an array
 * @param ${array} coordinates - array of parcel state ids (represented by x,y coordinates). If you need a single ParcelState, use "/api/parcelState/:id" or an array of a single element
 * @return {array}             - array of ParcelState objects
 */
app.get(
  "/api/parcelState/group/:coordinates",
  server.handleRequest(async (req, res) => {
    // const param = server.extractFromReq(req, 'param')
    return "success";
  })
);

/**
 * Parcel Range query, gets parcel states via max/min coordinates
 * @param  {string} mincoords - String with the format "x,y", which represents the lower coordinate bound
 * @param  {string} maxcoords - String with the format "x,y", which represents the upper coordinate bound
 * @return {array}            - array of ParcelState objects
 */
app.get(
  "/api/parcelState/range/:mincoords/:maxcoords",
  server.handleRequest(async (req, res) => {
    // const param = server.extractFromReq(req, 'param')
    return "success";
  })
);

/**
 * Submit a BidGroup
 * @param  {object} bidgroup - BidGroup attributes
 * @return {boolean}         - Wether the operation was successfull or not
 */
app.post(
  "/api/bidgroup",
  server.handleRequest(async (req, res) => {
    // const param = server.extractFromReq(req, 'param')
    return "success";
  })
);

db
  .connect()
  .then(() => {
    httpServer.listen(SERVER_PORT, () =>
      console.log("Server running on port", SERVER_PORT)
    );
  })
  .catch(console.error);
