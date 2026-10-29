import { get } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';

const MEMBERSHIP_QUERY = `
    SELECT band_id AS bandId, user_id AS userId, role, created_at AS createdAt
    FROM band_memberships
    WHERE band_id = ? AND user_id = ?
`;
function parseBandId(value) {
    const bandId = Number(value);
    if (!Number.isInteger(bandId) || bandId <= 0) {
        throw new HttpError(400, 'Invalid band id');
    }
    return bandId;
}

export async function requireBandMember(req, res, next) {
    try {
        const bandId = parseBandId(req.params.bandId);
        const membership = await get(MEMBERSHIP_QUERY, [bandId, req.user.id]);

        if (!membership) {
            next(new HttpError(403, 'Band access denied'));
            return;
        }

        req.bandId = bandId;
        req.bandMembership = membership;
        next();
    } catch (err) {
        next(err);
    }
}

export function requireBandManager(req, res, next) {
    const role = req.bandMembership?.role;

    if(!['owner', 'admin', 'moderator'].includes(role)) {
        next(new HttpError(403, 'Band manager permission required'));
        return;
    }

    next();
}

export function requireRoleManager(req, res, next) {
    const role = req.bandMembership?.role;

    if(!['owner', 'admin'].includes(role)){
        next(new HttpError(403, 'Role Manager permission required'));
        return;
    }
    next();
}
