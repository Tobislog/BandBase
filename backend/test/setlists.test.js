import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createTestContext, resetAuthData } from './helpers.js';

let ctx;

const ownerData = {
    email: 'owner@example.com',
    password: 'secret123',
    firstName: 'Ada',
    lastName: 'Lovelace',
    color: '#111111',
};

const memberData = {
    email: 'member@example.com',
    password: 'secret123',
    firstName: 'Grace',
    lastName: 'Hopper',
    color: '#222222',
};

const moderatorData = {
    email: 'moderator@example.com',
    password: 'secret123',
    firstName: 'Alan',
    lastName: 'Turing',
    color: '#333333',
};

const adminData = {
    email: 'admin@example.com',
    password: 'secret123',
    firstName: 'Edsger',
    lastName: 'Dijkstra',
    color: '#444444',
};

before(async () => {
    ctx = await createTestContext();
});

after(async () => {
    await ctx.cleanup();
});

beforeEach(async () => {
    await resetAuthData(ctx.db);
});

async function register(data) {
    const res = await request(ctx.app).post('/api/register').send(data);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body;
}

async function loginAs(data) {
    const agent = request.agent(ctx.app);
    const res = await agent.post('/api/login').send({
        email: data.email,
        password: data.password,
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return agent;
}

async function defaultBandId() {
    const band = await ctx.db.get("SELECT id FROM bands WHERE name = 'Band_01'");
    assert.ok(band);
    return band.id;
}

async function promote(bandId, userId, role) {
    await ctx.db.run(
        'UPDATE band_memberships SET role = ? WHERE band_id = ? AND user_id = ?',
        [role, bandId, userId]
    );
}

async function createBand(name, userId, role = 'owner') {
    const band = await ctx.db.run('INSERT INTO bands (name) VALUES (?)', [name]);
    await ctx.db.run(
        'INSERT INTO band_memberships (band_id, user_id, role) VALUES (?, ?, ?)',
        [band.lastID, userId, role]
    );
    return band.lastID;
}

async function createSong(agent, bandId, payload = {}) {
    const res = await agent
        .post(`/api/bands/${bandId}/songs`)
        .send({ name: 'Test Song', ...payload });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.song;
}

async function createSetlist(agent, bandId, payload = {}) {
    const res = await agent
        .post(`/api/bands/${bandId}/setlists`)
        .send({ name: 'Test Setlist', ...payload });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.setlist;
}

async function createItem(agent, setlistId, payload) {
    const res = await agent
        .post(`/api/setlists/${setlistId}/items`)
        .send(payload);
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.item;
}

async function getSetlistFromList(agent, bandId, setlistId) {
    const res = await agent.get(`/api/bands/${bandId}/setlists`);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return res.body.setlists.find((setlist) => setlist.id === setlistId);
}

test('setlist CRUD returns camelCase fields and empty items', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;

    const created = await agent
        .post(`/api/bands/${bandId}/setlists`)
        .send({ name: 'Set A', stageTime: '20:30' });

    assert.equal(created.status, 201, JSON.stringify(created.body));
    const setlist = created.body.setlist;
    assert.ok(Number.isInteger(setlist.id));
    assert.equal(setlist.bandId, bandId);
    assert.equal(setlist.name, 'Set A');
    assert.equal(setlist.stageTime, '20:30');
    assert.equal(typeof setlist.createdAt, 'string');
    assert.deepEqual(setlist.items, []);
    assert.equal(Object.hasOwn(setlist, 'stage_time'), false);

    const list = await agent.get(`/api/bands/${bandId}/setlists`);
    assert.equal(list.status, 200);
    assert.equal(list.body.setlists.length, 1);
    assert.deepEqual(list.body.setlists[0].items, []);

    const updated = await agent
        .put(`/api/setlists/${setlist.id}`)
        .send({ name: 'Set B', stageTime: '' });
    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    assert.equal(updated.body.setlist.name, 'Set B');
    assert.equal(updated.body.setlist.stageTime, null);
    assert.deepEqual(updated.body.setlist.items, []);

    const removed = await agent.delete(`/api/setlists/${setlist.id}`);
    assert.equal(removed.status, 204);

    const empty = await agent.get(`/api/bands/${bandId}/setlists`);
    assert.deepEqual(empty.body.setlists, []);

    const missing = await agent
        .put('/api/setlists/999999')
        .send({ name: 'Missing' });
    assert.equal(missing.status, 404);

    const malformed = await agent
        .put('/api/setlists/not-a-number')
        .send({ name: 'Malformed' });
    assert.equal(malformed.status, 400);
});

test('POST setlist applies defaults and rejects invalid payloads', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;

    const defaults = await agent.post(`/api/bands/${bandId}/setlists`).send({});
    assert.equal(defaults.status, 201, JSON.stringify(defaults.body));
    assert.equal(defaults.body.setlist.name, 'Neue Setlist');
    assert.equal(defaults.body.setlist.stageTime, null);

    const invalidStageTime = await agent
        .post(`/api/bands/${bandId}/setlists`)
        .send({ name: 'Invalid', stageTime: '25:00' });
    assert.equal(invalidStageTime.status, 400);

    const invalidName = await agent
        .post(`/api/bands/${bandId}/setlists`)
        .send({ name: '   ' });
    assert.equal(invalidName.status, 400);

    const setlistId = defaults.body.setlist.id;
    const missingName = await agent
        .put(`/api/setlists/${setlistId}`)
        .send({ stageTime: '20:00' });
    assert.equal(missingName.status, 400);

    const invalidUpdateStageTime = await agent
        .put(`/api/setlists/${setlistId}`)
        .send({ name: 'Invalid', stageTime: '99:99' });
    assert.equal(invalidUpdateStageTime.status, 400);
});

test('items can be created for all types and are ordered by position', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const song = await createSong(agent, bandId, { name: 'Item Song' });
    const setlist = await createSetlist(agent, bandId);

    const songItem = await createItem(agent, setlist.id, {
        type: 'song',
        songId: song.id,
    });
    assert.ok(Number.isInteger(songItem.id));
    assert.equal(songItem.setlistId, setlist.id);
    assert.equal(songItem.type, 'song');
    assert.equal(songItem.songId, song.id);
    assert.equal(songItem.text, null);
    assert.equal(songItem.durationSeconds, null);
    assert.equal(songItem.position, 1);
    assert.equal(typeof songItem.createdAt, 'string');
    assert.equal(Object.hasOwn(songItem, 'song_id'), false);

    const noteItem = await createItem(agent, setlist.id, {
        type: 'note',
        text: '  Intro  ',
    });
    assert.equal(noteItem.type, 'note');
    assert.equal(noteItem.songId, null);
    assert.equal(noteItem.text, 'Intro');
    assert.equal(noteItem.durationSeconds, null);
    assert.equal(noteItem.position, 2);

    const pauseItem = await createItem(agent, setlist.id, {
        type: 'pause',
        durationSeconds: 0,
    });
    assert.equal(pauseItem.type, 'pause');
    assert.equal(pauseItem.songId, null);
    assert.equal(pauseItem.text, null);
    assert.equal(pauseItem.durationSeconds, 0);
    assert.equal(pauseItem.position, 3);

    const loaded = await getSetlistFromList(agent, bandId, setlist.id);
    assert.deepEqual(
        loaded.items.map((item) => item.id),
        [songItem.id, noteItem.id, pauseItem.id]
    );
    assert.deepEqual(
        loaded.items.map((item) => item.position),
        [1, 2, 3]
    );
});

test('POST item rejects invalid type-dependent payloads', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const setlist = await createSetlist(agent, bandId);

    const invalidBodies = [
        {},
        { type: 'block' },
        { type: 'song' },
        { type: 'song', songId: 0 },
        { type: 'song', songId: -1 },
        { type: 'song', songId: 1.5 },
        { type: 'note' },
        { type: 'note', text: '   ' },
        { type: 'note', text: 123 },
        { type: 'pause' },
        { type: 'pause', durationSeconds: -1 },
        { type: 'pause', durationSeconds: 1.5 },
        { type: 'pause', durationSeconds: '60' },
    ];

    for (const body of invalidBodies) {
        const res = await agent
            .post(`/api/setlists/${setlist.id}/items`)
            .send(body);
        assert.equal(res.status, 400, JSON.stringify(body));
    }
});

test('song items must belong to the setlist band', async () => {
    const owner = await register(ownerData);
    const outsider = await register(memberData);
    const ownBandId = owner.membership.bandId;
    const foreignBandId = await createBand('Band_02', outsider.user.id);
    const ownerAgent = await loginAs(ownerData);
    const outsiderAgent = await loginAs(memberData);

    const foreignSong = await createSong(outsiderAgent, foreignBandId, {
        name: 'Foreign Song',
    });
    const setlist = await createSetlist(ownerAgent, ownBandId);

    const createForeign = await ownerAgent
        .post(`/api/setlists/${setlist.id}/items`)
        .send({ type: 'song', songId: foreignSong.id });
    assert.equal(createForeign.status, 404);

    const missingSong = await ownerAgent
        .post(`/api/setlists/${setlist.id}/items`)
        .send({ type: 'song', songId: 999999 });
    assert.equal(missingSong.status, 404);

    const note = await createItem(ownerAgent, setlist.id, {
        type: 'note',
        text: 'Keep me',
    });
    const updateForeign = await ownerAgent
        .put(`/api/setlists/${setlist.id}/items/${note.id}`)
        .send({ type: 'song', songId: foreignSong.id });
    assert.equal(updateForeign.status, 404);

    const loaded = await getSetlistFromList(ownerAgent, ownBandId, setlist.id);
    assert.deepEqual(loaded.items.map((item) => item.id), [note.id]);
    assert.equal(loaded.items[0].type, 'note');
});

test('PUT item can change its type and rejects items from other setlists', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const song = await createSong(agent, bandId);
    const setlist = await createSetlist(agent, bandId);
    const note = await createItem(agent, setlist.id, {
        type: 'note',
        text: 'Note',
    });

    const toPause = await agent
        .put(`/api/setlists/${setlist.id}/items/${note.id}`)
        .send({ type: 'pause', durationSeconds: 45 });
    assert.equal(toPause.status, 200, JSON.stringify(toPause.body));
    assert.equal(toPause.body.item.type, 'pause');
    assert.equal(toPause.body.item.songId, null);
    assert.equal(toPause.body.item.text, null);
    assert.equal(toPause.body.item.durationSeconds, 45);

    const toSong = await agent
        .put(`/api/setlists/${setlist.id}/items/${note.id}`)
        .send({ type: 'song', songId: song.id });
    assert.equal(toSong.status, 200, JSON.stringify(toSong.body));
    assert.equal(toSong.body.item.type, 'song');
    assert.equal(toSong.body.item.songId, song.id);
    assert.equal(toSong.body.item.text, null);
    assert.equal(toSong.body.item.durationSeconds, null);

    const toNote = await agent
        .put(`/api/setlists/${setlist.id}/items/${note.id}`)
        .send({ type: 'note', text: 'Changed' });
    assert.equal(toNote.status, 200, JSON.stringify(toNote.body));
    assert.equal(toNote.body.item.type, 'note');
    assert.equal(toNote.body.item.text, 'Changed');

    const otherSetlist = await createSetlist(agent, bandId, { name: 'Other' });
    const otherItem = await createItem(agent, otherSetlist.id, {
        type: 'note',
        text: 'Other item',
    });
    const wrongSetlist = await agent
        .put(`/api/setlists/${setlist.id}/items/${otherItem.id}`)
        .send({ type: 'note', text: 'Nope' });
    assert.equal(wrongSetlist.status, 404);

    const missingItem = await agent
        .put(`/api/setlists/${setlist.id}/items/999999`)
        .send({ type: 'note', text: 'Missing' });
    assert.equal(missingItem.status, 404);
});

test('DELETE item renumbers remaining positions from 1 to n', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const setlist = await createSetlist(agent, bandId);

    const first = await createItem(agent, setlist.id, { type: 'note', text: 'First' });
    const second = await createItem(agent, setlist.id, { type: 'pause', durationSeconds: 10 });
    const third = await createItem(agent, setlist.id, { type: 'note', text: 'Third' });

    const removedMiddle = await agent.delete(
        `/api/setlists/${setlist.id}/items/${second.id}`
    );
    assert.equal(removedMiddle.status, 200, JSON.stringify(removedMiddle.body));
    assert.deepEqual(
        removedMiddle.body.items.map((item) => item.id),
        [first.id, third.id]
    );
    assert.deepEqual(
        removedMiddle.body.items.map((item) => item.position),
        [1, 2]
    );

    const removedFirst = await agent.delete(
        `/api/setlists/${setlist.id}/items/${first.id}`
    );
    assert.equal(removedFirst.status, 200, JSON.stringify(removedFirst.body));
    assert.deepEqual(removedFirst.body.items.map((item) => item.id), [third.id]);
    assert.deepEqual(removedFirst.body.items.map((item) => item.position), [1]);

    const removedLast = await agent.delete(
        `/api/setlists/${setlist.id}/items/${third.id}`
    );
    assert.equal(removedLast.status, 200, JSON.stringify(removedLast.body));
    assert.deepEqual(removedLast.body.items, []);

    const loaded = await getSetlistFromList(agent, bandId, setlist.id);
    assert.deepEqual(loaded.items, []);
});

test('reorder validates the full item id list and assigns positions', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const setlist = await createSetlist(agent, bandId);

    const first = await createItem(agent, setlist.id, { type: 'note', text: 'First' });
    const second = await createItem(agent, setlist.id, { type: 'note', text: 'Second' });
    const third = await createItem(agent, setlist.id, { type: 'note', text: 'Third' });

    const reordered = await agent
        .put(`/api/setlists/${setlist.id}/reorder`)
        .send({ itemIds: [third.id, first.id, second.id] });
    assert.equal(reordered.status, 200, JSON.stringify(reordered.body));
    assert.deepEqual(
        reordered.body.items.map((item) => item.id),
        [third.id, first.id, second.id]
    );
    assert.deepEqual(
        reordered.body.items.map((item) => item.position),
        [1, 2, 3]
    );

    const loaded = await getSetlistFromList(agent, bandId, setlist.id);
    assert.deepEqual(
        loaded.items.map((item) => item.id),
        [third.id, first.id, second.id]
    );

    const otherSetlist = await createSetlist(agent, bandId, { name: 'Other' });
    const foreignItem = await createItem(agent, otherSetlist.id, {
        type: 'note',
        text: 'Foreign',
    });

    const invalidBodies = [
        {},
        { itemIds: 'nope' },
        { itemIds: [third.id, first.id] },
        { itemIds: [third.id, first.id, second.id, 999999] },
        { itemIds: [third.id, third.id, first.id] },
        { itemIds: [third.id, first.id, '2'] },
        { itemIds: [third.id, first.id, 0] },
        { itemIds: [third.id, first.id, foreignItem.id] },
    ];

    for (const body of invalidBodies) {
        const res = await agent
            .put(`/api/setlists/${setlist.id}/reorder`)
            .send(body);
        assert.equal(res.status, 400, JSON.stringify(body));
    }

    const emptySetlist = await createSetlist(agent, bandId, { name: 'Empty' });
    const emptyReorder = await agent
        .put(`/api/setlists/${emptySetlist.id}/reorder`)
        .send({ itemIds: [] });
    assert.equal(emptyReorder.status, 200, JSON.stringify(emptyReorder.body));
    assert.deepEqual(emptyReorder.body.items, []);
});

test('members can read but cannot modify setlists or items', async () => {
    const owner = await register(ownerData);
    await register(memberData);
    const bandId = owner.membership.bandId;
    const ownerAgent = await loginAs(ownerData);
    const memberAgent = await loginAs(memberData);

    const setlist = await createSetlist(ownerAgent, bandId);
    const item = await createItem(ownerAgent, setlist.id, {
        type: 'note',
        text: 'Read only',
    });

    const read = await memberAgent.get(`/api/bands/${bandId}/setlists`);
    assert.equal(read.status, 200);
    assert.equal(read.body.setlists.length, 1);

    const createSetlistRes = await memberAgent
        .post(`/api/bands/${bandId}/setlists`)
        .send({ name: 'Nope' });
    assert.equal(createSetlistRes.status, 403);

    const updateSetlistRes = await memberAgent
        .put(`/api/setlists/${setlist.id}`)
        .send({ name: 'Nope' });
    assert.equal(updateSetlistRes.status, 403);

    const deleteSetlistRes = await memberAgent.delete(`/api/setlists/${setlist.id}`);
    assert.equal(deleteSetlistRes.status, 403);

    const createItemRes = await memberAgent
        .post(`/api/setlists/${setlist.id}/items`)
        .send({ type: 'note', text: 'Nope' });
    assert.equal(createItemRes.status, 403);

    const updateItemRes = await memberAgent
        .put(`/api/setlists/${setlist.id}/items/${item.id}`)
        .send({ type: 'note', text: 'Nope' });
    assert.equal(updateItemRes.status, 403);

    const deleteItemRes = await memberAgent.delete(
        `/api/setlists/${setlist.id}/items/${item.id}`
    );
    assert.equal(deleteItemRes.status, 403);

    const reorderRes = await memberAgent
        .put(`/api/setlists/${setlist.id}/reorder`)
        .send({ itemIds: [item.id] });
    assert.equal(reorderRes.status, 403);

    const loaded = await getSetlistFromList(ownerAgent, bandId, setlist.id);
    assert.deepEqual(loaded.items.map((entry) => entry.id), [item.id]);
    assert.equal(loaded.items[0].text, 'Read only');
});

test('moderators and admins can manage setlists and items', async () => {
    const owner = await register(ownerData);
    const moderator = await register(moderatorData);
    const admin = await register(adminData);
    const bandId = owner.membership.bandId;

    await promote(bandId, moderator.user.id, 'moderator');
    await promote(bandId, admin.user.id, 'admin');

    const moderatorAgent = await loginAs(moderatorData);
    const adminAgent = await loginAs(adminData);

    const created = await moderatorAgent
        .post(`/api/bands/${bandId}/setlists`)
        .send({ name: 'Mod Setlist' });
    assert.equal(created.status, 201);

    const setlistId = created.body.setlist.id;
    const item = await createItem(moderatorAgent, setlistId, {
        type: 'note',
        text: 'Mod note',
    });

    const updated = await adminAgent
        .put(`/api/setlists/${setlistId}`)
        .send({ name: 'Admin Setlist', stageTime: '19:00' });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.setlist.name, 'Admin Setlist');

    const reordered = await adminAgent
        .put(`/api/setlists/${setlistId}/reorder`)
        .send({ itemIds: [item.id] });
    assert.equal(reordered.status, 200);

    const removed = await moderatorAgent.delete(`/api/setlists/${setlistId}`);
    assert.equal(removed.status, 204);
});

test('deleting a setlist cascades items and clears event references', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const setlist = await createSetlist(agent, bandId, { name: 'Gig Setlist' });

    await createItem(agent, setlist.id, { type: 'note', text: 'One' });
    await createItem(agent, setlist.id, { type: 'pause', durationSeconds: 5 });

    const event = await ctx.db.run(
        `INSERT INTO events (band_id, setlist_id, title, date, start_time)
         VALUES (?, ?, ?, ?, ?)`,
        [bandId, setlist.id, 'Gig', '2026-01-01', '20:00']
    );

    const removed = await agent.delete(`/api/setlists/${setlist.id}`);
    assert.equal(removed.status, 204);

    const itemCount = await ctx.db.get(
        'SELECT COUNT(*) AS count FROM setlist_items WHERE setlist_id = ?',
        [setlist.id]
    );
    assert.equal(itemCount.count, 0);

    const eventRow = await ctx.db.get(
        'SELECT setlist_id AS setlistId FROM events WHERE id = ?',
        [event.lastID]
    );
    assert.equal(eventRow.setlistId, null);

    await ctx.db.run('DELETE FROM events WHERE id = ?', [event.lastID]);
});

test('setlists are isolated by band', async () => {
    const owner = await register(ownerData);
    const outsider = await register(memberData);
    const ownBandId = owner.membership.bandId;
    const foreignBandId = await createBand('Band_02', outsider.user.id);
    const ownerAgent = await loginAs(ownerData);
    const outsiderAgent = await loginAs(memberData);

    const ownSetlist = await createSetlist(ownerAgent, ownBandId, { name: 'Own' });
    const foreignSetlist = await createSetlist(outsiderAgent, foreignBandId, {
        name: 'Foreign',
    });

    const readForeign = await ownerAgent.get(`/api/bands/${foreignBandId}/setlists`);
    assert.equal(readForeign.status, 403);

    const updateForeign = await ownerAgent
        .put(`/api/setlists/${foreignSetlist.id}`)
        .send({ name: 'Hacked' });
    assert.equal(updateForeign.status, 404);

    const deleteForeign = await ownerAgent.delete(`/api/setlists/${foreignSetlist.id}`);
    assert.equal(deleteForeign.status, 404);

    const createItemForeign = await ownerAgent
        .post(`/api/setlists/${foreignSetlist.id}/items`)
        .send({ type: 'note', text: 'Nope' });
    assert.equal(createItemForeign.status, 404);

    const reorderForeign = await ownerAgent
        .put(`/api/setlists/${foreignSetlist.id}/reorder`)
        .send({ itemIds: [] });
    assert.equal(reorderForeign.status, 404);

    const foreignList = await outsiderAgent.get(
        `/api/bands/${foreignBandId}/setlists`
    );
    assert.deepEqual(
        foreignList.body.setlists.map((setlist) => setlist.id),
        [foreignSetlist.id]
    );
    assert.notEqual(ownSetlist.id, foreignSetlist.id);
});

test('setlist and item routes require authentication', async () => {
    const bandId = await defaultBandId();

    const readSetlists = await request(ctx.app).get(
        `/api/bands/${bandId}/setlists`
    );
    assert.equal(readSetlists.status, 401);

    const createSetlistRes = await request(ctx.app)
        .post(`/api/bands/${bandId}/setlists`)
        .send({ name: 'No Auth' });
    assert.equal(createSetlistRes.status, 401);

    const updateSetlistRes = await request(ctx.app)
        .put('/api/setlists/1')
        .send({ name: 'No Auth' });
    assert.equal(updateSetlistRes.status, 401);

    const deleteSetlistRes = await request(ctx.app).delete('/api/setlists/1');
    assert.equal(deleteSetlistRes.status, 401);

    const createItemRes = await request(ctx.app)
        .post('/api/setlists/1/items')
        .send({ type: 'note', text: 'No Auth' });
    assert.equal(createItemRes.status, 401);

    const updateItemRes = await request(ctx.app)
        .put('/api/setlists/1/items/1')
        .send({ type: 'note', text: 'No Auth' });
    assert.equal(updateItemRes.status, 401);

    const deleteItemRes = await request(ctx.app).delete(
        '/api/setlists/1/items/1'
    );
    assert.equal(deleteItemRes.status, 401);

    const reorderRes = await request(ctx.app)
        .put('/api/setlists/1/reorder')
        .send({ itemIds: [] });
    assert.equal(reorderRes.status, 401);
});
