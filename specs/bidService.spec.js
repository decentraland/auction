import { expect } from "chai";
import sinon from "sinon";

import { BidService } from "../src/lib/services";

const noop = () => undefined;

describe("BidService", function() {
  let bidService;
  let bidGroup;

  beforeEach(() => {
    bidGroup = { findOne: noop, getLatestByAddress: noop };

    bidService = new BidService();
    bidService.BidGroup = bidGroup;
    bidService.AddressState = sinon.mock();
    bidService.ParcelState = sinon.mock();
  });

  describe("getBidValidationError", function() {
    it("should reject a BidGroup with a matching id", async function() {
      const clashingId = 1;

      sinon
        .stub(bidGroup, "findOne")
        .withArgs(clashingId)
        .returns({ id: clashingId });

      expect(
        await bidService.getBidGroupValidationError({ id: clashingId })
      ).to.equal(`Id ${clashingId} already exists in database`);
    });

    it("should reject a BidGroup with an invalid nonce", async function() {
      const id = 1;
      const address = "0xdeadbeef";

      sinon
        .stub(bidGroup, "findOne")
        .withArgs(id)
        .returns(null);

      sinon
        .stub(bidGroup, "getLatestByAddress")
        .withArgs(address)
        .returns({ nonce: 2 });

      const bidGroupValue = {
        id,
        nonce: 1,
        address
      };
      expect(
        await bidService.getBidGroupValidationError(bidGroupValue)
      ).to.equal(`Invalid nonce for ${address}: stored 2, received 1`);
    });

    it("should reject a BidGroup with an invalid date", async function() {
      const id = 1;
      const address = "0xdeadbeef";

      sinon
        .stub(bidGroup, "findOne")
        .withArgs(id)
        .returns(null);

      sinon
        .stub(bidGroup, "getLatestByAddress")
        .withArgs(address)
        .returns({ nonce: 2, timestamp: 2 });

      const bidGroupValue = {
        id,
        nonce: 3,
        timestamp: 1,
        address
      };

      expect(
        await bidService.getBidGroupValidationError(bidGroupValue)
      ).to.equal(
        `Invalid timestamp for BidGroup received ${id}: latest was 2, received 1`
      );
    });
  });
});
