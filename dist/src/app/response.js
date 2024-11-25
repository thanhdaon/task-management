import { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED, } from "../app/http-status-codes.js";
import { HttpStatusPhrases } from "./http-status-phrases.js";
export function responseBadRequest(c, error) {
    return c.json({ code: BAD_REQUEST, error }, BAD_REQUEST);
}
export function responseCreated(c, data) {
    return c.json({ code: CREATED, data }, CREATED);
}
export function responseOk(c, data) {
    return c.json({ code: OK, data }, OK);
}
export function responseOkMessage(c, message) {
    return c.json({ code: OK, message }, OK);
}
export function responseNotFound(c, error) {
    return c.json({ code: NOT_FOUND, error }, NOT_FOUND);
}
export function responseUnthenticated(c) {
    return c.json({ code: UNAUTHORIZED, error: HttpStatusPhrases.UNAUTHORIZED }, UNAUTHORIZED);
}
export function responseForbidden(c) {
    return c.json({ code: FORBIDDEN, error: HttpStatusPhrases.FORBIDDEN }, FORBIDDEN);
}
