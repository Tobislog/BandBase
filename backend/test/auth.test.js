import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import { createTestContext, resetAuthData } from './helpers.js';

let ctx;

const owner = {
    email: 'owner@example.com',
    password: 'secret123',
    firstName: 'Ada',
    lastName: 'Lovelace',
};

const member = {
    email: 'member@example.com',
    password: 'secret123',
    firstName: 'Grace',
    lastName: 'Hopper',
}

before(async () => {
    ctx = await createTestContext();
});

after(async () => {
    await ctx.cleanup();
})

beforeEach(async () => {
    await resetAuthData(ctx.db);
})

function register(payload = owner) {
    return request(ctx.app).post('/api/register').send(payload);
}

test('first user becomes owner, second becomes member', async () => {
    const first = await register(owner);
    assert.equal(first.status, 201);
    assert.equal(first.body.user.firstName, 'Ada');
    assert.equal(first.body.membership.role, 'owner');

    const second = await register(member);
    assert.equal(second.status, 201);
    assert.equal(second.body.membership.role, 'member');
});

test('registration normalizes email and rejects duplicates with 409', async () => {
    const first = await register({...owner, email: '   OWNER@Example.com   '});
    assert.equal(first.status, 201);
    assert.equal(first.body.user.email, 'owner@example.com');

    const duplicate = await register(owner);
    assert.equal(duplicate.status, 409);
    assert.equal(typeof duplicate.body.error, 'string');
})

test('registration validates input and does not set a cookie', async () => {
    const invalidPayloads = [
        {},
        {...owner, email:'not-an-email'},
        {...owner, password: 'short'},
        {...owner, firstName: '   '},
        {...owner, color: 'blue'},
    ];

    for (const payload of invalidPayloads) {
        const res = await register(payload);
        assert.equal(res.status, 400, JSON.stringify(payload));
        assert.equal(typeof res.body.error, 'string');
        assert.equal(res.headers['set-cookie'], undefined);
    }
});

test('register stores a bcrypt hash, not the plaintext password', async () => {
    const res = await register(owner);
    assert.equal(res.status, 201);

    const row = await ctx.db.get('SELECT password_hash AS passwordHash FROM users WHERE id = ?', [res.body.user.id]);
    assert.notEqual(row.passwordHash, owner.password);
    assert.match(row.passwordHash, /^\$2[aby]\$/);
});

test('login sets a session cookie and /api/me returns camelCase user', async () => {
    await register(owner);
    const agent = request.agent(ctx.app);

    const login = await agent.post('/api/login').send({
        email: owner.email,
        password: owner.password,
    });

    assert.equal(login.status, 200);
    assert.equal(login.body.user.firstName, 'Ada');

    const setCookie = login.headers['set-cookie']?.[0] ?? '';
    assert.match(setCookie, /token=/);
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    assert.match(setCookie, /Path=\//i);

    const me = await agent.get('/api/me');
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, owner.email);
    assert.equal(me.body.user.firstName, 'Ada');
});

test('login rejects wrong credentials with 401', async () => {
    await register(owner);
    
    const wrongPassword = await request(ctx.app).post('/api/login').send({
        email: owner.email,
        password: 'wrong-password',
    });

    assert.equal(wrongPassword.status, 401);

    const unknownEmail = await request(ctx.app).post('/api/login').send({
        email: 'nobody@example.com',
        password: owner.password,
    })
    assert.equal(unknownEmail.status, 401);
});

test('logout deletes the session and clears the cookie', async () => {
    await register(owner);
    const agent = request.agent(ctx.app);

    await agent.post('/api/login').send({
        email: owner.email,
        password: owner.password,
    })

    const logout = await agent.post('/api/logout');
    assert.equal(logout.status, 204);

    const me = await agent.get('/api/me');
    assert.equal(me.status, 401);
});

test('tampered and expired sessions return 401', async () => {
    const tampered = await request(ctx.app)
        .get('/api/me')
        .set('Cookie', 'token=not-a-valid-token');
    assert.equal(tampered.status, 401);

    const res = await register(owner);
    const token = 'expired-token';
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await ctx.db.run(
        'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
        [tokenHash, res.body.user.id, new Date(Date.now() - 60_000).toISOString()]
    );

    const expired = await request(ctx.app)
        .get('/api/me')
        .set('Cookie', `token=${token}`);
    assert.equal(expired.status, 401)
});

test('login removes expired sessions', async () => {
    const res = await register(owner);
    const tokenHash = crypto.createHash('sha256').update('old-token').digest('hex');
    await ctx.db.run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
        [tokenHash, res.body.user.id, new Date(Date.now() - 60_000).toISOString()]
    );
    const login = await request(ctx.app).post('/api/login').send({
        email: owner.email,
        password: owner.password,
    });
    assert.equal(login.status, 200);

    const oldSession = await ctx.db.get(
        'SELECT token_hash FROM sessions WHERE token_hash = ?',
        [tokenHash]
    );
    const count = await ctx.db.get('SELECT COUNT(*) AS count FROM sessions');

    assert.equal(oldSession, undefined);
    assert.equal(count.count, 1);
});
