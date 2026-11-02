import { Router } from 'express';
import { all, get, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireBandMember } from '../middleware/bandAccess.js';
import { requireChannelAccess } from '../middleware/channelAccess.js';
import { HttpError } from '../utils/httpError.js';
import { isValidMessageContent } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

const CHANNEL_FIELDS = `
    c.id,
    c.band_id AS bandId,
    c.type,
    c.event_id AS eventId,
    c.name,
    c.created_by AS createdBy,
    c.created_at AS createdAt
`;

const MESSAGE_FIELDS = `
    m.id,
    m.channel_id AS channelId,
    m.user_id AS userId,
    m.content,
    m.created_at AS createdAt,
    u.id AS authorId,
    u.first_name AS authorFirstName,
    u.last_name AS authorLastName,
    u.color AS authorColor
`;

function toMessage(row) {
    const {
        authorId,
        authorFirstName,
        authorLastName,
        authorColor,
        ...message
    } = row;

    return {
        ...message,
        author: {
            id: authorId,
            firstName: authorFirstName,
            lastName: authorLastName,
            color: authorColor,
        },
    };
}

router.get('/bands/:bandId/channels', requireBandMember, async (req, res) => {
    const role = req.bandMembership.role;

    const channels = await all(
        `SELECT ${CHANNEL_FIELDS}
        FROM channels c
        WHERE c.band_id = ?
        AND (
            c.type = 'event)'
            OR ? IN ('owner', 'admin')
            OR EXISTS (
                SELECT 1
                FROM channel_members cm
                WHERE cm.channel_id = c.id AND cm.user_id = ?
            )
        )
        ORDER BY c.id`,
        [req.bandId, role, req.user.id]
    );
    res.json({ channels });
});

router.get('/channels/:channelId/messages', requireChannelAccess, async (req, res) => {
    const rows = await all(
        `SELECT ${MESSAGE_FIELDS}
         FROM messages m
         JOIN users u ON u.id = m.user_id
         WHERE m.channel_id = ?
         ORDER BY m.created_at, m.id`,
        [req.channel.id]
    );

    res.json({ messages: rows.map(toMessage) });
});

router.post('/channels/:channelId/messages', requireChannelAccess, async (req, res) => {
    const content = req.body?.content;

    if (!isValidMessageContent(content)) {
        throw new HttpError(400, 'Message content required');
    }

    const result = await run(
        'INSERT INTO messages (channel_id, user_id, content) VALUES (?, ?, ?)',
        [req.channel.id, req.user.id, content.trim()]
    );

    const row = await get(
        `SELECT ${MESSAGE_FIELDS}
         FROM messages m
         JOIN users u ON u.id = m.user_id
         WHERE m.id = ?`,
        [result.lastID]
    );

    res.status(201).json({ message: toMessage(row) });
});

export default router;
