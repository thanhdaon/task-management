import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { setSessionCookie } from "~/auth/adapter-hono";
import {
  checkUsernameAvailability,
  createSession,
  createUser,
  generateSessionToken,
} from "~/auth/auth";
import { responseBadRequest, responseCreated } from "~/app/response";
import {
  successResponseSchema,
  ErrorSchema,
  UserSchema,
} from "~/app/openapi-schemas";
import { AppRouteHandler } from "~/app/types";

const BodySchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const route = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signup",
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
    201: {
      content: {
        "application/json": {
          schema: successResponseSchema(UserSchema),
        },
      },
      description: "Signup success",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Signup success",
    },
  },
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const body = await c.req.valid("json");

  if (body.username === "" || body.password === "") {
    return responseBadRequest(c, "missing data");
  }

  const usernameAvailable = await checkUsernameAvailability(body.username);
  if (!usernameAvailable) {
    return responseBadRequest(c, `username ${body.username} is already used`);
  }

  const user = await createUser(body.username, body.password);
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionCookie(c, sessionToken, session.expiresAt);

  return responseCreated(c, user);
};
