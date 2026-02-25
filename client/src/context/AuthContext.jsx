import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('gz_token');
        if (token) {
            getProfile()
                .then(res => setUser(res.data))
                .catch(() => { localStorage.removeItem('gz_token'); setUser(null); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const loginUser = (token, userData) => {
        localStorage.setItem('gz_token', token);
        setUser(userData);
    };

    const logoutUser = () => {
        localStorage.removeItem('gz_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
