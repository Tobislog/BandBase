import { apiRequest } from "./apiClient";

export async function getBands() {
    const data = await apiRequest('/bands');
    return data.bands;
}

export async function getMemberships(bandId) {
    const data = await apiRequest(`/bands/${bandId}/memberships`);
    return data.memberships;
}

export async function updateMembershipRole(bandId, userId, role) {
    const data = await apiRequest(`/bands/${bandId}/memberships/${userId}`, {method: 'PATCH', body: { role }});
    return data.membership;
}
