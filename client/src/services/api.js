import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gz_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/me');
export const toggleFavorite = (gameId) => api.put('/auth/favorites', { gameId });

export const getGames = (params) => api.get('/games', { params });
export const getGameById = (id) => api.get(`/games/${id}`);

export const saveProgress = (data) => api.post('/progress/save', data);
export const getUserProgress = () => api.get('/progress/me');
export const getGameProgress = (gameId) => api.get(`/progress/me/${gameId}`);

export const getLeaderboard = (gameId) => api.get(`/leaderboard/${gameId}`);

export default api;
