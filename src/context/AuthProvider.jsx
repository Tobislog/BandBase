import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((userData) => setUser(userData))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, []);

    const login = async (email, password) => {
        await loginUser(email, password);
        const userData = await getCurrentUser();
        setUser(userData);
    }

    const logout = async () => {
        await logoutUser();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
