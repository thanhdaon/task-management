import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../helpers/env.js";
import * as schema from "../db/schema.js";
export const db = drizzle({
    connection: env.DATABASE_URL,
    schema,
    casing: "snake_case",
});
