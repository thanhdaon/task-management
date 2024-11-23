import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { app } from "~/app";
import { setSessionCookie } from "~/auth/adapter-hono";
import {
  createSession,
  generateSessionToken,
  getUserByUsername,
  getUserPasswordHash,
} from "~/auth/auth";
import { verifyPassword } from "~/auth/password";
import { responseBadRequest } from "~/openapi/response";
import {
  createSuccessResponseSchema,
  ErrorSchema,
  UserSchema,
} from "~/openapi/schemas";

const BodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const route = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signin",
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
          schema: createSuccessResponseSchema(UserSchema),
        },
      },
      description: "Signin success",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Invalid credentials",
    },
  },
});

app.openapi(route, async (c) => {
  const { username, password } = await c.req.valid("json");

  if (username === "" || password === "") {
    return responseBadRequest(c, "invalid credentials");
  }

  const user = await getUserByUsername(username);

  if (user === undefined) {
    return responseBadRequest(c, "invalid credentials");
  }
  const hashPassword = await getUserPasswordHash(username);
  const validPassword = await verifyPassword(hashPassword, password);

  if (!validPassword) {
    return responseBadRequest(c, "invalid credentials");
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionCookie(c, sessionToken, session.expiresAt);

  return responseBadRequest(c, "invalid credentials");
});
