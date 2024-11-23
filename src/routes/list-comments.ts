import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { app } from "~/app";
import { db } from "~/db/db";
import { nest } from "~/helpers/comment";
import { createSuccessResponseSchema, CommentSchema } from "~/openapi/schemas";

const route = createRoute({
  tags: ["comments"],
  method: "get",
  path: "/comments",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(CommentSchema.array()),
        },
      },
      description: "Retrieve the all todos",
    },
  },
});

app.openapi(route, async (c) => {
  const message = await db.query.messages.findFirst();
  if (message === undefined) {
    return c.json({ data: [] }, 200);
  }

  const comments = await db.query.comments.findMany({
    where: (fields, { eq }) => eq(fields.messageId, message.id),
    columns: {
      id: true,
      parentId: true,
      text: true,
      authorId: true,
    },
  });

  return c.json({ data: nest(comments) }, 200);
});
