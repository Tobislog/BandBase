import { apiRequest} from './apiClient';

export async function getEvents(bandId) {
    const data = await apiRequest(`/bands/${bandId}/events`);
    return data.events;
}

export async function createEvent(bandId, event) {
    const data = await apiRequest(`/bands/${bandId}/events`, {
        method: 'POST',
        body: event,
    });
    return data.event;
}

export async function updateEvent(eventId, event) {
    const data = await apiRequest(`/events/${eventId}`, {
        method: 'PUT',
        body: event,
    });
    return data.event;
}

export async function deleteEvent(eventId) {
    await apiRequest(`/events/${eventId}`, { method: 'DELETE' });
}
