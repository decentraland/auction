import "babel-polyfill";

import chai from "chai";
import chaiSubset from "chai-subset";

import { env } from "decentraland-commons";

chai.use(chaiSubset);
env.load({ path: "./specs/.env" });
