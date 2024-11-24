import type { Hook } from "@hono/zod-openapi";
import { type ErrorHandler, type NotFoundHandler } from "hono";
import { StatusCode } from "hono/utils/http-status";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "~/app/http-status-codes";
import { HttpStatusPhrases } from "~/app/http-status-phrases";

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      error: `${HttpStatusPhrases.NOT_FOUND} - ${c.req.path}`,
    },
    NOT_FOUND
  );
};

export const onError: ErrorHandler = (err, c) => {
  const currentStatus =
    "status" in err ? err.status : c.newResponse(null).status;

  const statusCode =
    currentStatus !== OK ? currentStatus : INTERNAL_SERVER_ERROR;

  return c.json({ error: err.message }, statusCode as StatusCode);
};

export const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues
          .map(({ path, message }) => {
            return `Field ${path.join(".")} is invalid. ${message}`;
          })
          .join(", "),
      },
      BAD_REQUEST
    );
  }
};
