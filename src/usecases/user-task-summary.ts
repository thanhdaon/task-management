import { createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from "~/app/http-status-codes";
import { HttpStatusPhrases } from "~/app/http-status-phrases";
import { IdParamsSchema } from "~/app/id-params";
import { jsonContent } from "~/app/openapi-json";
import {
  createDataSchema,
  ErrorSchema,
  MessageSchema,
  UserTaskSummarySchema,
} from "~/app/openapi-schemas";
import {
  responseForbidden,
  responseNotFound,
  responseOk,
  responseOkMessage,
} from "~/app/response";
import { AppSecureRouteHandler } from "~/app/types";
import { isEmployer } from "~/auth/adapter-hono";
import { db } from "~/db/db";
import { tasks, users } from "~/db/schema";

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

export const handler: AppSecureRouteHandler<typeof route> = async (c) => {
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
