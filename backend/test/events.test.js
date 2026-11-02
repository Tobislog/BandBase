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

function eventPayload(overrides = {}) {
    return {
        title: 'Probe',
        date: '2026-12-01',
        startTime: '19:00',
        endTime: '21:00',
        meetupTime: '18:30',
        description: 'Test',
        category: 'rehearsal',
        ...overrides,
    };
}

async function createEvent(agent, bandId, payload = {}) {
    const res = await agent
        .post(`/api/bands/${bandId}/events`)
        .send(eventPayload(payload));
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.event;
}

async function getChannels(agent, bandId) {
    const res = await agent.get(`/api/bands/${bandId}/channels`);
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return res.body.channels;
}

test('event creation creates an event channel and returns channelId', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;

    const event = await createEvent(agent, bandId, { title: 'Album Release' });

    assert.ok(event.channelId);

    const channel = (await getChannels(agent, bandId))
        .find((item) => item.id === event.channelId);

    assert.ok(channel);
    assert.equal(channel.type, 'event');
    assert.equal(channel.eventId, event.id);
    assert.equal(channel.name, 'Album Release');

    const list = await agent.get(`/api/bands/${bandId}/events`);
    assert.equal(list.status, 200);
    assert.equal(list.body.events[0].channelId, event.channelId);
});

test('event update syncs the channel name', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const event = await createEvent(agent, bandId);

    const res = await agent
        .put(`/api/events/${event.id}`)
        .send(eventPayload({ title: 'Geänderter Titel' }));

    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.event.channelId, event.channelId);

    const channel = (await getChannels(agent, bandId))
        .find((item) => item.id === event.channelId);

    assert.equal(channel.name, 'Geänderter Titel');
});

test('deleting an event cascades channel and messages', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;
    const event = await createEvent(agent, bandId);

    const sent = await agent
        .post(`/api/channels/${event.channelId}/messages`)
        .send({ content: 'Hallo' });
    assert.equal(sent.status, 201, JSON.stringify(sent.body));

    const deleted = await agent.delete(`/api/events/${event.id}`);
    assert.equal(deleted.status, 204);

    const channel = await ctx.db.get(
        'SELECT id FROM channels WHERE id = ?',
        [event.channelId]
    );
    assert.equal(channel, undefined);

    const messageCount = await ctx.db.get('SELECT COUNT(*) AS count FROM messages');
    assert.equal(messageCount.count, 0);

    const messages = await agent.get(`/api/channels/${event.channelId}/messages`);
    assert.equal(messages.status, 404);
});

test('members can read and write messages but cannot create events', async () => {
    const owner = await register(ownerData);
    const member = await register(memberData);
    const bandId = owner.membership.bandId;

    const ownerAgent = await loginAs(ownerData);
    const event = await createEvent(ownerAgent, bandId);

    const memberAgent = await loginAs(memberData);

    const forbidden = await memberAgent
        .post(`/api/bands/${bandId}/events`)
        .send(eventPayload({ title: 'Forbidden' }));
    assert.equal(forbidden.status, 403);

    const sent = await memberAgent
        .post(`/api/channels/${event.channelId}/messages`)
        .send({ content: '  Hallo Band  ' });

    assert.equal(sent.status, 201, JSON.stringify(sent.body));
    assert.equal(sent.body.message.content, 'Hallo Band');
    assert.equal(sent.body.message.userId, member.user.id);
    assert.deepEqual(sent.body.message.author, {
        id: member.user.id,
        firstName: 'Grace',
        lastName: 'Hopper',
        color: '#222222',
    });

    const messages = await memberAgent.get(
        `/api/channels/${event.channelId}/messages`
    );
    assert.equal(messages.status, 200);
    assert.equal(messages.body.messages.length, 1);
    assert.equal(messages.body.messages[0].author.firstName, 'Grace');
});

test('moderators can manage events', async () => {
    const owner = await register(ownerData);
    const moderator = await register(moderatorData);
    const bandId = owner.membership.bandId;

    await promote(bandId, moderator.user.id, 'moderator');

    const agent = await loginAs(moderatorData);
    const event = await createEvent(agent, bandId, { title: 'Moderated' });

    const updated = await agent
        .put(`/api/events/${event.id}`)
        .send(eventPayload({ title: 'Moderated 2' }));
    assert.equal(updated.status, 200);

    const deleted = await agent.delete(`/api/events/${event.id}`);
    assert.equal(deleted.status, 204);
});

test('event setlistId must belong to the same band', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;

    const otherBandId = await createBand('Other Band', owner.user.id);
    const foreignSetlist = await ctx.db.run(
        'INSERT INTO setlists (band_id, name) VALUES (?, ?)',
        [otherBandId, 'Foreign']
    );

    const rejected = await agent
        .post(`/api/bands/${bandId}/events`)
        .send(eventPayload({ setlistId: foreignSetlist.lastID }));
    assert.equal(rejected.status, 404);

    const ownSetlist = await ctx.db.run(
        'INSERT INTO setlists (band_id, name) VALUES (?, ?)',
        [bandId, 'Own']
    );

    const accepted = await agent
        .post(`/api/bands/${bandId}/events`)
        .send(eventPayload({ setlistId: ownSetlist.lastID }));

    assert.equal(accepted.status, 201, JSON.stringify(accepted.body));
    assert.equal(accepted.body.event.setlistId, ownSetlist.lastID);
});

test('custom channel access follows role and channel membership rules', async () => {
    const owner = await register(ownerData);
    const member = await register(memberData);
    const moderator = await register(moderatorData);
    const admin = await register(adminData);
    const bandId = owner.membership.bandId;

    await promote(bandId, moderator.user.id, 'moderator');
    await promote(bandId, admin.user.id, 'admin');

    const custom = await ctx.db.run(
        `INSERT INTO channels (band_id, type, event_id, name, created_by)
         VALUES (?, 'custom', NULL, 'Custom', ?)`,
        [bandId, owner.user.id]
    );
    const customId = custom.lastID;

    const memberAgent = await loginAs(memberData);
    const denied = await memberAgent.get(`/api/channels/${customId}/messages`);
    assert.equal(denied.status, 403);

    await ctx.db.run(
        'INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)',
        [customId, member.user.id]
    );

    const allowed = await memberAgent.get(`/api/channels/${customId}/messages`);
    assert.equal(allowed.status, 200);

    const ownerAgent = await loginAs(ownerData);
    assert.equal((await ownerAgent.get(`/api/channels/${customId}/messages`)).status, 200);

    const adminAgent = await loginAs(adminData);
    assert.equal((await adminAgent.get(`/api/channels/${customId}/messages`)).status, 200);

    const moderatorAgent = await loginAs(moderatorData);
    assert.equal((await moderatorAgent.get(`/api/channels/${customId}/messages`)).status, 403);

    await ctx.db.run(
        'INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)',
        [customId, moderator.user.id]
    );

    assert.equal((await moderatorAgent.get(`/api/channels/${customId}/messages`)).status, 200);
});

test('non-members cannot access band event lists', async () => {
    await register(ownerData);
    const member = await register(memberData);

    const otherBandId = await createBand('Other Band', member.user.id);

    const ownerAgent = await loginAs(ownerData);
    const res = await ownerAgent.get(`/api/bands/${otherBandId}/events`);

    assert.equal(res.status, 403);
});

test('deleting a user with messages is blocked by foreign key', async () => {
    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = owner.membership.bandId;

    const event = await createEvent(agent, bandId, { title: 'FK Test' });

    const sent = await agent
        .post(`/api/channels/${event.channelId}/messages`)
        .send({ content: 'Diese Nachricht blockiert die User-Löschung.' });

    assert.equal(sent.status, 201, JSON.stringify(sent.body));

    await assert.rejects(
        () => ctx.db.run('DELETE FROM users WHERE id = ?', [owner.user.id]),
        /FOREIGN KEY constraint failed/
    );

    const user = await ctx.db.get(
        'SELECT id FROM users WHERE id = ?',
        [owner.user.id]
    );

    assert.ok(user);
});

test('deleting a user without messages keeps channels and clears created_by', async () => {
    const owner = await register(ownerData);
    const member = await register(memberData);
    const bandId = owner.membership.bandId;

    const custom = await ctx.db.run(
        `INSERT INTO channels (band_id, type, event_id, name, created_by)
         VALUES (?, 'custom', NULL, 'Created by member', ?)`,
        [bandId, member.user.id]
    );

    const deleted = await ctx.db.run(
        'DELETE FROM users WHERE id = ?',
        [member.user.id]
    );
    assert.equal(deleted.changes, 1);

    const channel = await ctx.db.get(
        'SELECT id, created_by AS createdBy FROM channels WHERE id = ?',
        [custom.lastID]
    );

    assert.ok(channel);
    assert.equal(channel.createdBy, null);
});
