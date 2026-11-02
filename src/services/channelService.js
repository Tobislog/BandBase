import { apiRequest } from './apiClient';

export async function getChannels(bandId) {
    const data = await apiRequest(`/bands/${bandId}/channels`);
    return data.channels;
}

export async function getMessages(channelId) {
    const data = await apiRequest(`/channels/${channelId}/messages`);
    return data.messages;
}

export async function sendMessage(channelId, content) {
    const data = await apiRequest(`/channels/${channelId}/messages`, {
        method: 'POST',
        body: { content },
    });
    return data.message;
}
