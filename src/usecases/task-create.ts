import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { BAD_REQUEST, FORBIDDEN, OK } from "~/app/http-status-codes";
import { jsonContent, jsonContentRequired } from "~/app/openapi-json";
import {
  createDataSchema,
  ErrorSchema,
  TaskSchema,
} from "~/app/openapi-schemas";
import { responseForbidden, responseOk } from "~/app/response";
import { AppSecureRouteHandler } from "~/app/types";
import { isEmployer } from "~/auth/adapter-hono";
import { db } from "~/db/db";
import { tasks } from "~/db/schema";

const BodySchema = z.object({
  title: z.string().min(1),
  assigneeId: z.number(),
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

export const handler: AppSecureRouteHandler<typeof route> = async (c) => {
  if (!isEmployer(c)) {
    return responseForbidden(c);
  }

  const input = c.req.valid("json");

  const [newTask] = await db
    .insert(tasks)
    .values({
      title: input.title,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate,
      createdById: c.var.user.id,
    })
    .returning({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      assigneeId: tasks.assigneeId,
      createdAt: tasks.createdAt,
      dueDate: tasks.dueDate,
    });

  return responseOk(c, newTask);
};
