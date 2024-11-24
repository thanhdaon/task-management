import { reset, seed } from "drizzle-seed";
import { db } from "~/db/db";
import * as schema from "~/db/schema";

async function run() {
  await reset(db as any, schema);
  await seed(db as any, schema);
}

run().catch(console.log);
