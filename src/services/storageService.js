const SETLISTS_KEY = 'bandbase_setlists';
const SONGS_KEY = 'bandbase_songs';
const EVENTS_KEY = 'bandbase_events';
const BANDS_KEY = 'bandbase_bands'
const MEMBERSHIPS_KEY = 'bandbase_band_memberships';

// Setlists
export function getStoredSetlists() {
    const data = localStorage.getItem(SETLISTS_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveStoredSetlists (setlists) {
    localStorage.setItem(SETLISTS_KEY, JSON.stringify(setlists));
}

// Songs
export function getStoredSongs() {
    const data = localStorage.getItem(SONGS_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveStoredSongs(songs) {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

// Events
export function getStoredEvents() {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveStoredEvents(events) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

// Bands
export function getStoredBands () {
    const data = localStorage.getItem(BANDS_KEY);
    return data ? JSON.parse(data) : [];
}
export function setStoredBands (bands) {
    localStorage.setItem(BANDS_KEY, JSON.stringify(bands));
}

// Memberships
export function getStoredMemberships () {
    const data = localStorage.getItem(MEMBERSHIPS_KEY);
    return data ? JSON.parse(data) : [];
}
export function setStoredMemberships (memberships) {
    localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}
