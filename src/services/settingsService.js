import { apiRequest } from "./apiClient";

export async function getRegistrationStatus() {
    const data = await apiRequest('/registration', { authEvent: false });
    return data.enabled;
}

export async function updateRegistrationStatus(enabled) {
    const data = await apiRequest('/registration', { method: 'PATCH', body: { enabled } });
    return data.enabled;
}
