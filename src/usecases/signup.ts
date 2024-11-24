import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { BAD_REQUEST, CREATED } from "~/app/http-status-codes";
import { jsonContent, jsonContentRequired } from "~/app/openapi-json";
import {
  createDataSchema,
  ErrorSchema,
  UserSchema,
} from "~/app/openapi-schemas";
import { responseBadRequest, responseCreated } from "~/app/response";
import { AppRouteHandler } from "~/app/types";
import { setSessionCookie } from "~/auth/adapter-hono";
import {
  checkUsernameAvailability,
  createSession,
  createUser,
  generateSessionToken,
} from "~/auth/auth";

const BodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["employee", "employer"]),
});

export const route = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signup",
  request: {
    body: jsonContentRequired(BodySchema),
  },
  responses: {
    [CREATED]: jsonContent(createDataSchema(UserSchema)),
    [BAD_REQUEST]: jsonContent(ErrorSchema),
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

  const user = await createUser(body.username, body.password, body.role);
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionCookie(c, sessionToken, session.expiresAt);

  return responseCreated(c, user);
};
