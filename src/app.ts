import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { log } from "~/helpers/logger";

const hono = new OpenAPIHono();
const app = hono.basePath("/api");

app.use(cors());
app.use(logger(log));

app.doc("/openapi-json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Doc",
  },
});

app.get("/doc", swaggerUI({ url: "/api/openapi-json" }));

export { app };
