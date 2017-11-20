import { expect } from "chai";

import { AddressService } from "../src/lib/services";
import { DistrictEntry, LockedBalanceEvent } from "../src/lib/models";

const toUnixtime = strDate => {
  return new Date(strDate).getTime();
};

describe("AddressService", () => {
  const addresses = ["0xdead", "0xbeef"];
  const [address1, address2] = addresses;

  const lockedToDistricts = [
    {
      address: address1,
      project_id: "1",
      lands: 5,
      userTimestamp: String(toUnixtime("2017-09-01 12:00:00")),
      action: "Join"
    },
    {
      address: address1,
      project_id: "1",
      lands: 10,
      userTimestamp: String(toUnixtime("2017-09-02 12:00:00")),
      action: "Join"
    },
    {
      address: address1,
      project_id: "1",
      lands: 2,
      userTimestamp: String(toUnixtime("2017-11-01 12:00:00")),
      action: "Join"
    },
    {
      address: address2,
      project_id: "1",
      lands: 50,
      userTimestamp: String(toUnixtime("2017-10-01 12:00:00")),
      action: "Join"
    }
  ];

  const lockedToTerraform = [
    {
      address: address1,
      txId: "0x1",
      mana: 10000,
      confirmedAt: new Date("2017-09-01 12:00:00")
    },
    {
      address: address1,
      txId: "0x2",
      mana: 10000,
      confirmedAt: new Date("2017-09-02 12:00:00")
    },
    {
      address: address1,
      txId: "0x3",
      mana: 4000,
      confirmedAt: new Date("2017-11-01 12:00:00")
    },
    {
      address: address2,
      txId: "0x4",
      mana: 50000,
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
    await Promise.all(lockedToDistricts.map(row => DistrictEntry.insert(row)));
    await Promise.all(
      lockedToTerraform.map(row => LockedBalanceEvent.insert(row))
    );
  });

  describe(".lockedMANABalanceOf", () => {
    it("should calculate balances with proper discounts", async () => {
      const balance1 = await AddressService.lockedMANABalanceOf(address1);
      expect(balance1).to.be.equal(24950);

      const balance2 = await AddressService.lockedMANABalanceOf(address2);
      expect(balance2).to.be.equal(52200);
    });
  });

  after(async () => {
    await Promise.all(
      addresses.map(address => DistrictEntry.delete({ address }))
    );
    await Promise.all(
      addresses.map(address => LockedBalanceEvent.delete({ address }))
    );
  });
});