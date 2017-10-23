import { eth } from "decentraland-commons";
import { BidGroup, AddressState, ParcelState } from "../models";

const HOURS_IN_MILLIS = 60 * 60 * 1000;

const bnCache = {};
const getBn = number => {
  if (!bnCache[number]) {
    bnCache[number] = new eth.utils.toBigNumber(number);
  }
  return bnCache[number];
};

export default class BidService {
  constructor() {
    this.BidGroup = BidGroup;
    this.AddressState = AddressState;
    this.ParcelState = ParcelState;

    this.minimumX = getBn(-1e4);
    this.minimumY = getBn(-1e4);

    this.maximumX = getBn(1e4);
    this.maximumY = getBn(1e4);

    this.increment = getBn(1.1);

    this.gracePeriod = 36 * HOURS_IN_MILLIS;
  }

  async insert(bidGroup) {
    if (bidGroup.id) {
      throw new Error(
        `BidGroup seems to be inserted already, with id ${bidGroup.id}`
      );
    }

    await this.checkValidBidGroup(bidGroup);

    bidGroup = await this.BidGroup.insert(bidGroup);
    this.processBidGroup(bidGroup);

    return bidGroup;
  }

  async processBidGroup(bidGroup) {
    const bidGroupError = await this.getBidGroupValidationError(bidGroup);
    if (bidGroupError) {
      return { error: bidGroupError };
    }

    const addressState = await this.AddressState.findByAddress(
      bidGroup.address
    );
    const parcelMap = await this.ParcelState.findInCoordinates(
      bidGroup.bids.map(bid => [bid.x, bid.y])
    );

    const results = [];
    for (let index in bidGroup.bids) {
      const bid = bidGroup.bids[index];
      const parcelState = parcelMap[bid.x][bid.y];

      const newParceState = this.getNewParcelState(
        addressState,
        parcelState,
        bidGroup,
        -(-index)
      );

      if (newParceState.error) {
        results.push(newParceState);
        continue;
      }

      addressState.balance = this.calculateNewBalance(
        addressState,
        parcelState,
        bidGroup,
        bid
      );

      parcelMap[bid.x][bid.y] = newParceState;
      await this.ParcelState.update(newParceState, { id: parcelState.id });

      results.push(newParceState);
    }

    addressState.latestBidGroupId = bidGroup.id;
    await this.AddressState.update(addressState, { id: addressState.id });

    return results;
  }

  async checkValidBidGroup(bidGroup) {
    const validationError = await this.getBidGroupValidationError(bidGroup);
    if (validationError) {
      throw new Error(validationError);
    }
  }

  async getBidGroupValidationError(bidGroup) {
    if (this.BidGroup.isIncomplete(bidGroup)) {
      return "The BidGroup seems to be invalid, it should have defined all the columns to be inserted.";
    }
    if (await this.BidGroup.findOne(bidGroup.id)) {
      return `Id ${bidGroup.id} already exists in database`;
    }

    const latestBid = await this.BidGroup.getLatestByAddress(bidGroup.address);

    if (latestBid) {
      const expectedNonce = latestBid.nonce + 1;
      if (expectedNonce !== bidGroup.nonce) {
        return `Invalid nonce for ${bidGroup.address}: stored ${latestBid.nonce}, received ${bidGroup.nonce}`;
      }
      if (latestBid.receivedTimestamp > bidGroup.receivedTimestamp) {
        return `Invalid timestamp for BidGroup received ${bidGroup.id}: latest was ${latestBid.receivedTimestamp}, received ${bidGroup.receivedTimestamp}`;
      }
    }
    return null;
  }

  getBidValidationError(fullAddressState, parcelState, bidGroup, index) {
    const bid = bidGroup.bids[index];

    const x = getBn(bid.x);
    const y = getBn(bid.y);

    if (x.lessThan(this.minimumX) || x.greaterThan(this.maximumX)) {
      return `Invalid X coordinate for bid ${index} of bidGroup ${bidGroup.id}: ${bid.x} is not between ${this.minimumX.toString()} and ${this.maximumX.toString()}`;
    }
    if (y.lessThan(this.minimumY) || y.greaterThan(this.maximumY)) {
      return `Invalid Y coordinate for bid ${index} of bidGroup ${bidGroup.id}: ${bid.y} is not between ${this.minimumY.toString()} and ${this.maximumY.toString()}`;
    }

    let newBalance = this.calculateNewBalance(
      fullAddressState,
      parcelState,
      bidGroup,
      bid
    );
    if (newBalance.lessThan(getBn(0))) {
      return `Insufficient balance to participate in the bid`;
    }
    if (parcelState) {
      if (parcelState.endsAt < bidGroup.receivedAt) {
        return `Auction ended at ${parcelState.endsAt}`;
      }
      if (
        getBn(bid.amount).lessThan(
          this.increment.mul(getBn(parcelState.amount))
        )
      ) {
        return `Insufficient increment from ${parcelState.amount} to ${bid.amount}`;
      }
    }
    return null;
  }

  calculateNewBalance(addressState, parcelState, bidGroup, bid) {
    if (parcelState.address !== bidGroup.address) {
      return getBn(addressState.balance).minus(getBn(bid.amount));
    }
    return getBn(addressState.balance)
      .minus(getBn(bid.amount))
      .plus(getBn(parcelState.amount));
  }

  getNewParcelState(fullAddressState, parcelState, bidGroup, index) {
    const error = this.getBidValidationError(
      fullAddressState,
      parcelState,
      bidGroup,
      index
    );
    if (error) {
      return { error };
    }

    const bid = bidGroup.bids[index];
    return {
      amount: bid.amount,
      bidGroup: bidGroup.id,
      bidIndex: index,
      address: bidGroup.address,
      endsAt: this.extendBid(parcelState, bidGroup.receivedAt)
    };
  }

  extendBid(parcelState, lastTimestamp) {
    return Math.max(parcelState.endsAt, lastTimestamp + this.gracePeriod);
  }
}
