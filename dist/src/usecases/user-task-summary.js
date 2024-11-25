import { createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { FORBIDDEN, NOT_FOUND, OK } from "../app/http-status-codes.js";
import { IdParamsSchema } from "../app/id-params.js";
import { jsonContent } from "../app/openapi-json.js";
import { createDataSchema, ErrorSchema, UserTaskSummarySchema, } from "../app/openapi-schemas.js";
import { responseForbidden, responseNotFound, responseOk, } from "../app/response.js";
import { isEmployer } from "../auth/adapter-hono.js";
import { db } from "../db/db.js";
import { tasks, users } from "../db/schema.js";
export const route = createRoute({
    tags: ["users"],
    method: "get",
    path: "users/{id}/task-summary",
    request: {
        params: IdParamsSchema,
    },
    responses: {
        [OK]: jsonContent(createDataSchema(UserTaskSummarySchema)),
        [FORBIDDEN]: jsonContent(ErrorSchema),
        [NOT_FOUND]: jsonContent(ErrorSchema),
    },
});
export const handler = async (c) => {
    if (!isEmployer(c)) {
        return responseForbidden(c);
    }
    const { id } = c.req.valid("param");
    const count = await db.$count(users, eq(users.id, id));
    if (count === 0) {
        return responseNotFound(c, `user with id ${id} not found`);
    }
    const [taskAssignedCount, taskCompletedCount] = await Promise.all([
        db.$count(tasks, eq(tasks.assigneeId, id)),
        db.$count(tasks, and(eq(tasks.assigneeId, id), eq(tasks.status, "done"))),
    ]);
    return responseOk(c, { taskAssignedCount, taskCompletedCount });
};
