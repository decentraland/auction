import http from "http";
import express from "express";
import bodyParser from "body-parser";
import path from "path";

import { server, env } from "decentraland-commons";
import db from "./lib/db";

import { AddressState, ParcelState, BidGroup } from "./lib/models";

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
 * @return {object}         - Address state object (with it's last bid, if any)
 */
app.get(
  "/api/addressState/simple/:address",
  server.handleRequest((req, res) => {
    const address = server.extractFromReq("address");
    return AddressState.findByAddress(address);
  })
);

/**
 * AddressState fetch by address: /full contains all BidGroups.
 * @param  {string} address - User address
 * @return {object}         - Address state object with each placed bid
 */
app.get(
  "/api/addressState/full/:address",
  server.handleRequest((req, res) => {
    const address = server.extractFromReq(req, "address");
    return AddressState.findByAddressWithBidGroups(address);
  })
);

/**
 * ParcelState fetch by id. Attachs the bidGroup history to the response
 * @param  {string} id - ParcelState id
 * @return {object}    - ParcelState object
 */
app.get(
  "/api/parcelState/:id",
  server.handleRequest((req, res) => {
    const id = server.extractFromReq(req, "id");
    return ParcelState.findByIdWithBidGroups(id);
  })
);

/**
 * ParcelState group fetch. Get multiple parcel states at a time using an array
 * @param ${array} coordinates - array of parcel state coordinates. If you need a single ParcelState, use "/api/parcelState/:id" or an array of a single element
 * @return {array}             - array of ParcelState objects
 */
app.get(
  "/api/parcelState/group/:coordinates",
  server.handleRequest(async (req, res) => {
    const coordinates = server.extractFromReq(req, "coordinates");
    return ParcelState.findInCoordinates(coordinates);
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
  server.handleRequest((req, res) => {
    const mincoords = server.extractFromReq(req, "mincoords");
    const maxcoords = server.extractFromReq(req, "maxcoords");
    return ParcelState.inRange(mincoords, maxcoords);
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
    const bidGroup = server.extractFromReq(req, "bidGroup");
    // new BidService().checkValidBidGroup(bidGroup)
    await BidGroup.insert(bidGroup);
    return true;
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