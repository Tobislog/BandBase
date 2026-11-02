import { Router } from 'express';
import { all, get, run, withTransaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireBandMember, requireBandManager } from '../middleware/bandAccess.js';
import { HttpError } from '../utils/httpError.js';
import { isNonEmptyString, isValidCategory, isValidDate, isValidTime } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

const EVENT_FIELDS = `
    e.id,
    e.band_id AS bandId,
    e.setlist_id AS setlistId,
    c.id AS channelId,
    e.title,
    e.date,
    e.description,
    e.category,
    e.meetup_time AS meetupTime,
    e.start_time AS startTime,
    e.end_time AS endTime,
    e.created_at AS createdAt
`;

const EVENT_SELECT = `
    SELECT ${EVENT_FIELDS}
    FROM events e
    LEFT JOIN channels c ON c.event_id = e.id
`;

function parseEventId(value) {
    const eventId = Number(value);
    if (!Number.isInteger(eventId) || eventId <= 0) {
        throw new HttpError(400, 'Invalid event id');
    }
    return eventId;
}

function parseOptionalTime(value) {
    if (value === undefined || value === null || value === '') return null;
    if (!isValidTime(value)) {
        throw new HttpError(400, 'Invalid time');
    }
    return value;
}

function parseEventPayload(body, { useDefaults = false } = {}) {
    const data = body || {};

    if (!isNonEmptyString(data.title, 255)) {
        throw new HttpError(400, 'Event title required');
    }
    const title = data.title.trim();

    if (!isValidDate(data.date)) {
        throw new HttpError(400, 'Invalid event date');
    }

    if (!isValidTime(data.startTime)) {
        throw new HttpError(400, 'Invalid start time');
    }

    const endTime = parseOptionalTime(data.endTime);
    const meetupTime = parseOptionalTime(data.meetupTime);

    let description = data.description;
    if (description === undefined && useDefaults) description = '';
    if (typeof description !== 'string') {
        throw new HttpError(400, 'Description must be a string');
    }
    description = description.trim();
    if (description.length > 2000) {
        throw new HttpError(400, 'Description too long');
    }

    let category = data.category;
    if (category === undefined && useDefaults) category = 'other';
    if (!isValidCategory(category)) {
        throw new HttpError(400, 'Invalid event category');
    }

    let setlistId = data.setlistId;
    if (setlistId === undefined || setlistId === null || setlistId === '') {
        setlistId = null;
    } else {
        setlistId = Number(setlistId);
        if (!Number.isInteger(setlistId) || setlistId <= 0) {
            throw new HttpError(400, 'Invalid setlist id');
        }
    }

    return {
        title,
        date: data.date,
        description,
        category,
        meetupTime,
        startTime: data.startTime,
        endTime,
        setlistId,
    };
}

async function assertSetlistInBand(executor, setlistId, bandId) {
    if (setlistId === null) return;

    const setlist = await executor.get(
        'SELECT id, band_id AS bandId FROM setlists WHERE id = ?',
        [setlistId]
    );

    if (!setlist || setlist.bandId !== bandId) {
        throw new HttpError(404, 'Setlist not found');
    }
}

async function loadEventAccess(req, res, next) {
    try {
        const eventId = parseEventId(req.params.eventId);
        const event = await get(
            'SELECT id, band_id AS bandId FROM events WHERE id = ?',
            [eventId]
        );

        if (!event) {
            next(new HttpError(404, 'Event not found'));
            return;
        }

        const membership = await get(
            `SELECT band_id AS bandId, user_id AS userId, role, created_at AS createdAt
             FROM band_memberships
             WHERE band_id = ? AND user_id = ?`,
            [event.bandId, req.user.id]
        );

        if (!membership) {
            next(new HttpError(404, 'Event not found'));
            return;
        }

        req.event = event;
        req.bandId = event.bandId;
        req.bandMembership = membership;
        next();
    } catch (err) {
        next(err);
    }
}

router.get('/bands/:bandId/events', requireBandMember, async (req, res) => {
    const events = await all(
        `${EVENT_SELECT}
         WHERE e.band_id = ?
         ORDER BY e.date, e.start_time, e.id`,
        [req.bandId]
    );

    res.json({ events });
});

router.post(
    '/bands/:bandId/events',
    requireBandMember,
    requireBandManager,
    async (req, res) => {
        const payload = parseEventPayload(req.body, { useDefaults: true });

        const event = await withTransaction(async (tx) => {
            await assertSetlistInBand(tx, payload.setlistId, req.bandId);

            const inserted = await tx.run(
                `INSERT INTO events
                    (band_id, setlist_id, title, date, description, category,
                     meetup_time, start_time, end_time)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.bandId,
                    payload.setlistId,
                    payload.title,
                    payload.date,
                    payload.description,
                    payload.category,
                    payload.meetupTime,
                    payload.startTime,
                    payload.endTime,
                ]
            );

            await tx.run(
                `INSERT INTO channels (band_id, type, event_id, name, created_by)
                 VALUES (?, 'event', ?, ?, ?)`,
                [req.bandId, inserted.lastID, payload.title, req.user.id]
            );

            return tx.get(`${EVENT_SELECT} WHERE e.id = ?`, [inserted.lastID]);
        });

        res.status(201).json({ event });
    }
);

router.put('/events/:eventId', loadEventAccess, requireBandManager, async (req, res) => {
    const payload = parseEventPayload(req.body);

    const event = await withTransaction(async (tx) => {
        await assertSetlistInBand(tx, payload.setlistId, req.event.bandId);

        await tx.run(
            `UPDATE events
             SET setlist_id = ?, title = ?, date = ?, description = ?,
                 category = ?, meetup_time = ?, start_time = ?, end_time = ?
             WHERE id = ?`,
            [
                payload.setlistId,
                payload.title,
                payload.date,
                payload.description,
                payload.category,
                payload.meetupTime,
                payload.startTime,
                payload.endTime,
                req.event.id,
            ]
        );

        await tx.run(
            'UPDATE channels SET name = ? WHERE event_id = ?',
            [payload.title, req.event.id]
        );

        return tx.get(`${EVENT_SELECT} WHERE e.id = ?`, [req.event.id]);
    });

    res.json({ event });
});

router.delete('/events/:eventId', loadEventAccess, requireBandManager, async (req, res) => {
    await run('DELETE FROM events WHERE id = ?', [req.event.id]);
    res.status(204).end();
});

export default router;
