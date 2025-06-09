import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/auth',
    withCredentials: true, // This ensures cookies are sent with requests
});

export default api;