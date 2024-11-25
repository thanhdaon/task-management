import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, } from "../app/http-status-codes.js";
import { HttpStatusPhrases } from "../app/http-status-phrases.js";
export const notFound = (c) => {
    return c.json({
        error: `${HttpStatusPhrases.NOT_FOUND} - ${c.req.path}`,
    }, NOT_FOUND);
};
export const onError = (err, c) => {
    const currentStatus = "status" in err ? err.status : c.newResponse(null).status;
    const statusCode = currentStatus !== OK ? currentStatus : INTERNAL_SERVER_ERROR;
    return c.json({ error: err.message }, statusCode);
};
export const defaultHook = (result, c) => {
    if (!result.success) {
        return c.json({
            error: result.error.issues
                .map(({ path, message }) => {
                return `Field ${path.join(".")} is invalid. ${message}`;
            })
                .join(", "),
        }, BAD_REQUEST);
    }
};
