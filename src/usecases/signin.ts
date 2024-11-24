import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { BAD_REQUEST, OK } from "~/app/http-status-codes";
import { HttpStatusPhrases } from "~/app/http-status-phrases";
import { jsonContent, jsonContentRequired } from "~/app/openapi-json";
import {
  createDataSchema,
  ErrorSchema,
  UserSchema,
} from "~/app/openapi-schemas";
import { responseBadRequest, responseOk } from "~/app/response";
import { AppRouteHandler } from "~/app/types";
import { setSessionCookie } from "~/auth/adapter-hono";
import {
  createSession,
  generateSessionToken,
  getUserByUsername,
  getUserPasswordHash,
} from "~/auth/auth";
import { verifyPassword } from "~/auth/password";

const BodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const route = createRoute({
  tags: ["auth"],
  method: "post",
  path: "/auth/signin",
  request: {
    body: jsonContentRequired(BodySchema),
  },
  responses: {
    [OK]: jsonContent(createDataSchema(UserSchema)),
    [BAD_REQUEST]: jsonContent(ErrorSchema),
  },
});

export const handler: AppRouteHandler<typeof route> = async (c) => {
  const { username, password } = await c.req.valid("json");

  if (username === "" || password === "") {
    return responseBadRequest(c, HttpStatusPhrases.BAD_REQUEST);
  }

  const user = await getUserByUsername(username);

  if (user === undefined) {
    return responseBadRequest(c, HttpStatusPhrases.BAD_REQUEST);
  }

  const hashPassword = await getUserPasswordHash(username);
  const validPassword = await verifyPassword(hashPassword, password);

  if (!validPassword) {
    return responseBadRequest(c, HttpStatusPhrases.BAD_REQUEST);
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionCookie(c, sessionToken, session.expiresAt);

  return responseOk(c, user);
};
