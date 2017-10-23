import { expect } from "chai";
import sinon from "sinon";

import { env } from "decentraland-commons";
import { BidReceiptService } from "../src/lib/services";

const identity = x => x;

describe("BidReceiptService", function() {
  let bidRecepitService;
  let BidReceipt;
  let ethUtils;

  beforeEach(() => {
    BidReceipt = { insert: identity, update: identity };
    ethUtils = { localSign: identity, localRecover: identity };

    bidRecepitService = new BidReceiptService();
    bidRecepitService.BidReceipt = BidReceipt;
    bidRecepitService.ethUtils = ethUtils;
  });

  describe("sign", function() {
    it("should throw if the bidGroup is missing the id, message or receivedTimestamp or if the message is not a valid string", async function() {
      let errorMessages = [];

      const sign = async bidGroup => {
        try {
          await bidRecepitService.sign(bidGroup);
        } catch (error) {
          errorMessages.push(error.message);
        }
      };

      await sign({ message: "Hey there" });
      await sign({ id: 22 });
      await sign({ id: 22, message: "Hello" });
      await sign({ id: 22, message: {}, receivedTimestamp: new Date() });

      const missingProps =
        "Can't sign an invalid bid group. Missing properties, the bid group has to have at least an id, message an receivedTimestamp properties";
      const invalidMessage = "Can't sign an invalid bid group. Invalid message";

      expect(errorMessages.length).to.equal(4);
      expect(errorMessages).to.deep.equal([
        missingProps,
        missingProps,
        missingProps,
        invalidMessage
      ]);
    });

    it("should insert a bid receipt with the message and signature for the bid group", async function() {
      const timestamp = 1507399991050000;
      const bidGroup = {
        id: 20,
        message: "Some message",
        receivedTimestamp: new Date(timestamp)
      };

      const bidRecepitId = 30;
      const signature =
        "de2f8161b2e3d6b4c83de7b04376d37f66d89dff15f2a4ac651a644fc8dfc9c7||0460522b69a46c9c654bb581f479538e8a70682048fb14205d6f1632460b167d||27";
      const serverMessage = `30||${timestamp}||Some message`;
      const serverPrivKey = env.getEnv("SERVER_PRIVATE_KEY");

      const spy = sinon.spy(BidReceipt, "update");

      sinon
        .stub(BidReceipt, "insert")
        .withArgs(
          sinon.match({
            receivedTimestamp: sinon.match.date,
            bidGroupId: bidGroup.id
          })
        )
        .returns({ id: bidRecepitId });

      sinon
        .stub(ethUtils, "localSign")
        .withArgs(serverMessage, serverPrivKey)
        .returns(signature);

      await bidRecepitService.sign(bidGroup);

      expect(
        spy.calledWithExactly(
          sinon.match({ signature, message: serverMessage }),
          sinon.match({ id: bidRecepitId })
        )
      ).to.be.true;
    });
  });
});
