import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDir, '.env') });

function intFromEnv(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined || raw === '') return fallback;
    const value = Number(raw);
    return Number.isInteger(value) ? value : fallback;
}

function resolveDbFile() {
    const raw = process.env.DB_FILE;
    if(!raw) return path.join(backendDir, 'bandbase.db');
    if(raw === ':memory:') return raw;
    return path.resolve(backendDir, raw);
}

export const config = {
    port: intFromEnv('PORT', 3000),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    dbFile: resolveDbFile(),
    sessionTtlDays: intFromEnv('SESSION_TTL_DAYS', 7),
};
