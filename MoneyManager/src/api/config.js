const API_CONFIG = {
    BASE_URL: 'http://localhost:8080',
    API_PREFIX: '/api',
    get FULL_API_URL() {
        return `${this.BASE_URL}${this.API_PREFIX}`;
    },
    TIMEOUT: 10000,
    WITH_CREDENTIALS: true
};

export default API_CONFIG;