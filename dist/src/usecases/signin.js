import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { BAD_REQUEST, OK } from "../app/http-status-codes.js";
import { HttpStatusPhrases } from "../app/http-status-phrases.js";
import { jsonContent, jsonContentRequired } from "../app/openapi-json.js";
import { createDataSchema, ErrorSchema, UserSchema, } from "../app/openapi-schemas.js";
import { responseBadRequest, responseOk } from "../app/response.js";
import { setSessionCookie } from "../auth/adapter-hono.js";
import { createSession, generateSessionToken, getUserByUsername, getUserPasswordHash, } from "../auth/auth.js";
import { verifyPassword } from "../auth/password.js";
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
export const handler = async (c) => {
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
