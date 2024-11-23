import { OpenAPIHono, RouteConfig, RouteHandler, z } from "@hono/zod-openapi";

export type AppOpenAPI = OpenAPIHono;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R>;
export type ZodSchema = z.AnyZodObject | z.ZodArray<z.AnyZodObject>;
