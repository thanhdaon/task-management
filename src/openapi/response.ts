import { Context } from "hono";

export function responseBadRequest(c: Context, error: string) {
  return c.json({ code: 400, error }, 400);
}
