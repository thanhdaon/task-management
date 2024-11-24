import { serve } from "@hono/node-server";
import { env } from "~/helpers/env";
import { createApp, createSecureRouter } from "~/app/create-app";
import { secureMW } from "~/auth/adapter-hono";

import * as signup from "~/usecases/signup";
import * as signin from "~/usecases/signin";
import * as taskCreate from "~/usecases/task-create";
import * as taskList from "~/usecases/task-list";

async function bootstrap() {
  const app = createApp();

  app.openapi(signup.route, signup.handler);
  app.openapi(signin.route, signin.handler);

  const appSecure = createSecureRouter();
  appSecure.openapi(taskCreate.route, taskCreate.handler);
  appSecure.openapi(taskList.route, taskList.handler);

  app.route("/", appSecure);

  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`Server is running`, info);
  });
}

bootstrap().catch(console.error);
