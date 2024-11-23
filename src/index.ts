import { serve } from "@hono/node-server";
import { app } from "~/app";
import { env } from "~/helpers/env";

async function bootstrap() {
  await import("~/routes/signin");

  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`Server is running`, info);
  });
}

bootstrap().catch(console.log);
