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

const targetData = {
    email: 'target@example.com',
    password: 'secret123',
    firstName: 'Margaret',
    lastName: 'Hamilton',
    color: '#555555',
};

before(async () => {
    ctx = await createTestContext();
});

after(async () => {
    await ctx.cleanup();
});

beforeEach(async () => {
    await resetAuthData(ctx.db);
})

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

async function createBand(name, userId, role = 'owner') {
    const band = await ctx.db.run('INSERT INTO bands (name) VALUES (?)', [name]);
    await ctx.db.run('INSERT INTO band_memberships (band_id, user_id, role) VALUES (?, ?, ?)',
        [band.lastID, userId, role]
    );
    return band.lastID
}

async function roleIn(bandId, userId) {
    const row = await ctx.db.get('SELECT role FROM band_memberships WHERE band_id = ? AND user_id = ?', [bandId, userId]);
    return row?.role ?? null;
}

test('registration assigns owner and member and GET /api/bands returns own bands', async () => {
    const owner = await register(ownerData);
    const member = await register(memberData);

    assert.equal(owner.membership.role, 'owner');
    assert.equal(member.membership.role, 'member');

    const bandId = owner.membership.bandId;
    const secondBandId = await createBand('Band_02', owner.user.id);

    const ownerAgent = await loginAs(ownerData);
    const ownerBands = await ownerAgent.get('/api/bands');

    assert.equal(ownerBands.status, 200);
    assert.equal(ownerBands.body.bands.length, 2);

    const firstBand = ownerBands.body.bands.find((band) => band.id === bandId);

    assert.equal(firstBand.role, 'owner');
    assert.equal(typeof firstBand.createdAt, 'string');
    assert.equal(typeof firstBand.joinedAt, 'string');
    assert.ok(ownerBands.body.bands.some((band) => band.id === secondBandId));

    const memberAgent = await loginAs(memberData);
    const memberBands = await memberAgent.get('/api/bands');

    assert.equal(memberBands.status, 200);
    assert.deepEqual(memberBands.body.bands.map((band) => band.id), [bandId]);
});

test('GET memberships returns names and colors without sensitive fields', async () => {
    const owner = await register(ownerData);
    await register(memberData);

    const bandId = await defaultBandId();
    const ownerAgent = await loginAs(ownerData);
    const res = await ownerAgent.get(`/api/bands/${bandId}/memberships`);

    assert.equal(res.status, 200);
    assert.equal(res.body.memberships.length, 2);
    
    const row = res.body.memberships.find((item) => item.userId === owner.user.id);

    assert.equal(row.role, 'owner');
    assert.equal(row.firstName, 'Ada');
    assert.equal(row.lastName, 'Lovelace');
    assert.equal(row.color, '#111111');
    assert.equal(Object.hasOwn(row, 'email'), false);
    assert.equal(Object.hasOwn(row, 'passwordHash'), false);

    const memberAgent = await loginAs(memberData);
    const memberRes = await memberAgent.get(`/api/bands/${bandId}/memberships`);

    assert.equal(memberRes.status, 200);
});

test('band routes require authentification and reject foreign bands', async () => {
    const unauthorized = await request(ctx.app).get('/api/bands');
    assert.equal(unauthorized.status, 401);

    const owner = await register(ownerData);
    const agent = await loginAs(ownerData);
    const bandId = await defaultBandId();

    const invalid = await agent.get('/api/bands/not-a-number/membership');
    assert.equal(invalid.status, 404);

    const foreignBand = await ctx.db.run('INSERT INTO bands (name) VALUES (?)', ['Band_02']);
    const read = await agent.get(`/api/bands/${foreignBand.lastID}/memberships`);
    assert.equal(read.status, 403);

    const write = await agent
        .patch(`/api/bands/${foreignBand.lastID}/memberships/${owner.user.id}`)
        .send({ role: 'member'});
    assert.equal(write.status, 403);

    const bands = await agent.get('/api/bands');
    assert.equal(bands.status, 200);
    assert.deepEqual(bands.body.bands.map((band) => band.id), [bandId]);
});

test('members and moderators cannot change roles and admins have limited permissions', async () => {
    
    const owner = await register(ownerData);
    const moderator = await register(moderatorData);
    const admin = await register(adminData);
    const target = await register(targetData);
    await register(memberData);
    const bandId = await defaultBandId();
    const ownerAgent = await loginAs(ownerData);
    
    await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${moderator.user.id}`)
        .send({ role: 'moderator'})
        .expect(200);
    
    await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${admin.user.id}`)
        .send({ role: 'admin' })
        .expect(200);
    
    const memberAgent = await loginAs(memberData);
    let res = await memberAgent
        .patch(`/api/bands/${bandId}/memberships/${target.user.id}`)
        .send({ role: 'moderator' });
    assert.equal(res.status, 403);

    const moderatorAgent = await loginAs(moderatorData);
    res = await moderatorAgent
        .patch(`/api/bands/${bandId}/memberships/${target.user.id}`)
        .send({ role: 'moderator' });
    assert.equal(res.status, 403);

    const adminAgent = await loginAs(adminData);

    res = await adminAgent
        .patch(`/api/bands/${bandId}/memberships/${admin.user.id}`)
        .send({ role: 'member' });
    assert.equal(res.status, 403);

    res = await adminAgent
        .patch(`/api/bands/${bandId}/memberships/${owner.user.id}`)
        .send({ role: 'member' });
    assert.equal(res.status, 403);

    res = await adminAgent
        .patch(`/api/bands/${bandId}/memberships/${target.user.id}`)
        .send({ role: 'admin' });
    assert.equal(res.status, 403);

    res = await adminAgent
        .patch(`/api/bands/${bandId}/memberships/${target.user.id}`)
        .send({ role: 'owner' });
    assert.equal(res.status, 403);

    res = await adminAgent
        .patch(`/api/bands/${bandId}/memberships/${target.user.id}`)
        .send({ role: 'moderator' });
    assert.equal(res.status, 200);
    assert.equal(res.body.membership.role, 'moderator');

    res = await adminAgent
        .patch(`/api/bands/${bandId}/memberships/${target.user.id}`)
        .send({ role: 'member' });
    assert.equal(res.status, 200);
    assert.equal(res.body.membership.role, 'member');
});

test('owner can assign roles, cannot demote self, and can transfer ownership atomically', async () => {
    const owner = await register(ownerData);
    const member = await register(memberData);
    const extra = await register(targetData);

    const bandId = await defaultBandId();
    const ownerAgent = await loginAs(ownerData);

    let res = await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${extra.user.id}`)
        .send({ role: 'moderator' });
    assert.equal(res.status, 200);
    assert.equal(res.body.membership.role, 'moderator');

    res = await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${extra.user.id}`)
        .send({ role: 'member' });
    assert.equal(res.status, 200);
    assert.equal(res.body.membership.role, 'member');

    res = await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${owner.user.id}`)
        .send({ role: 'admin' });
    assert.equal(res.status, 403);

    res = await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${owner.user.id}`)
        .send({ role: 'superuser' });
    assert.equal(res.status, 400);

    res = await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/999999`)
        .send({ role: 'member' });
    assert.equal(res.status, 404);

    res = await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${member.user.id}`)
        .send({ role: 'owner' });
    assert.equal(res.status, 200);
    assert.equal(res.body.membership.role, 'owner');

    assert.equal(await roleIn(bandId, owner.user.id), 'admin');
    assert.equal(await roleIn(bandId, member.user.id), 'owner');

    const owners = await ctx.db.all(
        "SELECT user_id FROM band_memberships WHERE band_id = ? AND role = 'owner'",
        [bandId]
    );

    assert.equal(owners.length, 1);
    assert.equal(owners[0].user_id, member.user.id);

    res = await ownerAgent
        .patch(`/api/bands/${bandId}/memberships/${member.user.id}`)
        .send({ role: 'member' });
    assert.equal(res.status, 403);
});

test('band isolation prevents reading and changing memberships of another band', async () => {
    const owner = await register(ownerData);
    const outsider = await register(memberData);

    const ownBandId = await defaultBandId();
    const foreignBandId = await createBand('Band_02', outsider.user.id);
    const agent = await loginAs(ownerData);

    let res = await agent.get(`/api/bands/${foreignBandId}/memberships`);
    assert.equal(res.status, 403);

    res = await agent
        .patch(`/api/bands/${foreignBandId}/memberships/${outsider.user.id}`)
        .send({ role: 'member' });
    assert.equal(res.status, 403);

    const bands = await agent.get('/api/bands');

    assert.equal(bands.status, 200);
    assert.deepEqual(bands.body.bands.map((band) => band.id),[ownBandId]);
});
