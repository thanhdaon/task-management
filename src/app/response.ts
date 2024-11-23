import { Context } from "hono";

export function responseBadRequest(c: Context, error: string) {
  return c.json({ code: 400, error }, 400);
}

export function responseCreated<T>(c: Context, data: T) {
  return c.json({ code: 201, data }, 201);
}

export function responseOk<T>(c: Context, data: T) {
  return c.json({ code: 200, data }, 200);
}
