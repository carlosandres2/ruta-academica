import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ruta-academica-backend-production.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;