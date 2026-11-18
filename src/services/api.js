import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    try {
        if (typeof localStorage !== 'undefined') {
            const sesionGuardada = localStorage.getItem('rutaAcademicaSesion');

            if (sesionGuardada) {
                const sesion = JSON.parse(sesionGuardada);

                if (sesion.token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${sesion.token}`;
                }
            }
        }
    } catch (error) {
        console.error('No fue posible recuperar la sesión.');
    }

    return config;
});

export default api;
