import { createRoute, z } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { OK } from "~/app/http-status-codes";
import { jsonContent } from "~/app/openapi-json";
import {
  createDataSchema,
  createPaginationSchema,
  TaskSchema,
} from "~/app/openapi-schemas";
import { responseOk } from "~/app/response";
import { AppSecureRouteHandler } from "~/app/types";
import { isEmployee } from "~/auth/adapter-hono";
import { db } from "~/db/db";
import { when } from "~/db/helpers";
import { tasks } from "~/db/schema";

const QuerySchema = z.object({
  status: z.enum(["todo", "in-progress", "done", "pending"]).optional(),
  assigneeId: z.coerce.number().optional(),
  page: z.coerce.number().gt(0).default(1),
  pageSize: z.coerce.number().gt(0).default(10),
  sortField: z.enum(["status", "createdAt", "dueDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const route = createRoute({
  tags: ["tasks"],
  method: "get",
  path: "/tasks",
  request: {
    query: QuerySchema,
  },
  responses: {
    [OK]: jsonContent(createDataSchema(createPaginationSchema(TaskSchema))),
  },
});

export const handler: AppSecureRouteHandler<typeof route> = async (c) => {
  const queries = c.req.valid("query");

  const conditions = [
    when(queries.status, (status) => eq(tasks.status, status)),
  ];

  if (isEmployee(c)) {
    conditions.push(eq(tasks.assigneeId, c.var.user.id));
  } else {
    conditions.push(when(queries.assigneeId, (id) => eq(tasks.assigneeId, id)));
  }

  const [results, total] = await Promise.all([
    db.query.tasks.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        dueDate: true,
      },
      limit: queries.pageSize,
      offset: (queries.page - 1) * queries.pageSize,
      orderBy: (t, operator) => {
        if (queries.sortField === "status") {
          return [
            operator[queries.sortOrder](t.status),
            operator.asc(tasks.id),
          ];
        }

        if (queries.sortField === "createdAt") {
          return [
            operator[queries.sortOrder](t.createdAt),
            operator.asc(tasks.id),
          ];
        }

        if (queries.sortField === "dueDate") {
          return [
            operator[queries.sortOrder](t.dueDate),
            operator.asc(tasks.id),
          ];
        }

        return [operator.asc(tasks.id)];
      },
    }),
    db.$count(tasks, and(...conditions)),
  ]);

  return responseOk(c, {
    data: results,
    total,
    page: queries.page,
    pageSize: queries.pageSize,
  });
};
