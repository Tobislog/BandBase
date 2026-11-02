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

before(async() => {
    ctx = await createTestContext();
});

after(async () => {
    await ctx.cleanup();
});

beforeEach(async() => {
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
    await ctx.db.run('UPDATE band_memberships SET role = ? WHERE band_id = ? AND user_id = ?', [role, bandId, userId]);
}

async function createBand(name, userId, role = 'owner') {
    const band = await ctx.db.run('INSERT INTO bands (name) VALUES (?)', [name]);
    await ctx.db.run('INSERT INTO band_memberships (band_id, user_id, role) VALUES (?, ?, ?)', [band.lastID, userId, role]);
    return band.lastID;
}

async function createSong(agent, bandId, payload = {}) {
    const res = await agent
        .post(`/api/bands/${bandId}/songs`)
        .send({ name: 'Test Song', ...payload });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.song;
}

test('song CRUD works and returns camelCase fields', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;

    const created = await agent
        .post(`/api/bands/${bandId}/songs`)
        .send({
            name: '  Song A  ',
            interpret: 'Artist',
            durationSeconds: 215,
            bpm: 120,
        });

    assert.equal(created.status, 201, JSON.stringify(created.body));
    const song = created.body.song;
    assert.ok(Number.isInteger(song.id));
    assert.equal(song.bandId, bandId);
    assert.equal(song.name, 'Song A');
    assert.equal(song.interpret, 'Artist');
    assert.equal(song.durationSeconds, 215);
    assert.equal(song.bpm, 120);
    assert.equal(typeof song.createdAt, 'string');
    assert.equal(Object.hasOwn(song, 'duration_seconds'), false);

    const list = await agent.get(`/api/bands/${bandId}/songs`);
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.songs.map((item) => item.id), [song.id]);

    const updated = await agent
        .put(`/api/songs/${song.id}`)
        .send({
            name: 'Song B',
            interpret: '',
            durationSeconds: 0,
            bpm: 0,
        });

    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    assert.equal(updated.body.song.name, 'Song B');
    assert.equal(updated.body.song.durationSeconds, 0);

    const deleted = await agent.delete(`/api/songs/${song.id}`);
    assert.equal(deleted.status, 204);

    const empty = await agent.get(`/api/bands/${bandId}/songs`);
    assert.equal(empty.body.songs.length, 0);

    const missing = await agent
        .put('/api/songs/999999')
        .send({ name: 'X', interpret: '', durationSeconds: 0, bpm: 0 });
    assert.equal(missing.status, 404);

    const malformedBand = await agent.get('/api/bands/not-a-number/songs');
    assert.equal(malformedBand.status, 400);
});

test('POST applies defaults and rejects invalid song payloads', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;

    const created = await agent
        .post(`/api/bands/${bandId}/songs`)
        .send({ name: 'Minimal' });

    assert.equal(created.status, 201);
    assert.equal(created.body.song.interpret, '');
    assert.equal(created.body.song.durationSeconds, 0);
    assert.equal(created.body.song.bpm, 0);

    const invalidBodies = [
        {},
        { name: '   ' },
        { name: 'Test', durationSeconds: -1 },
        { name: 'Test', durationSeconds: 1.5 },
        { name: 'Test', durationSeconds: '120' },
        { name: 'Test', bpm: -1 },
        { name: 'Test', bpm: '120' },
        { name: 'Test', interpret: 123 },
    ];

    for (const body of invalidBodies) {
        const res = await agent.post(`/api/bands/${bandId}/songs`).send(body);
        assert.equal(res.status, 400, JSON.stringify(body));
    }

    const songId = created.body.song.id;
    const missingFields = await agent
        .put(`/api/songs/${songId}`)
        .send({ name: 'Only name' });

    assert.equal(missingFields.status, 400);
});

test('members can read but cannot modify songs', async () => {
    const owner = await register(ownerData);
    await register(memberData);
    const bandId = owner.membership.bandId;
    const ownerAgent = await loginAs(ownerData);
    const memberAgent = await loginAs(memberData);
    const song = await createSong(ownerAgent, bandId);

    const read = await memberAgent.get(`/api/bands/${bandId}/songs`);
    assert.equal(read.status, 200);
    assert.deepEqual(read.body.songs.map((item) => item.id), [song.id]);

    const create = await memberAgent
        .post(`/api/bands/${bandId}/songs`)
        .send({ name: 'Nope' });
    assert.equal(create.status, 403);

    const update = await memberAgent
        .put(`/api/songs/${song.id}`)
        .send({ name: 'Nope', interpret: '', durationSeconds: 0, bpm: 0 });
    assert.equal(update.status, 403);

    const remove = await memberAgent.delete(`/api/songs/${song.id}`);
    assert.equal(remove.status, 403);

    const stillThere = await ownerAgent.get(`/api/bands/${bandId}/songs`);
    assert.equal(stillThere.body.songs.length, 1);
});

test('moderators and admins can manage songs', async () => {
    const owner = await register(ownerData);
    const moderator = await register(moderatorData);
    const admin = await register(adminData);
    const bandId = owner.membership.bandId;

    await promote(bandId, moderator.user.id, 'moderator');
    await promote(bandId, admin.user.id, 'admin');

    const moderatorAgent = await loginAs(moderatorData);
    const adminAgent = await loginAs(adminData);

    const created = await moderatorAgent
        .post(`/api/bands/${bandId}/songs`)
        .send({ name: 'Mod Song' });
    assert.equal(created.status, 201);

    const songId = created.body.song.id;
    const updated = await adminAgent
        .put(`/api/songs/${songId}`)
        .send({ name: 'Admin Song', interpret: '', durationSeconds: 10, bpm: 90 });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.song.name, 'Admin Song');

    const deleted = await moderatorAgent.delete(`/api/songs/${songId}`);
    assert.equal(deleted.status, 204);
});

test('songs are isolated by band', async () => {
    const owner = await register(ownerData);
    const outsider = await register(memberData);
    const ownBandId = owner.membership.bandId;
    const foreignBandId = await createBand('Band_02', outsider.user.id);
    const ownerAgent = await loginAs(ownerData);
    const outsiderAgent = await loginAs(memberData);

    const ownSong = await createSong(ownerAgent, ownBandId, { name: 'Own' });
    const foreignSong = await createSong(outsiderAgent, foreignBandId, { name: 'Foreign' });

    const readForeign = await ownerAgent.get(`/api/bands/${foreignBandId}/songs`);
    assert.equal(readForeign.status, 403);

    const updateForeign = await ownerAgent
        .put(`/api/songs/${foreignSong.id}`)
        .send({ name: 'Hacked', interpret: '', durationSeconds: 0, bpm: 0 });
    assert.equal(updateForeign.status, 404);

    const deleteForeign = await ownerAgent.delete(`/api/songs/${foreignSong.id}`);
    assert.equal(deleteForeign.status, 404);

    const foreignList = await outsiderAgent.get(`/api/bands/${foreignBandId}/songs`);
    assert.deepEqual(foreignList.body.songs.map((item) => item.id), [foreignSong.id]);
    assert.notEqual(ownSong.id, foreignSong.id);
});

test('song routes require authentication', async () => {
    const bandId = await defaultBandId();

    const read = await request(ctx.app).get(`/api/bands/${bandId}/songs`);
    assert.equal(read.status, 401);

    const create = await request(ctx.app)
        .post(`/api/bands/${bandId}/songs`)
        .send({ name: 'X' });
    assert.equal(create.status, 401);

    const update = await request(ctx.app)
        .put('/api/songs/1')
        .send({ name: 'X', interpret: '', durationSeconds: 0, bpm: 0 });
    assert.equal(update.status, 401);

    const remove = await request(ctx.app).delete('/api/songs/1');
    assert.equal(remove.status, 401);
});

test('deleting a song cascades to setlist items', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const song = await createSong(agent, bandId, { name: 'Cascade' });

    const setlist = await ctx.db.run(
        'INSERT INTO setlists (band_id, name) VALUES (?, ?)',
        [bandId, 'Set 1']
    );

    await ctx.db.run(
        `INSERT INTO setlist_items (setlist_id, type, song_id, position)
         VALUES (?, 'song', ?, 1)`,
        [setlist.lastID, song.id]
    );

    const beforeCount = await ctx.db.get(
        'SELECT COUNT(*) AS count FROM setlist_items WHERE song_id = ?',
        [song.id]
    );
    assert.equal(beforeCount.count, 1);

    const res = await agent.delete(`/api/songs/${song.id}`);
    assert.equal(res.status, 204);

    const afterCount = await ctx.db.get(
        'SELECT COUNT(*) AS count FROM setlist_items WHERE song_id = ?',
        [song.id]
    );
    assert.equal(afterCount.count, 0);

    const setlistStillExists = await ctx.db.get(
        'SELECT id FROM setlists WHERE id = ?',
        [setlist.lastID]
    );
    assert.ok(setlistStillExists);
});
