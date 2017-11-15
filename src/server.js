import http from "http";
import express from "express";
import bodyParser from "body-parser";
import path from "path";

import { server, env } from "decentraland-commons";
import db from "./lib/db";

import {
  AddressState,
  ParcelState,
  Project,
  OutbidNotification
} from "./lib/models";

import {
  BidService,
  BidReceiptService,
  OutbidNotificationService
} from "./lib/services";

env.load();

const SERVER_PORT = env.get("SERVER_PORT", 5000);

const app = express();
const httpServer = http.Server(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (env.isProduction()) {
  const webappPath = env.get(
    "WEBAPP_PATH",
    path.join(__dirname, "..", "webapp/build")
  );

  app.use("/", express.static(webappPath, { extensions: ["html"] }));
} else {
  app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    next();
  });
}

/**
 * AddressState fetch by address: without bidgroups.
 * @param  {string} address - User address
 * @return {object}         - Address state object (with it's last bid, if any)
 */
app.get(
  "/api/addressState/simple/:address",
  server.handleRequest(getSimpleAddressState)
);

export function getSimpleAddressState(req) {
  const address = server.extractFromReq(req, "address");
  return AddressState.findByAddress(address.toLowerCase());
}

/**
 * AddressState fetch by address: /full contains all BidGroups.
 * @param  {string} address - User address
 * @return {object}         - Address state object with each placed bid
 */
app.get(
  "/api/addressState/full/:address",
  server.handleRequest(getFullAddressState)
);

export function getFullAddressState(req) {
  const address = server.extractFromReq(req, "address");
  return AddressState.findByAddressWithBidGroups(address.toLowerCase());
}

/**
 * ParcelState fetch by id. Attachs the bidGroup history to the response
 * @param  {string} id - ParcelState id
 * @return {object}    - ParcelState object
 */
app.get("/api/parcelState/:id", server.handleRequest(getParcelState));

export function getParcelState(req) {
  const id = server.extractFromReq(req, "id");
  return ParcelState.findByIdWithBidGroups(id);
}

/**
 * ParcelState group fetch. Get multiple parcel states at a time using an array
 * @param ${array} coordinates - array of parcel state coordinates. If you need a single ParcelState, use "/api/parcelState/:id" or an array of a single element
 * @return {array}             - array of ParcelState objects
 */
app.post("/api/parcelState/group", server.handleRequest(getParcelStateGroup));

export function getParcelStateGroup(req) {
  const coordinates = server.extractFromReq(req, "coordinates");
  return ParcelState.findInCoordinates(coordinates);
}

/**
 * Parcel Range query, gets parcel states via max/min coordinates
 * @param  {string} mincoords - String with the format "x,y", which represents the lower coordinate bound
 * @param  {string} maxcoords - String with the format "x,y", which represents the upper coordinate bound
 * @return {array}            - array of ParcelState objects
 */
app.get(
  "/api/parcelState/range/:mincoords/:maxcoords",
  server.handleRequest(getParcelStateRange)
);

export function getParcelStateRange(req) {
  const mincoords = server.extractFromReq(req, "mincoords");
  const maxcoords = server.extractFromReq(req, "maxcoords");
  return ParcelState.inRange(mincoords, maxcoords);
}

/**
 * Submit a BidGroup
 * @param  {object} bidgroup - BidGroup attributes
 * @return {boolean}         - Wether the operation was successfull or not
 */
app.post("/api/bidgroup", server.handleRequest(postBidGroup));

export async function postBidGroup(req) {
  const newBidGroup = server.extractFromReq(req, "bidGroup");
  newBidGroup.receivedAt = new Date();

  const {
    bidGroup,
    parcelStates,
    error
  } = await new BidService().processBidGroup(newBidGroup);

  const bidParcels = parcelStates ? parcelStates.filter(ps => !ps.error) : [];

  if (error || bidParcels.length === 0) {
    throw new Error(`
      An error occurred trying to bid.
      ${JSON.stringify(parcelStates)} ${error || ""}
    `);
  }

  await new BidReceiptService().sign(bidGroup);
  new OutbidNotificationService().notificateOutbids(bidParcels); // async

  return true;
}

/**
 * Get all projects
 * @return {array} - Project list
 */
app.get("/api/projects", server.handleRequest(getProjects));

export function getProjects(req) {
  return Project.find();
}

/**
 * Register to an email notification service to be notified if you're outbid
 * @param  {string} email         - Email to register to the notification service
 * @param  {string} parcelStateId - Parcel state to watch
 * @return {boolean}      - Wether the operation was successfull or not
 */
app.post(
  "/api/outbidNotification",
  server.handleRequest(postOutbidNotification)
);

export async function postOutbidNotification(req) {
  const email = server.extractFromReq(req, "email");
  const parcelStateId = server.extractFromReq(req, "parcelStateId");

  if (!await OutbidNotification.findActiveByParcelId(parcelStateId)) {
    await OutbidNotification.insert({
      email,
      parcelStateId
    });
  }

  return true;
}

/**
 * Start the server
 */
if (require.main === module) {
  db
    .connect()
    .then(() => {
      httpServer.listen(SERVER_PORT, () =>
        console.log("Server running on port", SERVER_PORT)
      );
    })
    .catch(console.error);
}
