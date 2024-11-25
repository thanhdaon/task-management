import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { BAD_REQUEST, FORBIDDEN, OK } from "../app/http-status-codes.js";
import { jsonContent, jsonContentRequired } from "../app/openapi-json.js";
import { createDataSchema, ErrorSchema, TaskSchema, } from "../app/openapi-schemas.js";
import { responseForbidden, responseOk } from "../app/response.js";
import { isEmployer } from "../auth/adapter-hono.js";
import { db } from "../db/db.js";
import { tasks } from "../db/schema.js";
const BodySchema = z.object({
    title: z.string().min(1),
    assignedId: z.number(),
    dueDate: z.coerce.date(),
});
export const route = createRoute({
    tags: ["tasks"],
    method: "post",
    path: "/tasks",
    request: {
        body: jsonContentRequired(BodySchema),
    },
    responses: {
        [OK]: jsonContent(createDataSchema(TaskSchema)),
        [BAD_REQUEST]: jsonContent(ErrorSchema),
        [FORBIDDEN]: jsonContent(ErrorSchema),
    },
});
export const handler = async (c) => {
    if (!isEmployer(c)) {
        return responseForbidden(c);
    }
    const input = c.req.valid("json");
    const [newTask] = await db
        .insert(tasks)
        .values({
        title: input.title,
        assigneeId: input.assignedId,
        dueDate: input.dueDate,
        createdById: c.var.user.id,
    })
        .returning({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        createdAt: tasks.createdAt,
        dueDate: tasks.dueDate,
    });
    return responseOk(c, newTask);
};
