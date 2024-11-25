import { reset, seed } from "drizzle-seed";
import { db } from "../db/db.js";
import * as schema from "../db/schema.js";
async function run() {
    await reset(db, schema);
    await seed(db, schema);
}
run().catch(console.log);
