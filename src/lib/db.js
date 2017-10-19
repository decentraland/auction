import { db, env } from "decentraland-commons";

export default {
  ...db.postgres,

  async connect() {
    const CONNECTION_STRING = env.getEnv(
      "CONNECTION_STRING",
      "postgres://localhost:5432/auction"
    );

    this.client = await db.postgres.connect(CONNECTION_STRING);

    await this.createSchema();

    return this;
  },

  async createSchema() {
    // bids json = [{ x, y, amount }]
    await this.createTable(
      "bid_groups",
      `"id" int NOT NULL DEFAULT nextval('bid_groups_id_seq'),
      "bids" json NOT NULL,
      "address" varchar(42) NOT NULL,
      "nonce" int NOT NULL DEFAULT 0,
      "message" BYTEA DEFAULT NULL,
      "signature" BYTEA DEFAULT NULL,
      "receivedTimestamp" timestamp NOT NULL`
    );

    // BidGroup denormalization, bid + index
    await this.createTable(
      "bids",
      `"id" int NOT NULL DEFAULT nextval('bids_id_seq'),
      "x" int NOT NULL,
      "y" int NOT NULL,
      "bidGroupId" int NOT NULL,
      "bidIndex" int NOT NULL,
      "address" varchar(42) NOT NULL,
      "amount" text NOT NULL,
      "receivedTimestamp" timestamp NOT NULL`
    );

    await this.createTable(
      "bid_receipts",
      `"id" int NOT NULL DEFAULT nextval('bid_receipts_id_seq'),
      "bidGroupId" int NOT NULL UNIQUE,
      "receivedTimestamp" timestamp NOT NULL,
      "signature" BYTEA DEFAULT NULL,
      "message" BYTEA DEFAULT NULL`
    );

    await this.createTable(
      "address_states",
      `"id" int NOT NULL DEFAULT nextval('address_states_id_seq'),
      "address" varchar(42) NOT NULL UNIQUE,
      "balance" text NOT NULL,
      "latestBidGroupId" int`
    );

    // id => string (hash of `x,y`)
    await this.createTable(
      "parcel_states",
      `"id" text NOT NULL,
      "x" int NOT NULL,
      "y" int NOT NULL,
      "address" varchar(42),
      "amount" text,
      "endsAt" timestamp,
      "bidIndex" int,
      "bidGroupId" int,
      "projectId" TEXT`,
      { sequenceName: null }
    );

    await this.createTable(
      "projects",
      `"id" TEXT NOT NULL,
      "name" TEXT,
      "desc" TEXT,
      "link" TEXT,
      "public" BOOLEAN NOT NULL DEFAULT true,
      "parcels" DECIMAL,
      "priority" int,
      "disabled" BOOLEAN NOT NULL DEFAULT false`
    );
  }
};
