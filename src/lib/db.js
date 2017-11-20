import { db, env } from "decentraland-commons";

export default {
  ...db.postgres,

  async connect() {
    const CONNECTION_STRING = env.get("CONNECTION_STRING");

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
      "receivedAt" timestamp NOT NULL`
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
      "receivedAt" timestamp NOT NULL`
    );

    await this.createTable(
      "bid_receipts",
      `"id" int NOT NULL DEFAULT nextval('bid_receipts_id_seq'),
      "bidGroupId" int NOT NULL UNIQUE,
      "receivedAt" timestamp NOT NULL,
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
    // TODO: x and y need an index. See ParcelState#findInCoordinates
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
      "disabled" BOOLEAN NOT NULL DEFAULT false`,
      { sequenceName: null }
    );

    await this.createTable(
      "outbid_notifications",
      `"id" int NOT NULL DEFAULT nextval('outbid_notifications_id_seq'),
      "parcelStateId" text NOT NULL,
      "email" text NOT NULL,
      "active" boolean DEFAULT TRUE`
    );

    await this.createTable(
      "jobs",
      `"id" int NOT NULL DEFAULT nextval('jobs_id_seq'),
      "type" text NOT NULL,
      "referenceId" int NOT NULL,
      "state" text,
      "data" json`
    );

    await this.createTable(
      "district_entries",
      `"id" int NOT NULL DEFAULT nextval('district_entries_id_seq'),
      "address" varchar(42) NOT NULL,
      "project_id" varchar(36) NOT NULL,
      "lands" int NOT NULL,
      "userTimestamp" varchar(20) NOT NULL,
      "action" varchar(16) NOT NULL,
      "message" BYTEA DEFAULT NULL,
      "signature" BYTEA DEFAULT NULL`
    );

    await this.createTable('locked_balance_events', `
      "id" int NOT NULL DEFAULT nextval('locked_balance_events_id_seq'),
      "address" varchar(42) NOT NULL,
      "txId" TEXT NOT NULL UNIQUE,
      "mana" DECIMAL NOT NULL,
      "confirmedAt" timestamp NOT NULL
    `)

    await this.createTable(
      "buy_transactions",
      `"id" int NOT NULL DEFAULT nextval('buy_transactions_id_seq'),
      "txId" text NOT NULL UNIQUE,
      "address" text NOT NULL,
      "parcelStatesIds" text[] NOT NULL,
      "totalCost" text NOT NULL,
      "status" text NOT NULL,
      "receipt" json`
    );
    await this.createIndex("buy_transactions", "buy_transactions_status_idx", [
      "status"
    ]);

    await this.createTable(
      "return_transactions",
      `"id" int NOT NULL DEFAULT nextval('return_transactions_id_seq'),
      "txId" text NOT NULL UNIQUE,
      "address" text NOT NULL,
      "amount" text NOT NULL,
      "status" text NOT NULL,
      "receipt" json`
    );
  }
};
