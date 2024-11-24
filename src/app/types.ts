import { OpenAPIHono, RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import { Session, User } from "~/auth/auth";

export interface AppBindings {
  Variables: {
    session?: Session;
    user?: User;
  };
}

export interface AppSecureBindings {
  Variables: {
    session: Session;
    user: User;
  };
}

export type App = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

export type AppSecureRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppSecureBindings
>;

export type ZodSchema = z.AnyZodObject | z.ZodArray<z.AnyZodObject>;
