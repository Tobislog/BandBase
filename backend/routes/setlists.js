import { Router } from 'express';
import { all, get, run, withTransaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { requireBandMember, requireBandManager } from '../middleware/bandAccess.js';
import { HttpError } from '../utils/httpError.js';
import { isNonEmptyString, isValidTime, isValidItemType, isNonNegativeInteger } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

const SETLIST_FIELDS = `id, band_id AS bandId, name, stage_time AS stageTime, created_at AS createdAt`;
const ITEM_FIELDS = `i.id, i.setlist_id AS setlistId, i.type, i.song_id AS songId, i.text, i.duration_seconds AS durationSeconds, i.position, i.created_at AS createdAt`;
const NOTE_MAX_LENGTH = 2000;

function parseSetlistId(value) {
    const setlistId = Number(value);
    if(!Number.isInteger(setlistId) || setlistId <= 0) {
        throw new HttpError(400, 'Invalid setlist id');
    }
    return setlistId;   
}

function parseItemId(value) {
    const itemId = Number(value);
    if(!Number.isInteger(itemId) || itemId <= 0) {
        throw new HttpError(400, 'Invalid item id');
    }
    return itemId;
}

function parseSetlistPayload(body, { useDefaults = false} = {}) {
    const data = body || {};
    
    let name = data.name;
    if (name === undefined && useDefaults) {
        name = 'Neue Setlist';
    }
    if(!isNonEmptyString(name, 255)) {
        throw new HttpError(400, 'Setlist name required')
    }

    let stageTime = data.stageTime ?? null;
    if (stageTime === '') {
        stageTime = null;
    }
    if (stageTime !== null && !isValidTime(stageTime)) {
        throw new HttpError(400, 'Stagetime is not a valid time');
    }

    return {name, stageTime};
}

function parseItemPayload(body) {
    const data = body || {};

    if(!isValidItemType(data.type)) {
        throw new HttpError(400, 'Invalid item type');
    }

    if(data.type === 'song') {
        const songId = Number(data.songId);
        if(!Number.isInteger(songId) || songId <= 0) {
            throw new HttpError(400, 'Invalid song id');
        }
        return { type: 'song', songId, text: null, durationSeconds: null};
    }
    if (data.type === 'note') {
        if (!isNonEmptyString(data.text, NOTE_MAX_LENGTH)) {
            throw new HttpError(400, 'Note text required');
        }
        return {type: 'note', songId: null, text: data.text.trim(), durationSeconds: null}
    }
    if (!isNonNegativeInteger(data.durationSeconds)) {
        throw new HttpError(400, 'Duration must be a non-negative integer');
    }
    return { type: 'pause', songId: null, text: null, durationSeconds: data.durationSeconds};
}


async function loadSetlistAccess(req, res, next) {
    try {
        const setlistId = parseSetlistId(req.params.setlistId);
        const setlist = await get(`SELECT ${SETLIST_FIELDS} FROM setlists WHERE id = ?`, [setlistId])
        
        if(!setlist) {
            next(new HttpError(404, 'Setlist not found'));
            return;
        }

        const membership = await get(`
            SELECT band_id AS bandId, user_id AS userId, role, created_at AS createdAt
            FROM band_memberships WHERE band_id = ? AND user_id = ?`,
            [setlist.bandId, req.user.id]
        );

        if(!membership) {
            next(new HttpError(404, 'Membership not found'));
            return;
        }

        req.setlist = setlist;
        req.bandId = setlist.bandId;
        req.bandMembership = membership;
        next();
    } catch (err) {
        next(err);
    }
}

async function loadItemAccess(req, res, next) {
    try {
        const itemId = parseItemId(req.params.itemId);
        const item = await get(`SELECT ${ITEM_FIELDS} FROM setlist_items i WHERE i.id = ? AND i.setlist_id = ?`,
            [itemId, req.setlist.id]
        );

        if(!item) {
            next(new HttpError(404, 'Item not found'));
            return;
        }

        req.item = item;
        next();
    } catch (err) {
        next(err);
    }
}

async function assertSongInBand(songId, bandId) {
    const song = await get('SELECT id, band_id AS bandId FROM songs WHERE id = ?', [songId]);
    if (!song || song.bandId !== bandId) {
        throw new HttpError(404, 'Song not found');
    }
}

async function getItemsForSetlist(setlistId) {
    return all(`SELECT ${ITEM_FIELDS} FROM setlist_items i WHERE i.setlist_id = ? ORDER BY i.position`, [setlistId]);
}

async function getSetlistWithItems (setlistId) {
    const setlist = await get(`SELECT ${SETLIST_FIELDS} FROM setlists WHERE id = ?`, [setlistId]);
    const items = await getItemsForSetlist(setlistId);
    return {...setlist, items};
}

async function renumberItems(tx, setlistId, orderedIds) {
    const offset = orderedIds.length + 1;
    await tx.run('UPDATE setlist_items SET position = position + ? WHERE setlist_id = ?', [offset, setlistId]);
    for (let index = 0; index < orderedIds.length; index += 1) {
        await tx.run('UPDATE setlist_items SET position = ? WHERE id = ? AND setlist_id = ?',
            [index + 1, orderedIds[index], setlistId]
        );
    }
}

router.get('/bands/:bandId/setlists', requireBandMember, async (req, res) => {
    const setlists = await all(`SELECT ${SETLIST_FIELDS} FROM setlists WHERE band_id = ? ORDER BY id`, [req.bandId]);
    if (setlists.length === 0 ) {
        res.json({setlists: [] });
        return 
    }
    const setlistIds = setlists.map((setlist) => setlist.id);
    const placeholders = setlistIds.map(() => '?').join(',');
    const items = await all(`SELECT ${ITEM_FIELDS} FROM setlist_items i WHERE i.setlist_id IN (${placeholders}) ORDER BY i.setlist_id, i.position`,
        setlistIds
    );

    const itemsBySetlistId = items.reduce((acc, item) => {
        (acc[item.setlistId] ??= []).push(item);
        return acc;
    }, {});
    
    res.json({ 
        setlists: setlists.map(setlist => ({ ...setlist, items: itemsBySetlistId[setlist.id] || [] })) 
    });
});

router.post('/bands/:bandId/setlists', requireBandMember, requireBandManager, async (req, res) => {
    const payload = parseSetlistPayload(req.body, {useDefaults: true});

    const result = await run(`
        INSERT INTO setlists (band_id, name, stage_time)
        VALUES (?, ?, ?)`,
        [req.bandId, payload.name, payload.stageTime]
    );
    const setlist = await getSetlistWithItems(result.lastID);
    res.status(201).json({ setlist })
})

router.put('/setlists/:setlistId', loadSetlistAccess, requireBandManager, async (req, res) => {
    const payload = parseSetlistPayload(req.body);

    await run(`
        UPDATE setlists SET name = ?, stage_time = ? WHERE id = ?`,
        [payload.name, payload.stageTime, req.setlist.id]
    );

    const setlist = await getSetlistWithItems(req.setlist.id);
    res.json({ setlist });
});

router.delete('/setlists/:setlistId', loadSetlistAccess, requireBandManager, async (req, res) => {
    await run('DELETE FROM setlists WHERE id = ?', [req.setlist.id]);
    res.status(204).end();
});

router.post('/setlists/:setlistId/items', loadSetlistAccess, requireBandManager, async (req, res) => {
    const payload = parseItemPayload(req.body);

    if(payload.type === 'song') {
        await assertSongInBand(payload.songId, req.setlist.bandId);
    }
    const item = await withTransaction(async (tx) => {
        const row = await tx.get('SELECT COALESCE(MAX(position), 0) + 1 AS position FROM setlist_items WHERE setlist_id = ?', [req.setlist.id]);
        const result = await tx.run('INSERT INTO setlist_items (setlist_id, type, song_id, text, duration_seconds, position) VALUES (?, ?, ?, ?, ?, ?)',
            [
                req.setlist.id,
                payload.type,
                payload.songId,
                payload.text,
                payload.durationSeconds,
                row.position,
            ]
        )
        return tx.get(`SELECT ${ITEM_FIELDS} FROM setlist_items i WHERE i.id = ?`, [result.lastID]);
    })
    res.status(201).json({ item })
});

router.put('/setlists/:setlistId/items/:itemId', loadSetlistAccess, loadItemAccess, requireBandManager, async (req, res) => {
    const payload = parseItemPayload(req.body);
    if(payload.type === 'song') {
        await assertSongInBand(payload.songId, req.setlist.bandId);
    }
    await run (`UPDATE setlist_items SET type = ?, song_id = ?, text = ?, duration_seconds = ? WHERE id = ? AND setlist_id = ?`,
        [
            payload.type,
            payload.songId,
            payload.text,
            payload.durationSeconds,
            req.item.id,
            req.setlist.id
        ]
    );
    const item = await get(`SELECT ${ITEM_FIELDS} FROM setlist_items i WHERE i.id = ?`, [req.item.id]);
    res.json({ item });
})

router.delete('/setlists/:setlistId/items/:itemId', loadSetlistAccess, loadItemAccess, requireBandManager, async (req, res) => {
    const items = await withTransaction(async(tx) => {
        await tx.run('DELETE FROM setlist_items WHERE id = ? AND setlist_id = ?', [req.item.id, req.setlist.id]);
        const remaining = await tx.all('SELECT id FROM setlist_items WHERE setlist_id = ? ORDER BY position', [req.setlist.id]);
        await renumberItems(tx, req.setlist.id, remaining.map((row) => row.id));
        return tx.all(`SELECT ${ITEM_FIELDS} FROM setlist_items i WHERE i.setlist_id = ? ORDER BY i.position`, [req.setlist.id]);
    });

    res.json({ items });
});

router.put('/setlists/:setlistId/reorder', loadSetlistAccess, requireBandManager, async (req, res) => {
    const itemIds = req.body?.itemIds;

    if(!Array.isArray(itemIds)) {
        throw new HttpError(400, 'itemIds must be an array');
    }
    if(itemIds.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw new HttpError(400, 'Invalid item id');
    }
    if (new Set(itemIds).size !== itemIds.length) {
        throw new HttpError(400, 'Duplicate item ids');
    }
    const items = await withTransaction(async(tx) => {
        const existing = await tx.all('SELECT id FROM setlist_items WHERE setlist_id = ? ORDER BY position', [req.setlist.id]);
        if (existing.length !== itemIds.length) {
            throw new HttpError(400, 'itemIds must contain exactly all setlist items');
        }
        const existingIds = new Set(existing.map((row) => row.id));
        if (itemIds.some((id) => !existingIds.has(id))) {
            throw new HttpError(400, 'itemIds must contain exactly all setlist items');
        }
        await renumberItems(tx, req.setlist.id, itemIds);
        return tx.all(`SELECT ${ITEM_FIELDS} FROM setlist_items i WHERE i.setlist_id = ? ORDER BY i.position`, [req.setlist.id]);
    });
    res.json ({ items });
})

export default router;
