import { createRoute, z } from "@hono/zod-openapi";
import { and, asc, desc, eq } from "drizzle-orm";
import { OK } from "../app/http-status-codes.js";
import { jsonContent } from "../app/openapi-json.js";
import { createDataSchema, createPaginationSchema, TaskSchema, } from "../app/openapi-schemas.js";
import { responseOk } from "../app/response.js";
import { isEmployee } from "../auth/adapter-hono.js";
import { db } from "../db/db.js";
import { when } from "../db/helpers.js";
import { tasks } from "../db/schema.js";
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
    description: `
    Employer Role can View All Tasks with Filtering and Sorting:
      - Filter tasks by:
        - Assignee: View tasks assigned to a specific employee.
        - Status: View tasks based on status (e.g., "Pending," "In Progress," "Completed").
      - Sort tasks by:
        - Date: Sort tasks by creation date or due date.
        - Status: Sort tasks by task status to see active or completed tasks first.
    Employee Role can only view the tasks assigned to them
  `,
    method: "get",
    path: "/tasks",
    request: {
        query: QuerySchema,
    },
    responses: {
        [OK]: jsonContent(createDataSchema(createPaginationSchema(TaskSchema))),
    },
});
export const handler = async (c) => {
    const queries = c.req.valid("query");
    const conditions = [
        when(queries.status, (status) => eq(tasks.status, status)),
    ];
    if (isEmployee(c)) {
        conditions.push(eq(tasks.assigneeId, c.var.user.id));
    }
    else {
        conditions.push(when(queries.assigneeId, (id) => eq(tasks.assigneeId, id)));
    }
    const sortOp = { asc: asc, desc: desc };
    const orderBy = () => {
        if (queries.sortField === "status") {
            return [sortOp[queries.sortOrder](tasks.status), asc(tasks.id)];
        }
        if (queries.sortField === "createdAt") {
            return [sortOp[queries.sortOrder](tasks.createdAt), asc(tasks.id)];
        }
        if (queries.sortField === "dueDate") {
            return [sortOp[queries.sortOrder](tasks.dueDate), asc(tasks.id)];
        }
        return [asc(tasks.id)];
    };
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
            orderBy,
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
