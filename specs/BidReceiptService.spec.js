import { expect } from "chai";
import sinon from "sinon";

import { BidReceiptService } from "../src/lib/services";

const identity = x => x;

describe("BidReceiptService", function() {
  let bidRecepeitService;
  let BidReceipt;
  let eth;

  beforeEach(() => {
    BidReceipt = { insert: identity, update: identity };
    eth = { sign: identity, verify: identity, toHex: identity };

    bidRecepeitService = new BidReceiptService();
    bidRecepeitService.BidReceipt = BidReceipt;
    bidRecepeitService.eth = eth;
  });

  describe("sign", function() {
    it("should throw if the bidGroup is missing the id, message or timeReceived or if the message is not a valid string", async function() {
      let errorMessages = [];

      const sign = async bidGroup => {
        try {
          await bidRecepeitService.sign(bidGroup);
        } catch (error) {
          errorMessages.push(error.message);
        }
      };

      await sign({ message: "Hey there" });
      await sign({ id: 22 });
      await sign({ id: 22, message: "Hello" });
      await sign({ id: 22, message: {}, timeReceived: new Date() });

      expect(errorMessages.length).to.equal(4);
      expect(errorMessages).to.deep.equal([
        "Can't sign an invalid bid group. Missing properties, the bid group has to have at least an id, message an timeReceived properties",
        "Can't sign an invalid bid group. Missing properties, the bid group has to have at least an id, message an timeReceived properties",
        "Can't sign an invalid bid group. Missing properties, the bid group has to have at least an id, message an timeReceived properties",
        "Can't sign an invalid bid group. Invalid message"
      ]);
    });

    it("should insert a bid receipt with the message an signature for the bid group", async function() {
      const bidGroup = {
        id: 20,
        message: "Some message",
        timeReceived: new Date("Fri Aug 09 49737 05:44:10")
      };

      const bidRecepeitId = 30;
      const signature = "0x11d072f4fa63b4f1111111db50c1f17c931dd670";
      const serverMessage = "30||1507399991050000||Some message";

      const spy = sinon.spy(BidReceipt, "update");

      sinon
        .stub(BidReceipt, "insert")
        .withArgs(
          sinon.match({
            timeReceived: sinon.match.date,
            bidGroupId: bidGroup.id
          })
        )
        .returns({ id: bidRecepeitId });

      sinon
        .stub(eth, "sign")
        .withArgs(serverMessage, "0xdeadbeef")
        .returns(signature);

      await bidRecepeitService.sign(bidGroup);

      expect(
        spy.calledWithExactly(
          sinon.match({ signature, message: serverMessage }),
          sinon.match({ id: bidRecepeitId })
        )
      ).to.be.true;
    });
  });
});
