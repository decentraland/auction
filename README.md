# auction

## BidGroup

```
{
    bids: [
        { x, y, bid }
    ],
    timestamp,
    address,
    id
}
```

Bid: (BidGroup + index)

## Bid

This data is completely created by the user.

```
{
   "type": "object",
   "properties": {
       "x": "number",
       "y": "number",
       "bid": "string", // BigNumber
       
       "timestamp": "number",
       
       "id": "string",
       "address": "string",
       
       one of these two:
       "prevId": "string",
       "nonce": "number",
       
       "message": "string",
       "signature": "string"
   }
}
```

## BidReceipt

```
{
    "id": bid id
    "timeReceived": number
    "messageHash": "string" // received message from user
    
    "serverAddres": decentraland's private key
    "serverSignature": decentraland's signature
    "serverMessage": id+timereceived+messageHash objet, serialized, and signed above
}
```

## AddressState

- address: string (primary key)
- balance: string (bignumber)
- latestBid: string (id to bid)


## ParcelState

- x: number
- y: number
- currentValue: string (bignumber)
- currentAddress: string (address of current winner)
- auctionEnds: timestamp
- currentBid: string (bid id)

# Process

## Initialization of state

- Read a dump of address => Balance
- Read a description of parcels to be auctioned
- Read timestamp of start

- Store initial states in database

## Read state of a parcel

- Input: x, y
- Output: ParcelState

## Upload a bid group

Input: signed message

- recover address from signed message

Validation of bid group

- uuid does not exist
- prevhash/nonce accordingly
- timestamp > prev user's bid timestamp

Validation of each bid

- store temp variable with balance
- fetch current state for all parcels involved
- for each bid:
    - check validity:
        * x, y in range
        * enough balance
        * parcel autcion did not end
        * bid > 1.1 * current bid
    - if invalid, create receipt of error and return
    - Create new parcelstate:
        - current value
        - current bidgroup+index
        - current address
        - auction ends
    - Update in-memory state of the parcel
    - Update database
    - update temp balance
- AddressState: decrease balance
- AddressState: update latest bidgroup

## Verification

- Initialization: Same as setup
- Bulk processing of all Bids received
  * For each BidReceipt: fetch BidGroup, apply state change
- Dump Final state for each parcel


# API

- AddressState fetch by id

- ParcelState fetch by id

- AddressParcelBids fetch for an user:
  * My last bid on the parcel
  * Current winning bid

- Parcel Range query:
  * min x, max x, min y, max y
  * Return parcel state for all these

- Submit BidGroup