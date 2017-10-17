import "babel-polyfill";

import chai from "chai";
import chaiSubset from "chai-subset";

import { env, utils } from "decentraland-commons";

chai.use(chaiSubset);
env.load({ path: "./specs/.env" });

chai.Assertion.addChainableMethod("equalRow", function(expectedRow) {
  const ommitedProps = ["createdAt", "updatedAt"];

  if (!expectedRow.id) {
    ommitedProps.push("id");
  }
  const actualRow = utils.omit(this._obj, ommitedProps);

  return new chai.Assertion(expectedRow).to.deep.equal(actualRow);
});
