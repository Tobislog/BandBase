const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '');

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function parseResponse(response) {
    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text || null;
}

export async function apiRequest( path, { method = 'GET', body, authEvent = true } = {}) {
    const headers = {};

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            credentials: 'include',
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(0, 'Networkerror');
    }

    const data = await parseResponse(response);

    if (!response.ok) {
        if (response.status === 401 && authEvent && typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        const message = data && typeof data === 'object' && data.error ? data.error : `Request failed (${response.status})`;
        throw new ApiError(response.status, message);
    }
    return data;
}
