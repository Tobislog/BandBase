const SETLISTS_KEY = 'bandbase_setlists';
const SONGS_KEY = 'bandbase_songs';
const EVENTS_KEY = 'bandbase_events';
const BANDS_KEY = 'bandbase_bands'
const MEMBERSHIPS_KEY = 'bandbase_band_memberships';
const CHANNELS_KEY = 'bandbase_channels';
const CHANNELS_MEMBERS_KEY = 'bandbase_channel_members';
const MESSAGES_KEY = 'bandbase_messages';

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
export function saveStoredBands (bands) {
    localStorage.setItem(BANDS_KEY, JSON.stringify(bands));
}

// Memberships
export function getStoredMemberships () {
    const data = localStorage.getItem(MEMBERSHIPS_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveStoredMemberships (memberships) {
    localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}

// Channels
export function getStoredChannels () {
    const data = localStorage.getItem(CHANNELS_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveStoredChannels (channels) {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
}

// Channel-Members
export function getStoredChannelsMembers () {
    const data = localStorage.getItem(CHANNELS_MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveStoredChannelsMembers (members) {
    localStorage.setItem(CHANNELS_MEMBERS_KEY, JSON.stringify(members));
}

// Messages
export function getStoredMessages () {
    const data = localStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
}
export function saveStoredMessages (messages) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}
