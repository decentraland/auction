import { expect } from "chai";
import { eth, utils } from "decentraland-commons";

import db from "../src/lib/db";
import { LockedBalanceEvent } from "../src/lib/models";

describe("LockedBalanceEvent", () => {
  const addresses = ["0xdead", "0xbeef"];
  const [address1, address2] = addresses;

  const testEvents = [
    {
      address: address1,
      txId: "0x1",
      mana: 1000,
      confirmedAt: new Date("2017-10-01 12:00:00")
    },
    {
      address: address1,
      txId: "0x2",
      mana: 2000,
      confirmedAt: new Date("2017-10-02 12:00:00")
    },
    {
      address: address1,
      txId: "0x3",
      mana: 3000,
      confirmedAt: new Date("2017-11-01 12:00:00")
    },
    {
      address: address2,
      txId: "0x4",
      mana: 1000,
      confirmedAt: new Date("2017-10-01 12:00:00")
    },
    {
      address: address2,
      txId: "0x5",
      mana: 2000,
      confirmedAt: new Date("2017-11-01 12:00:00")
    }
  ];

  beforeEach(async () => {
    await Promise.all(testEvents.map(row => LockedBalanceEvent.insert(row)));
  });

  describe(".getMonthlyLockedBalanceByAddress", async () => {
    it("should get locked balance of address by each month", async () => {
      const balances = await LockedBalanceEvent.getMonthlyLockedBalanceByAddress(
        "0xdead"
      ).then(rows => utils.arrayToObject(rows, "month", "mana"));

      expect(balances["10"]).to.be.equal("3000");
      expect(balances["11"]).to.be.equal("3000");
    });
  });

  after(async () => {
    await Promise.all(
      addresses.map(address => LockedBalanceEvent.delete({ address }))
    );
  });
});
