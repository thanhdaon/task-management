import { Context } from "hono";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
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

export function responseOkMessage(c: Context, message: string) {
  return c.json({ code: OK, message }, OK);
}

export function responseNotFound(c: Context, error: string) {
  return c.json({ code: NOT_FOUND, error }, NOT_FOUND);
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
