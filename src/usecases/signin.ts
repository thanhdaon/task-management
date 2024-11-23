import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { setSessionCookie } from "~/auth/adapter-hono";
import {
  createSession,
  generateSessionToken,
  getUserByUsername,
  getUserPasswordHash,
} from "~/auth/auth";
import { verifyPassword } from "~/auth/password";
import { BAD_REQUEST, OK } from "~/app/http-status-codes";
import { responseBadRequest, responseOk } from "~/app/response";
import {
  successResponseSchema,
  ErrorSchema,
  UserSchema,
} from "~/app/openapi-schemas";
import { AppRouteHandler } from "~/app/types";
import { jsonContent, jsonContentRequired } from "~/app/openapi-json";

const BodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const route = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signin",
  request: {
    body: jsonContentRequired(BodySchema, "Signin inputs"),
  },
  responses: {
    [OK]: jsonContent(successResponseSchema(UserSchema), "Signin success"),
    [BAD_REQUEST]: jsonContent(ErrorSchema, "Invalid credentials"),
  },
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
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

  return responseOk(c, user);
};
