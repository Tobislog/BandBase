import { apiRequest } from "./apiClient";

export async function loginUser(email, password) {
    const data = await apiRequest('/login', {
        method: 'POST',
        body: {email, password},
        authEvent: false,
    });
    return data.user;
}

export async function logoutUser() {
    await apiRequest('/logout', {
        method: 'POST',
        authEvent: false,
    });
}

export async function getCurrentUser() {
    try {
        const data = await apiRequest('/me', { authEvent: false });
        return data.user;
    } catch (err) {
        if (err.status === 401) return null;
        throw err;
    }
}

export async function registerUser(userData) {
    return apiRequest('/register', {
        method: 'POST',
        body: userData,
        authEvent: false,
    });
}

export async function getUsersBatch(userIds) {
    return apiRequest('/users/batch', {
        method: 'POST',
        body: { userIds },
    });
}
