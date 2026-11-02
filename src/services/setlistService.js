import { apiRequest } from './apiClient';

export async function getSetlists(bandId) {
    const data = await apiRequest(`/bands/${bandId}/setlists`);
    return data.setlists;
}

export async function createSetlist(bandId, setlist = {}) {
    const data = await apiRequest(`/bands/${bandId}/setlists`, {
        method : 'POST',
        body: setlist,
    });
    return data.setlist;
}

export async function updateSetlist(setlistId, setlist) {
    const data = await apiRequest(`/setlists/${setlistId}`, {
        method: 'PUT',
        body: setlist,
    });
    return data.setlist;
}

export async function deleteSetlist(setlistId) {
    await apiRequest(`/setlists/${setlistId}`, { method: 'DELETE' });
}

export async function createItem(setlistId, item) {
    const data = await apiRequest(`/setlists/${setlistId}/items`, {
        method: 'POST',
        body: item,
    });
    return data.item;
}

export async function updateItem(setlistId, itemId, item) {
    const data = await apiRequest(`/setlists/${setlistId}/items/${itemId}`, {
        method: 'PUT',
        body: item,
    });
    return data.item;
}

export async function deleteItem(setlistId, itemId) {
    const data = await apiRequest(`/setlists/${setlistId}/items/${itemId}`, {
        method: 'DELETE',
    });
    return data.items;
}

export async function reorderSetlist(setlistId, itemIds) {
    const data = await apiRequest(`/setlists/${setlistId}/reorder`, {
        method: 'PUT',
        body: { itemIds },
    })
    return data.items;
}
