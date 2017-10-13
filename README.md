# auction

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

## Upload a bid

Input: signed message

- Recover address from signed message

Check preconditions:

- x, y, en rango
- prevHash/nonce accordingly
- timestamp > prev user's bid timestamp
- enough balance
- parcel auction did not end
- if current parcel bid: value of bid > 1.1 * current parcel bid

Apply Bid:

- AddressState: decrease balance
- AddressState: update latest bid
- ParcelState: update current value
- ParcelState: update current bid
- ParcelState: update current address
- ParcelState: update current auction ends

Return BidReceipt to User

Return ParcelState to User

## Verification

- Initialization: Same as setup
- Bulk processing of all Bids received
  * For each BidReceipt: fetch Bid, apply state change
- Dump Final state for each parcel