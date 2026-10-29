import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from './helpers.js';

let ctx;

before(async () => {
    ctx = await createTestContext();
});

after (async () => {
    await ctx.cleanup();
})

test('migration sets user_version, enables foreign keys and seeds Band_01 once', async () => {
    const version = await ctx.db.get('PRAGMA user_version');
    const foreignKeys =  await ctx.db.get('PRAGMA foreign_keys');
    const bands = await ctx.db.all('SELECT id, name FROM bands WHERE name = "Band_01"');

    assert.equal(version.user_version, 1);
    assert.equal(foreignKeys.foreign_keys, 1);
    assert.equal(bands.length, 1);
});

test('running the migration runner again is a no-op', async () => {
    const { runMigrations } = await import ('../db/migrate.js');

    await runMigrations({
        withTransaction: ctx.db.withTransaction,
        get: ctx.db.get,
    });

    const version = await ctx.db.get('PRAGMA user_version');
    const count =  await ctx.db.get("SELECT COUNT(*) AS count FROM bands WHERE name = 'Band_01'");

    assert.equal(version.user_version, 1);
    assert.equal(count.count, 1);
});

test('foreign keys are enforced', async () => {
    await assert.rejects(() => ctx.db.run(
        `INSERT INTO band_memberships (band_id, user_id, role) VALUES (?, ?, ?)`, [999, 999, 'member']
        ), /FOREIGN KEY constraint failed/
    );
});
