import { serve } from "@hono/node-server";
import { createApp, createSecureRouter } from "./app/create-app.js";
import { env } from "./helpers/env.js";
import * as signin from "./usecases/signin.js";
import * as signup from "./usecases/signup.js";
import * as taskCreate from "./usecases/task-create.js";
import * as taskList from "./usecases/task-list.js";
import * as taskUpdateStatus from "./usecases/task-update-status.js";
import * as userList from "./usecases/user-list.js";
import * as userTaskSummary from "./usecases/user-task-summary.js";
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
