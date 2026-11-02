import { get } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';

function parseChannelId(value) {
    const channelId = Number(value);
    if (!Number.isInteger(channelId) || channelId <= 0) {
        throw new HttpError(400, 'Invalid channel id');
    }
    return channelId;
}

export async function requireChannelAccess(req, res, next) {
    try {
        const channelId = parseChannelId(req.params.channelId);

        const channel = await get(
            `SELECT id, band_id AS bandId, type, event_id AS eventId,
                    name, created_by AS createdBy, created_at AS createdAt
             FROM channels
             WHERE id = ?`,
            [channelId]
        );

        if (!channel) {
            throw new HttpError(404, 'Channel not found');
        }

        const membership = await get(
            `SELECT band_id AS bandId, user_id AS userId, role, created_at AS createdAt
             FROM band_memberships
             WHERE band_id = ? AND user_id = ?`,
            [channel.bandId, req.user.id]
        );

        if (!membership) {
            throw new HttpError(404, 'Channel not found');
        }

        const isBandAdmin = membership.role === 'owner' || membership.role === 'admin';

        let hasAccess = isBandAdmin || channel.type === 'event';

        if (!hasAccess && channel.type === 'custom') {
            const channelMember = await get(
                'SELECT 1 AS ok FROM channel_members WHERE channel_id = ? AND user_id = ?',
                [channel.id, req.user.id]
            );
            hasAccess = Boolean(channelMember);
        }

        if (!hasAccess) {
            throw new HttpError(403, 'Channel access denied');
        }

        req.channel = channel;
        req.bandId = channel.bandId;
        req.bandMembership = membership;
        next();
    } catch (err) {
        next(err);
    }
}
