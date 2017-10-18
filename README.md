# auction

## BidGroup

```
{
    bids: [
        { x, y, amount }
    ],
    timestamp,
    address,
    id,
    
    message,
    signature
}
```

Bid: (BidGroup + bidindex)

## Bid (denormalization of bidgroup)

```
{
    x
    y
    bidgroup
    bidindex
    address
    timpestamp
    amount
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
- latestBidGroupId: string (id to bid)


## ParcelState

- id: string (hash of `x||','||y`)
- x: number
- y: number
- amount: string (bignumber)
- address: string (address of current winner)
- endsAt: timestamp
- bidgroup: string (bidgroup id)
- bidIndex


## Projects

- id: string (uuid4)
- name: string, 
- desc: string, 
- link: string, 
- public: boolean,
- parcels: number,
- priority: number,
- disabled: boolean

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
        - current amount
        - current bidgroup+bidindex
        - current address
        - auction ends
    - Update in-memory state of the parcel
    - Update database
    - update temp balance
- AddressState: decrease balance
- AddressState: update latest bidgroup

## Verification

- Initialization: Same as setup
- Bulk processing of all BidGroups received
  * For each BidReceipt: fetch BidGroup, apply state change
- Dump Final state for each parcel


# API

- AddressState fetch by address
    - /simple (without all bidgroups, to sign with current last id)
    - /full contains all BidGroups

- ParcelState fetch by id
    - history of bids

- ParcelState group fetch
    - input: array of (x,y) o id (hash of x,y)

- Parcel Range query:
    - input: min x, max x, min y, max y

- Submit BidGroup

- Devolver recibos con nonce por address

- Get all receits
