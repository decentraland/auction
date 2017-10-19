import { BidGroup, AddressState, ParcelState } from "../models";

const HOURS_IN_MILLIS = 60 * 60 * 1000;

export default class BidService {
  constructor() {
    this.BidGroup = BidGroup;
    this.AddressState = AddressState;
    this.ParcelState = ParcelState;

    this.minimumX = -1e4;
    this.minimumY = -1e4;

    this.maximumX = 1e4;
    this.maximumY = 1e4;

    this.gracePeriod = 36 * HOURS_IN_MILLIS;
  }

  async insert(bidGroup) {
    if (bidGroup.id) {
      throw new Error(
        `BidGroup seems to be inserted already, with id ${bidGroup.id}`
      );
    }

    this.checkValidBidGroup(bidGroup);

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
        index
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

  checkValidBidGroup(bidGroup) {
    const validationError = this.getBidGroupValidationError(bidGroup);
    if (validationError) {
      throw new Error(validationError);
    }
  }

  async getBidGroupValidationError(bidGroup) {
    if (await this.BidGroup.findOne(bidGroup.id)) {
      return `Id ${bidGroup.id} already exists in database`;
    }
    const latestBid = await this.BidGroup.getLatestByAddress(bidGroup.address);
    if (latestBid) {
      const expectedNonce = latestBid.nonce + 1;
      if (expectedNonce !== bidGroup.nonce) {
        return `Invalid nonce for ${bidGroup.address}: stored ${latestBid.nonce}, received ${bidGroup.nonce}`;
      }
      if (latestBid.timestamp > bidGroup.timestamp) {
        return `Invalid timestamp for BidGroup received ${bidGroup.id}: latest was ${latestBid.timestamp}, received ${bidGroup.timestamp}`;
      }
    }
    return null;
  }

  getBidValidationError(fullAddressState, parcelState, bidGroup, index) {
    const bid = bidGroup.bids[index];

    if (bid.x < this.minimumX || bid.x > this.maximumX) {
      return `Invalid X coordinate for bid ${index} of bidGroup ${bidGroup.id}:
        ${bid.x} is not between ${this.minimumX} and ${this.maximumX}`;
    }
    if (bid.y < this.minimumY || bid.y > this.maximumY) {
      return `Invalid Y coordinate for bid ${index} of bidGroup ${bidGroup.id}:
        ${bid.y} is not between ${this.minimumY} and ${this.maximumY}`;
    }

    let newBalance = this.calculateNewBalance(
      fullAddressState,
      parcelState,
      bidGroup,
      bid
    );
    if (newBalance < 0) {
      return `Insufficient balance to participate in the bid`;
    }
    if (parcelState) {
      if (parcelState.endsAt < bidGroup.receivedTimestamp) {
        return `Auction ended at ${parcelState.endsAt}`;
      }
      if (bid.amount < this.increment * parcelState.amount) {
        return `Insufficient increment from ${parcelState.amount} to ${bid.amount}`;
      }
    }
    return null;
  }

  calculateNewBalance(addressState, parcelState, bidGroup, bid) {
    if (parcelState.address !== bidGroup.address) {
      return addressState.balance - bid.amount;
    }
    return addressState.balance - bid.amount + parcelState.amount;
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
      endsAt: this.extendBid(parcelState, bidGroup.receivedTimestamp)
    };
  }

  extendBid(parcelState, lastTimestamp) {
    return Math.max(parcelState.endsAt, lastTimestamp + this.gracePeriod);
  }
}
