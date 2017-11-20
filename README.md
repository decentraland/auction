# Auction

# How to run

Start the docker containers

    npm run docker:dev:build
    npm run docker:dev:run

Setup the database (first time)

    npm run docker:initdb

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

- Get all BidReceipts

### Closing notes

Remember that for the auction font to work, you need to have a wallet provider like [MetaMask](https://metamask.io/) installed, and that your wallet address should be present on the `address_states` table (and by extension, on the terraform app).
You can mock all of this by inserting the necessary row into that table (with an amount).
