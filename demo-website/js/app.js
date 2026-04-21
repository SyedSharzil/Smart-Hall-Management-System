// ===== API CONFIGURATION =====
const API_URL = 'http://localhost:5000';

console.log('🚀 App initialized - API URL:', API_URL);

// ===== UTILITY FUNCTIONS =====

function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <span class="spinner"></span>
                <span>${message}</span>
            </div>
        `;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error-message">
                ❌ ${message}
            </div>
        `;
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="success-message">
                ✅ ${message}
            </div>
        `;
    }
}

// Date/Time Formatting
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString();
}

// ===== API HELPER FUNCTIONS =====

async function apiCall(endpoint, options = {}) {
    try {
        const url = `${API_URL}${endpoint}`;
        console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Response:', data);
        return data;

    } catch (error) {
        console.error('❌ API call failed:', error);
        throw error;
    }
}

// ===== CHECK API STATUS =====
async function checkAPIStatus() {
    try {
        console.log('🔍 Checking API status...');
        
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            console.error(`❌ HTTP error! status: ${response.status}`);
            showAPIStatus(false);
            return false;
        }

        const data = await response.json();
        console.log('✅ API Response:', data);

        // Check if status is healthy
        if (data.status === 'healthy' || data.status === 'online') {
            console.log('✅ API is ONLINE');
            showAPIStatus(true);
            return true;
        } else {
            console.warn('⚠️ API returned unexpected status:', data.status);
            showAPIStatus(false);
            return false;
        }

    } catch (error) {
        console.error('❌ API offline:', error.message);
        showAPIStatus(false);
        return false;
    }
}

// ===== SHOW API STATUS =====
function showAPIStatus(isOnline) {
    // Remove existing status
    const existing = document.getElementById('api-status-indicator');
    if (existing) existing.remove();

    // Create new status
    const indicator = document.createElement('div');
    indicator.id = 'api-status-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-size: 14px;
    `;

    if (isOnline) {
        indicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        indicator.style.color = 'white';
        indicator.innerHTML = '<span>🟢</span> API Online';
        console.log('✅ Status indicator: ONLINE');
    } else {
        indicator.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        indicator.style.color = 'white';
        indicator.innerHTML = '<span>🔴</span> API Offline';
        console.log('❌ Status indicator: OFFLINE');
    }

    document.body.appendChild(indicator);
}

// ===== SAFE FETCH WRAPPER =====
async function safeFetch(url, options = {}) {
    try {
        console.log(`📡 Fetching: ${url}`);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response. API might be offline.');
        }

        const data = await response.json();
        console.log('✅ Data received:', data);
        return data;

    } catch (error) {
        console.error('❌ Fetch error:', error.message);

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showNotification('❌ Cannot connect to API. Make sure it\'s running on http://localhost:5000', 'error');
        } else {
            showNotification(`❌ Error: ${error.message}`, 'error');
        }

        return { success: false, error: error.message };
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        font-weight: bold;
    `;

    if (type === 'error') {
        notification.style.background = '#f8d7da';
        notification.style.color = '#721c24';
        notification.style.border = '2px solid #f5c6cb';
    } else if (type === 'success') {
        notification.style.background = '#d4edda';
        notification.style.color = '#155724';
        notification.style.border = '2px solid #c3e6cb';
    } else {
        notification.style.background = '#d1ecf1';
        notification.style.color = '#0c5460';
        notification.style.border = '2px solid #bee5eb';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== ADD ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    .loading-spinner {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: center;
        padding: 20px;
    }
    .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .error-message {
        padding: 15px;
        background: #f8d7da;
        border: 2px solid #f5c6cb;
        border-radius: 5px;
        color: #721c24;
        text-align: center;
    }
    .success-message {
        padding: 15px;
        background: #d4edda;
        border: 2px solid #c3e6cb;
        border-radius: 5px;
        color: #155724;
        text-align: center;
    }
`;
document.head.appendChild(style);

// ===== INITIALIZATION =====
console.log('📄 app.js loaded');

// Check API status on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Page loaded, checking API...');
    checkAPIStatus();

    // Recheck every 30 seconds
    setInterval(() => {
        console.log('🔄 Rechecking API status...');
        checkAPIStatus();
    }, 30000);
});

// Export globally
window.API_URL = API_URL;
window.safeFetch = safeFetch;
window.checkAPIStatus = checkAPIStatus;
window.showNotification = showNotification;
window.apiCall = apiCall;
window.showLoading = showLoading;
window.showError = showError;
window.showSuccess = showSuccess;
window.formatDateTime = formatDateTime;
window.formatDate = formatDate;

console.log('✅ app.js ready - All functions exported');