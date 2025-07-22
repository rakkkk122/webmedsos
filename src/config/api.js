const API_BASE_URL = 'http://85.209.163.237:5000';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/api/admin/login`,
    REGISTER: `${API_BASE_URL}/api/admin/register`,
    
    // Dashboard endpoints
    GET_COUNTS: `${API_BASE_URL}/api/counts`,
    
    // Event endpoints
    GET_EVENTS: `${API_BASE_URL}/api/event`,
    CREATE_EVENT: `${API_BASE_URL}/api/event`,
    UPDATE_EVENT: (id) => `${API_BASE_URL}/api/event/${id}`,
    DELETE_EVENT: (id) => `${API_BASE_URL}/api/event/${id}`,
    
    // News endpoints
    GET_NEWS: `${API_BASE_URL}/api/news`,
    CREATE_NEWS: `${API_BASE_URL}/api/news`,
    UPDATE_NEWS: (id) => `${API_BASE_URL}/api/news/${id}`,
    DELETE_NEWS: (id) => `${API_BASE_URL}/api/news/${id}`,
};

export default API_ENDPOINTS; 