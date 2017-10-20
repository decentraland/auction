import { eth, env } from "decentraland-commons";
import { BidReceipt } from "../models";

export default class BidReceiptService {
  constructor() {
    this.BidReceipt = BidReceipt;
    this.eth = eth;
  }

  async sign(bidGroup) {
    this.checkBidGroup(bidGroup);

    const receipt = {
      receivedTimestamp: bidGroup.receivedTimestamp,
      bidGroupId: bidGroup.id
    };

    const inserted = await this.BidReceipt.insert(receipt);
    const serverAddress = this.getServerAddress();

    const serverMessage = this.getServerMessage({
      ...bidGroup,
      id: inserted.id
    });
    const serverSignature = await this.eth.sign(serverMessage, serverAddress);

    await this.BidReceipt.update(
      { message: serverMessage, signature: serverSignature },
      { id: inserted.id }
    );
  }

  async verify(bidRecepit) {
    const { address } = await this.recover(bidRecepit);

    if (address !== this.getServerAddress()) {
      throw new Error("Invalid signature for message");
    }
  }

  async recover(bidRecepit) {
    const { message, signature } = bidRecepit;
    const address = await this.eth.recover(message, signature);

    return {
      address,
      message: this.eth.fromHex(message)
    };
  }

  getServerMessage(bidGroup) {
    return this.eth.toHex(
      `${bidGroup.id}||${bidGroup.receivedTimestamp.getTime()}||${bidGroup.message}`
    );
  }

  getServerAddress() {
    return env.getEnv("SERVER_ADDRESS", () => {
      throw new Error("Missing server address to sign: SERVER_ADDRESS");
    });
  }

  checkBidGroup(bidGroup) {
    const required = ["id", "message", "receivedTimestamp"];

    if (!required.every(prop => bidGroup[prop])) {
      throw new Error(
        "Can't sign an invalid bid group. Missing properties, the bid group has to have at least an id, message an receivedTimestamp properties"
      );
    }
    if (typeof bidGroup.message !== "string") {
      throw new Error("Can't sign an invalid bid group. Invalid message");
    }
  }
}
