import { createRoute, z } from "@hono/zod-openapi";
import { and, asc, desc, eq } from "drizzle-orm";
import { FORBIDDEN, OK } from "../app/http-status-codes.js";
import { jsonContent } from "../app/openapi-json.js";
import { createDataSchema, createPaginationSchema, ErrorSchema, UserSchema, } from "../app/openapi-schemas.js";
import { responseForbidden, responseOk } from "../app/response.js";
import { isEmployer } from "../auth/adapter-hono.js";
import { db } from "../db/db.js";
import { when } from "../db/helpers.js";
import { users } from "../db/schema.js";
const QuerySchema = z.object({
    role: z.enum(["employee", "employer"]).optional(),
    page: z.coerce.number().gt(0).default(1),
    pageSize: z.coerce.number().gt(0).default(10),
    sortField: z.enum(["status", "createdAt", "dueDate"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
export const route = createRoute({
    tags: ["users"],
    method: "get",
    path: "/users",
    request: {
        query: QuerySchema,
    },
    responses: {
        [OK]: jsonContent(createDataSchema(createPaginationSchema(UserSchema))),
        [FORBIDDEN]: jsonContent(ErrorSchema),
    },
});
export const handler = async (c) => {
    if (!isEmployer(c)) {
        return responseForbidden(c);
    }
    const queries = c.req.valid("query");
    const conditions = [when(queries.role, (role) => eq(users.role, role))];
    const sortOp = { asc: asc, desc: desc };
    const orderBy = () => {
        if (queries.sortField === "createdAt") {
            return [sortOp[queries.sortOrder](users.createdAt), asc(users.id)];
        }
        return [asc(users.id)];
    };
    const [results, total] = await Promise.all([
        db.query.users.findMany({
            where: and(...conditions),
            columns: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
            },
            limit: queries.pageSize,
            offset: (queries.page - 1) * queries.pageSize,
            orderBy,
        }),
        db.$count(users, and(...conditions)),
    ]);
    return responseOk(c, {
        data: results,
        total,
        page: queries.page,
        pageSize: queries.pageSize,
    });
};
