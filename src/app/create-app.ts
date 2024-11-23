import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { defaultHook, notFound, onError } from "~/app/hooks";

export function createRouter() {
  const hono = new OpenAPIHono({
    strict: false,
    defaultHook,
  });
  return hono.basePath("/api");
}

export function createApp() {
  const app = createRouter();

  app.use(cors());
  app.use(logger());
  app.notFound(notFound);
  app.onError(onError);

  app.doc("/openapi-json", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Doc",
    },
  });

  app.get("/doc", swaggerUI({ url: "/api/openapi-json" }));

  return app;
}
