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

const outsiderData = {
    email: 'outsider@example.com',
    password: 'secret123',
    firstName: 'Alan',
    lastName: 'Turing',
    color: '#333333',
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
    return request(ctx.app).post('/api/register').send(data);
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

test('registration status is public and enabled by default', async () => {
    const res = await request(ctx.app).get('/api/registration');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { enabled: true });
});

test('default band owner can disable and re-enable registration', async () => {
    await register(ownerData);
    const ownerAgent = await loginAs(ownerData);

    let res = await ownerAgent
        .patch('/api/registration')
        .send({ enabled: false });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { enabled: false });

    const status = await request(ctx.app).get('/api/registration');
    assert.deepEqual(status.body, { enabled: false });

    const blocked = await register(memberData);
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.error, 'Registration is disabled');

    const users = await ctx.db.get(
        'SELECT COUNT(*) AS count FROM users WHERE email = ?',
        [memberData.email]
    );
    assert.equal(users.count, 0);

    res = await ownerAgent
        .patch('/api/registration')
        .send({ enabled: true });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { enabled: true });

    const allowed = await register(memberData);
    assert.equal(allowed.status, 201);
});

test('only the default band owner can change registration', async () => {
    await register(ownerData);
    await register(memberData);
    const memberAgent = await loginAs(memberData);

    let res = await memberAgent
        .patch('/api/registration')
        .send({ enabled: false });
    assert.equal(res.status, 403);

    res = await request(ctx.app)
        .patch('/api/registration')
        .send({ enabled: false });
    assert.equal(res.status, 401);

    const outsider = await register(outsiderData);
    const bandId = await defaultBandId();

    await ctx.db.run(
        'DELETE FROM band_memberships WHERE band_id = ? AND user_id = ?',
        [bandId, outsider.body.user.id]
    );

    const foreignBand = await ctx.db.run(
        'INSERT INTO bands (name) VALUES (?)',
        ['Band_02']
    );

    await ctx.db.run(
        'INSERT INTO band_memberships (band_id, user_id, role) VALUES (?, ?, ?)',
        [foreignBand.lastID, outsider.body.user.id, 'owner']
    );

    const outsiderAgent = await loginAs(outsiderData);

    res = await outsiderAgent
        .patch('/api/registration')
        .send({ enabled: false });
    assert.equal(res.status, 403);

    const ownerAgent = await loginAs(ownerData);
    res = await ownerAgent
        .patch('/api/registration')
        .send({ enabled: false });
    assert.equal(res.status, 200);
});

test('registration toggle validates the request body', async () => {
    await register(ownerData);
    const ownerAgent = await loginAs(ownerData);

    const invalidBodies = [{}, { enabled: 'false' }, { enabled: 0 }, { enabled: null }];

    for (const body of invalidBodies) {
        const res = await ownerAgent
            .patch('/api/registration')
            .send(body);

        assert.equal(res.status, 400, JSON.stringify(body));
    }
});
