import { defineConfig } from "drizzle-kit";
import { env } from "~/helpers/env";

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "src/db/drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
