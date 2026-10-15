const SETLISTS_KEY = 'bandbase_setlists';
const SONGS_KEY = 'bandbase_songs';

export function getStoredSetlists() {
    const data = localStorage.getItem(SETLISTS_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveStoredSetlists (setlists) {
    localStorage.setItem(SETLISTS_KEY, JSON.stringify(setlists));
}

export function getStoredSongs() {
    const data = localStorage.getItem(SONGS_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveStoredSongs(songs) {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}
