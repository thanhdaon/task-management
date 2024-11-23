import { z } from "@hono/zod-openapi";

export function createSuccessResponseSchema<T>(schema: z.ZodType<T>) {
  return z.object({ data: schema });
}

export function createPaginationResponseSchema<T>(schema: z.ZodType<T>) {
  return z.object({
    data: schema,
    total: z.number().gte(0),
    page: z.number().gt(0),
    pageSize: z.number().gt(0),
  });
}

export const UserSchema = z
  .object({
    id: z.number(),
    username: z.string(),
    createdAt: z.date(),
  })
  .openapi("User");

export const ErrorSchema = z
  .object({
    code: z.number(),
    error: z.string(),
  })
  .openapi("Error");
