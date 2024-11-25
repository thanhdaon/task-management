import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from "~/app/http-status-codes";
import { HttpStatusPhrases } from "~/app/http-status-phrases";
import { IdParamsSchema } from "~/app/id-params";
import { jsonContent, jsonContentRequired } from "~/app/openapi-json";
import { ErrorSchema, MessageSchema } from "~/app/openapi-schemas";
import {
  responseForbidden,
  responseNotFound,
  responseOkMessage,
} from "~/app/response";
import { AppSecureRouteHandler } from "~/app/types";
import { isEmployee } from "~/auth/adapter-hono";
import { db } from "~/db/db";
import { tasks } from "~/db/schema";

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

export const handler: AppSecureRouteHandler<typeof route> = async (c) => {
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
