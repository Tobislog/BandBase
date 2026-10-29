import { Router } from "express";
import bcrypt from 'bcryptjs';
import { config } from "../config.js";
import { get, run, withTransaction } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";
import { createSessionToken, hashSessionToken } from "../utils/tokens.js";
import { clearSessionCookieOptions, sessionCookieOptions } from "../utils/cookies.js";
import { isEmail, isNonEmptyString, isValidColor, isValidPassword, normalizeEmail } from "../utils/validation.js";

const router = Router();
const BCRYPT_ROUNDS = 10;
const DEFAULT_COLOR = '#3b82f6';
const DEFAULT_BAND_NAME = 'Band_01';
const USER_FIELDS = `id, email, first_name AS firstName, last_name AS lastName, color, created_at AS createdAt`;

async function findUsersByEmail(email) {
    return get(
        `SELECT ${USER_FIELDS}, password_hash AS passwordHash FROM users WHERE email = ?`, [email]
    );
}

router.post('/register', async (req, res) => {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = body.password;
    const firstName = body.firstName;
    const lastName = body.lastName;
    const color = body.color ?? DEFAULT_COLOR;

    if (!isEmail(email)) {
        throw new HttpError(400, 'A valid email is required');
    }
    if (!isValidPassword(password)) {
        throw new HttpError(400, 'Password must be between 8 and 72 bytes long');
    }
    if (!isNonEmptyString(firstName, 100) || !isNonEmptyString(lastName, 100)) {
        throw new HttpError(400, 'First name and last name required');
    }
    if (!isValidColor(color)) {
        throw new HttpError(400, 'Color must be a hex like #3b82f6');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    const result = await withTransaction(async (tx) => {
        const band = await tx.get('SELECT id FROM bands WHERE name = ?', [DEFAULT_BAND_NAME]);
        if (!band) {
            throw new HttpError(500, 'Default Band is missing');
        }

        const { count } = await tx.get(
            'SELECT COUNT(*) AS count FROM band_memberships WHERE band_id = ?', [band.id]
        );
        const role = count === 0 ? 'owner' : 'member';

        const inserted = await tx.run(
            `INSERT INTO users (email, password_hash, first_name, last_name, color) VALUES (?, ?, ?, ?, ?)`,
            [email, passwordHash, normalizedFirstName, normalizedLastName, color]
        );

        await tx.run(
            `INSERT INTO band_memberships (band_id, user_id, role) VALUES (?, ?, ?)`,
            [band.id, inserted.lastID, role]
        );

        const user = await tx.get(
            `SELECT ${USER_FIELDS} FROM users WHERE id = ?`,
            [inserted.lastID]
        );
        const membership = await tx.get(
            `SELECT band_id AS bandId, user_id AS userId, role, created_at AS createdAt FROM band_memberships WHERE band_id = ? AND user_id = ?`,
            [band.id, inserted.lastID]
        );

        return { user, membership }
    });

    res.status(201).json(result);
});

router.post('/login', async (req, res) => {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = body.password;

    if (!isEmail(email) || typeof password !== 'string' || password.length === 0) {
        throw new HttpError(400, 'Email and password are required');
    }

    const user =  await findUsersByEmail(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
        throw new HttpError(401, 'Invalid email or password');
    }

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000).toISOString();

    await withTransaction(async (tx) => {
        await tx.run('DELETE FROM sessions WHERE expires_at <= ?', [new Date().toISOString()]);
        await tx.run(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)`, [hashSessionToken(token), user.id, expiresAt]);
    });

    delete user.passwordHash;
    res.cookie('token', token, sessionCookieOptions());
    res.json({ user })
});

router.post('/logout', async (req, res) => {
    const token = req.cookies?.token;
    if (typeof token === 'string' && token.length > 0) {
        await run('DELETE FROM sessions WHERE token_hash = ?', [hashSessionToken(token)])
    }
    res.clearCookie('token', clearSessionCookieOptions());
    res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

export default router;
