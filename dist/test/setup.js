import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { reset } from "drizzle-seed";
import { afterEach, vi } from "vitest";
import * as schema from "../src/db/schema.js";
import { db } from "../src/db/db.js";
vi.mock("~/db/db", async () => {
    const db = drizzle({ schema, casing: "snake_case" });
    await migrate(db, {
        migrationsFolder: "src/db/migrations",
    });
    return { db };
});
afterEach(async () => {
    await reset(db, schema);
});
