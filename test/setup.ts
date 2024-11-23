import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { reset } from "drizzle-seed";
import { afterEach, vi } from "vitest";

import * as schema from "~/db/schema";
import { db } from "~/db/db";

vi.mock("~/db/db", async () => {
  const db = drizzle({ schema, casing: "snake_case" });

  await migrate(db as any, {
    migrationsFolder: "src/db/migrations",
  });

  return { db };
});

afterEach(async () => {
  await reset(db as any, schema);
});
