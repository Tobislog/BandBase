const API_URL = 'http://localhost:3000/api';

export async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ email, password}),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login Fehlgeschlagen");
    }

    return data;
}

export async function logoutUser() {
    const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Logout fehlgeschlagen');
    }

    return await response.json();
}

export async function getCurrentUser() {
    const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
    });
    
    if (!response.ok) {
        return null
    }

    const data = await response.json();
    return data.user;
}

export async function registerUser(userData) {
    // userData is an Object: { email, password, firstName, lastName, color, role }
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Registrierung fehlgeschlagen");
    }

    return data;
}

export async function getUsersBatch(userIds) {
    const response = await fetch(`${API_URL}/users/batch`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        credentials: 'include',
        body: JSON.stringify({userIds}),
    });
    
    if (!response.ok) {
        throw new Error("Fehler beim Batch-Laden der User")
    }

    return await response.json();
}

