import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from "../app/http-status-codes.js";
import { HttpStatusPhrases } from "../app/http-status-phrases.js";
import { IdParamsSchema } from "../app/id-params.js";
import { jsonContent, jsonContentRequired } from "../app/openapi-json.js";
import { ErrorSchema, MessageSchema } from "../app/openapi-schemas.js";
import { responseForbidden, responseNotFound, responseOkMessage, } from "../app/response.js";
import { isEmployee } from "../auth/adapter-hono.js";
import { db } from "../db/db.js";
import { tasks } from "../db/schema.js";
const BodySchema = z.object({
    status: z.enum(["todo", "in-progress", "done", "pending"]),
});
export const route = createRoute({
    tags: ["tasks"],
    method: "put",
    path: "/tasks/{id}",
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(BodySchema),
    },
    responses: {
        [OK]: jsonContent(MessageSchema),
        [BAD_REQUEST]: jsonContent(ErrorSchema),
        [FORBIDDEN]: jsonContent(ErrorSchema),
        [NOT_FOUND]: jsonContent(ErrorSchema),
    },
});
export const handler = async (c) => {
    if (!isEmployee(c)) {
        return responseForbidden(c);
    }
    const body = c.req.valid("json");
    const params = c.req.valid("param");
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, params.id),
        columns: {
            assigneeId: true,
            status: true,
        },
    });
    if (task === undefined) {
        return responseNotFound(c, `task with id ${params.id} not found`);
    }
    if (task.assigneeId !== c.var.user.id) {
        return responseForbidden(c);
    }
    if (task.status === body.status) {
        return responseOkMessage(c, HttpStatusPhrases.OK);
    }
    await db
        .update(tasks)
        .set({ status: body.status })
        .where(eq(tasks.id, params.id));
    return responseOkMessage(c, HttpStatusPhrases.OK);
};
