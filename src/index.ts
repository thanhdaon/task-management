import { serve } from "@hono/node-server";
import { createApp, createSecureRouter } from "~/app/create-app";
import { env } from "~/helpers/env";

import * as signin from "~/usecases/signin";
import * as signup from "~/usecases/signup";
import * as taskCreate from "~/usecases/task-create";
import * as taskList from "~/usecases/task-list";
import * as taskUpdateStatus from "~/usecases/task-update-status";
import * as userList from "~/usecases/user-list";
import * as userTaskSummary from "~/usecases/user-task-summary";

async function bootstrap() {
  const app = createApp();
  app.openapi(signup.route, signup.handler);
  app.openapi(signin.route, signin.handler);

  const appSecure = createSecureRouter();
  appSecure.openapi(taskCreate.route, taskCreate.handler);
  appSecure.openapi(taskList.route, taskList.handler);
  appSecure.openapi(taskUpdateStatus.route, taskUpdateStatus.handler);
  appSecure.openapi(userList.route, userList.handler);
  appSecure.openapi(userTaskSummary.route, userTaskSummary.handler);

  app.route("/", appSecure);

  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`Server is running`, info);
  });
}

bootstrap().catch(console.error);
