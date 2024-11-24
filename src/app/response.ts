import { Context } from "hono";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  OK,
  UNAUTHORIZED,
} from "~/app/http-status-codes";
import { HttpStatusPhrases } from "./http-status-phrases";

export function responseBadRequest(c: Context, error: string) {
  return c.json({ code: BAD_REQUEST, error }, BAD_REQUEST);
}

export function responseCreated<T>(c: Context, data: T) {
  return c.json({ code: CREATED, data }, CREATED);
}

export function responseOk<T>(c: Context, data: T) {
  return c.json({ code: OK, data }, OK);
}

export function responseUnthenticated(c: Context) {
  return c.json(
    { code: UNAUTHORIZED, error: HttpStatusPhrases.UNAUTHORIZED },
    UNAUTHORIZED
  );
}

export function responseForbidden(c: Context) {
  return c.json(
    { code: FORBIDDEN, error: HttpStatusPhrases.FORBIDDEN },
    FORBIDDEN
  );
}
