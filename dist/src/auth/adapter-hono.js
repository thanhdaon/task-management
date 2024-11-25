import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { validateSessionToken } from "./auth.js";
import { responseUnthenticated } from "../app/response.js";
export function setSessionCookie(c, token, expiresAt) {
    setCookie(c, "session", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
    });
}
export function deleteSessionTokenCookie(c) {
    setCookie(c, "session", "", {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
    });
}
export function isEmployee(c) {
    return c.var.user.role === "employee";
}
export function isEmployer(c) {
    return c.var.user.role === "employer";
}
export const sessionMW = createMiddleware(async (c, next) => {
    const sessionToken = getCookie(c, "session");
    if (sessionToken) {
        const { user, session } = await validateSessionToken(sessionToken);
        if (user) {
            c.set("user", user);
        }
        if (session) {
            c.set("session", session);
        }
    }
    await next();
});
export const secureMW = createMiddleware(async (c, next) => {
    if (c.var.user === undefined || c.var.session === undefined) {
        return responseUnthenticated(c);
    }
    await next();
});
