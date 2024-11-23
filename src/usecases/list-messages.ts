import { createRoute } from "@hono/zod-openapi";
import { app } from "~/app";
import { db } from "~/db/db";
import { successResponseSchema, MessageSchema } from "~/app/openapi-schemas";

const route = createRoute({
  tags: ["messages"],
  method: "get",
  path: "/messages",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema(MessageSchema.array()),
        },
      },
      description: "List the all messages",
    },
  },
});

app.openapi(route, async (c) => {
  const messages = await db.query.messages.findMany({
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
    with: {
      author: {
        columns: {
          username: true,
        },
      },
    },
  });
  return c.json({ data: messages }, 200);
});
