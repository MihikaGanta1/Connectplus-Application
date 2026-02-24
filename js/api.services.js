// ===== SIMPLIFIED API SERVICE =====
console.log('📡 Loading API Service...');

// Define API_CONFIG directly
const API_CONFIG = {
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

console.log('✅ API_CONFIG defined:', API_CONFIG);

// Simple fetch wrapper
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = API_CONFIG.baseURL + endpoint;
    console.log(`🌐 Making ${method} request to:`, url);
    
    const options = {
        method: method,
        headers: API_CONFIG.headers,
        mode: 'cors'
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('✅ Response:', result);
        return result;
    } catch (error) {
        console.error('❌ Fetch error:', error);
        throw error;
    }
}

// Create API object
const api = {
    get: (endpoint) => apiRequest(endpoint, 'GET'),
    post: (endpoint, data) => apiRequest(endpoint, 'POST', data),
    put: (endpoint, data) => apiRequest(endpoint, 'PUT', data),
    delete: (endpoint) => apiRequest(endpoint, 'DELETE')
};

// Attach to window
window.API_CONFIG = API_CONFIG;
window.api = api;

console.log('✅ API Service loaded successfully');
console.log('window.API_CONFIG:', window.API_CONFIG);
console.log('window.api:', window.api);