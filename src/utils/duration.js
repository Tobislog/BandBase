export function formatDuration(totalSeconds) {
    const seconds = Number.isInteger(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return`${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function parseDuration(value) {
    if (typeof value !== 'string') return null;
    const match = /^(\d{1,3}):([0-5]\d)$/.exec(value.trim());
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
}

