import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function createTestContext() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bandbase-test-'));
    process.env.DB_FILE = path.join(dir, 'test.db');

    const db = await import('../db/index.js');
    const { default: app } = await import('../app.js');

    await db.initializeDatabase();

    return {
        app,
        db,
        dir,
        async cleanup() {
            await db.closeDatabase();
            fs.rmSync(dir, { recursive: true, force: true });
        },
    };
}

export async function resetAuthData(db) {
    await db.run('DELETE FROM sessions');
    await db.run('DELETE FROM band_memberships');
    await db.run('DELETE FROM users');
}
