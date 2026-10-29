import { HttpError } from "../utils/httpError.js";

export function notFoundHandler(req, res) {
    res.status(404).json({ error: 'Not found'});
}

export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof HttpError) {
        res.status(err.status).json({error: err.message});
        return;
    }

    if (err?.type === 'entity.parse.failed') {
        res.status(400).json({error: 'Invalid JSON body'});
        return;
    }

    if(err?.code?.startsWith('SQLITE_CONSTRAINT') && /users\.email/i.test(err.message)) {
        res.status(409).json({error: 'Email already registered'});
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server Error'});
}
