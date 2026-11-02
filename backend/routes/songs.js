import { Router } from 'express';
import { all, get, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireBandMember, requireBandManager } from '../middleware/bandAccess.js';
import { HttpError } from '../utils/httpError.js';
import { isNonEmptyString, isNonNegativeInteger } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

const SONG_FIELDS = `id, band_id AS bandId, name, interpret, duration_seconds AS durationSeconds, bpm, created_at AS createdAt`;

function parseSongId(value) {
    const songId = Number(value);
    if(!Number.isInteger(songId) || songId <= 0) {
        throw new HttpError(400, 'Invalid song id')
    }
    return songId;
}

function parseSongPayload(body, { useDefaults = false} = {}) {
    const data = body || {};
    if(!isNonEmptyString(data.name, 255)) {
        throw new HttpError(400, 'Song name required');
    }

    const name = data.name.trim();

    let interpret = data.interpret;
    if (interpret === undefined && useDefaults) {
        interpret = '';
    }
    if (typeof interpret !== 'string') {
        throw new HttpError(400, 'Interpret must be a string');
    }
    interpret = interpret.trim();
    if (interpret.length > 255) {
        throw new HttpError(400, 'Interpret must be at most 255 characters');
    }

    let durationSeconds = data.durationSeconds;
    if (durationSeconds === undefined && useDefaults) {
        durationSeconds = 0;
    }
    if (!isNonNegativeInteger(durationSeconds)) {
        throw new HttpError(400, 'Duration must be a non-negative integer');
    }

    let bpm = data.bpm;
    if (bpm === undefined && useDefaults) {
        bpm = 0;
    }
    if (!isNonNegativeInteger(bpm)) {
        throw new HttpError(400, 'BPM must be a non-negative integer');
    }

    return { name, interpret, durationSeconds, bpm};
}

async function loadSongAccess(req, res, next) {
    try {
        const songId = parseSongId(req.params.songId);
        const song = await get(`SELECT ${SONG_FIELDS} FROM songs WHERE id = ?`, [songId]);

        if (!song) {
            next(new HttpError(404, 'Song not found'));
            return;
        }

        const membership = await get(`
            SELECT band_id AS bandId, user_id as userId, role, created_at AS createdAt FROM band_memberships WHERE band_id = ? AND user_id = ?`,
            [song.bandId, req.user.id]
        );

        if(!membership) {
            next(new HttpError(404, 'Membership not found'));
            return;
        }

        req.song = song;
        req.bandId = song.bandId;
        req.bandMembership = membership;
        next();
    } catch (err) {
        next(err)
    }

}

router.get('/bands/:bandId/songs', requireBandMember, async (req, res) => {
    const songs = await all(`SELECT ${SONG_FIELDS} FROM songs WHERE band_id = ? ORDER BY id`, [req.bandId]);
    res.json({ songs });
});

router.post('/bands/:bandId/songs', requireBandMember, requireBandManager, async (req, res) => {
    const payload = parseSongPayload(req.body, {useDefaults: true });

    const result = await run(`
        INSERT INTO songs (band_id, name, interpret, duration_seconds, bpm)
        VALUES (?, ?, ?, ?, ?)`,
        [req.bandId, payload.name, payload.interpret, payload.durationSeconds, payload.bpm]
    );

    const song = await get(`SELECT ${SONG_FIELDS} FROM songs WHERE id = ?`, [result.lastID]);
    res.status(201).json({ song })
});

router.put('/songs/:songId', loadSongAccess, requireBandManager, async (req, res) => {
    const payload = parseSongPayload(req.body);

    await run(`
        UPDATE songs SET name = ?, interpret = ?, duration_seconds = ?, bpm = ? WHERE id = ?`,
        [payload.name, payload.interpret, payload.durationSeconds, payload.bpm, req.song.id]
    );
    const song = await get(`SELECT ${SONG_FIELDS} FROM songs WHERE id = ?`, [req.song.id]);
    res.json({ song });
});

router.delete('/songs/:songId', loadSongAccess, requireBandManager, async (req, res) => {
    await run ('DELETE FROM songs WHERE id = ?', [req.song.id]);
    res.status(204).end();
});

export default router;

