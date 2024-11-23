import { createRoute } from "@hono/zod-openapi";
import omit from "lodash-es/omit";
import { z } from "zod";
import { app } from "~/app";
import { createSuccessResponseSchema, ErrorSchema } from "~/openapi/schemas";

const BodySchema = z.object({
  text: z.string(),
});

const route = createRoute({
  tags: ["message"],
  method: "post",
  path: "/messages",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.string()),
        },
      },
      description: "Create message success",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid message",
    },
  },
});

app.openapi(route, async (c) => {
  const { text } = await c.req.valid("json");

  return c.json({ data: omit(user, "hashPassword") }, 200);
});
