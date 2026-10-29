import { get } from '../db/index.js';
import {HttpError} from '../utils/httpError.js';
import {hashSessionToken} from '../utils/tokens.js'

const SESSION_USER_QUERY = `
    SELECT  u.id, u.email,
            u.first_name AS firstName,
            u.last_name AS lastName,
            u.color,
            u.created_at AS createdAt,
            s.expires_at AS expiresAt
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
`;

export async function requireAuth(req, res, next) {
    const token = req.cookies?.token;

    if (typeof token !== 'string' || token.length === 0) {
        next(new HttpError(401, 'Not authenticated'));
        return;
    }

    const row = await get(SESSION_USER_QUERY, [hashSessionToken(token)]);

    if (!row) {
        next(new HttpError(401, 'Not authenticated'));
        return;
    }

    const expiresAt = Date.parse(row.expiresAt);

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        next(new HttpError(401, 'Session expired'));
        return;
    }

    delete row.expiresAt;
    req.user = row;
    next();
}
