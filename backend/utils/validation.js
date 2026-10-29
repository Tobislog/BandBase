export const ROLES = ['owner', 'admin', 'moderator', 'member'];
export const CATEGORIES = ['other', 'rehearsal', 'gig'];
export const ITEM_TYPES = ['song', 'note', 'pause'];

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_BYTES = 72;
export const MAX_MESSAGE_LENGTH = 2000;

export function isNonEmptyString(value, maxLength = 255) {
    return typeof value === 'string'
        && value.trim().length > 0
        && value.trim().length <= maxLength;
}

export function normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isEmail(value) {
    return typeof value === 'string'
        && value.length <= 254
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPassword(value) {
    return typeof value === 'string'
        && value.length >= MIN_PASSWORD_LENGTH
        && Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES;
}

export function isValidColor(value) {
    return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month -1, day));
    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month -1
        && date.getUTCDate() === day;
}

export function isValidTime(value) {
    return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

export function isValidCategory(value) {
    return CATEGORIES.includes(value);
}

export function isValidRole(value) {
    return ROLES.includes(value);
}

export function isValidItemType(value) {
    return ITEM_TYPES.includes(value);
}

export function isValidMessageContent(value) {
    return isNonEmptyString(value, MAX_MESSAGE_LENGTH);
}
