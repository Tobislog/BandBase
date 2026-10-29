import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import { config } from '../config.js';
import { runMigrations} from './migrate.js';
import { seedDefaultBand } from './seed.js';

let db;
let writeTail = Promise.resolve();
let initialized = false;
let inTransaction = false;

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (config.dbFile !== ':memory:') {
            fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
        }
        db = new sqlite3.Database(config.dbFile, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function execRaw(sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => (err ? reject(err): resolve()));
    });
}

function runRaw(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function getRaw(sql, params = []) {
    return new Promise ((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
}

function allRaw(sql, params = []) {
    return new Promise ((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    })
}

function withWriteLock(fn) {
    const result = writeTail.then(fn, fn);
    writeTail = result.then(
        () => undefined,
        () => undefined
    );
    return result;
}

export function run(sql, params = []) {
    if (inTransaction) {
        return Promise.reject(
            new Error('run() is not valid within a Transaction, use tx.run')
        );
    }
    return withWriteLock(() => runRaw(sql, params));
}

export function get(sql, params = []) {
    return getRaw(sql, params);
}

export function all (sql, params = []) {
    return allRaw(sql, params);
}

export function withTransaction(fn) {
    if (inTransaction) {
        return Promise.reject(new Error('Stacked Transactions are not valid!'));
    }
    return withWriteLock(async () => {
        inTransaction = true;
        await execRaw('BEGIN IMMEDIATE');

        try {
            const tx = {
                run: (sql, params = []) => runRaw(sql, params),
                get: (sql, params = []) => getRaw(sql, params),
                all: (sql, params = []) => allRaw(sql, params),
                exec: (sql) => execRaw(sql),
            };
            const result = await fn(tx);
            await execRaw('COMMIT');
            return result;
        } catch (err) {
            try {
                await execRaw('ROLLBACK');
            } catch {
                // ??
            }
            throw err;
        } finally {
            inTransaction =  false;
        }
    });
}

export async function initializeDatabase() {
    if (initialized) return;

    await openDatabase();
    await execRaw('PRAGMA foreign_keys = ON');
    await execRaw('PRAGMA journal_mode = WAL');
    await execRaw('PRAGMA synchronous = NORMAL');
    await execRaw('PRAGMA busy_timeout = 5000');

    await runMigrations({ withTransaction, get: getRaw});
    await withTransaction((tx) => seedDefaultBand(tx));

    initialized = true;
}

export function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve();
            return
        }
        db.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            db = undefined;
            initialized = false;
            writeTail = Promise.resolve();
            resolve();
        })
    })
}
