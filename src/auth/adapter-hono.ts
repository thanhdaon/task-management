import { Context } from "hono";
import { setCookie } from "hono/cookie";

export function setSessionCookie(c: Context, token: string, expiresAt: Date) {
  setCookie(c, "session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export function deleteSessionTokenCookie(c: Context) {
  setCookie(c, "session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}
