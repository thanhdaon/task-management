import { serve } from "@hono/node-server";
import { env } from "~/helpers/env";
import { createApp } from "~/app/create-app";

import * as signup from "~/usecases/signup";
import * as signin from "~/usecases/signin";

async function bootstrap() {
  const app = createApp();

  app.openapi(signup.route, signup.handler);
  app.openapi(signin.route, signin.handler);

  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`Server is running`, info);
  });
}

bootstrap().catch(console.error);
