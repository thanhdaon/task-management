import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { BAD_REQUEST, CREATED } from "../app/http-status-codes.js";
import { jsonContent, jsonContentRequired } from "../app/openapi-json.js";
import { createDataSchema, ErrorSchema, UserSchema, } from "../app/openapi-schemas.js";
import { responseBadRequest, responseCreated } from "../app/response.js";
import { setSessionCookie } from "../auth/adapter-hono.js";
import { checkUsernameAvailability, createSession, createUser, generateSessionToken, } from "../auth/auth.js";
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
export const handler = async (c) => {
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
