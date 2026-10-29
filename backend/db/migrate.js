import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

function readMigrations () {
    return fs
        .readdirSync(migrationsDir)
        .filter((name) => name.endsWith('.sql'))
        .map((name) => {
            const match =  /^(\d+)_.*\.sql$/.exec(name);
            if (!match) {
                throw new Error(`Invalid migrationsfilename: ${name}`)
            }
            return { name, version: Number(match[1])};
        })
        .sort((a, b) => a.version - b.version);
}

export async function runMigrations({ withTransaction, get}) {
    const migrations = readMigrations();
    const row = await get('PRAGMA user_version');
    let current = row?.user_version ?? 0;

    for (const migration of migrations) {
        if (migration.version <= current) continue;

        if (migration.version !== current + 1) {
            throw new Error(`Migration gap before ${migration.name}: expected ${current + 1}`);
        }

        const sql = fs.readFileSync(path.join(migrationsDir, migration.name), 'utf8');

        await withTransaction(async (tx) => {
            await tx.exec(sql);
            await tx.exec(`PRAGMA user_version = ${migration.version}`)
        });

        current = migration.version;
    }
}
