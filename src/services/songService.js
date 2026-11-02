import { apiRequest } from './apiClient';

export async function getSongs(bandId) {
    const data = await apiRequest(`/bands/${bandId}/songs`);
    return data.songs;
}

export async function createSong(bandId, song) {
    const data = await apiRequest(`/bands/${bandId}/songs`, {
        method: 'POST',
        body: song,
    });
    return data.song;
}

export async function updateSong(songId, song) {
    const data = await apiRequest(`/songs/${songId}`, {
        method: 'PUT',
        body: song,
    });
    return data.song;
}
export async function deleteSong(songId) {
    await apiRequest(`/songs/${songId}`, { method: 'DELETE' });
}
