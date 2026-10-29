import { config } from "../config.js";

export function sessionCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.cookieSecure,
        path: '/',
        maxAge: config.sessionTtlDays * 24 * 60 * 60 * 1000,
    }
}

export function clearSessionCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.cookieSecure,
        path: '/',
    }
}
