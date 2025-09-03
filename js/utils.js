// Utility Functions

// Debug logging
function addDebugLog(message, type = 'info') {
    const now = new Date();
    const timeString = '[' + now.toTimeString().substr(0, 8) + ']';
    
    const debugContent = document.getElementById('debugContent');
    if (!debugContent) return;
    
    const debugEntry = document.createElement('div');
    debugEntry.className = 'debug-entry';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'debug-time';
    timeSpan.textContent = timeString;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = `debug-${type}`;
    messageSpan.textContent = ' ' + message;
    
    debugEntry.appendChild(timeSpan);
    debugEntry.appendChild(messageSpan);
    
    debugContent.appendChild(debugEntry);
    
    // Auto-scroll to bottom
    debugContent.scrollTop = debugContent.scrollHeight;
    
    // Remove old entries (keep last 50)
    while (debugContent.children.length > 50) {
        debugContent.removeChild(debugContent.children[0]);
    }
    
    // Console log for debugging
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Alert notifications
function showAlert(message, type = 'info') {
    const alert = document.getElementById('connectionAlert');
    if (!alert) return;
    
    const alertMessage = document.getElementById('alertMessage');
    if (alertMessage) {
        alertMessage.textContent = message;
    } else {
        alert.textContent = message;
    }
    
    alert.className = `alert alert-${type}`;
    alert.style.display = 'flex';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// Auto-close alert with countdown
function showAutoCloseAlert(message, duration = 4000) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg);
        color: var(--text-primary);
        padding: var(--space-5) var(--space-6);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        text-align: center;
        min-width: 300px;
        border: 2px solid var(--primary);
        backdrop-filter: blur(10px);
    `;
    
    alertDiv.innerHTML = `
        <div style="margin-bottom: var(--space-3); font-size: var(--font-size-base);">${message}</div>
        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
            Auto close in <span id="countdown">${duration/1000}</span>s
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Countdown timer
    let remaining = duration / 1000;
    const countdownEl = alertDiv.querySelector('#countdown');
    const countdownInterval = setInterval(() => {
        remaining--;
        if (countdownEl) countdownEl.textContent = remaining;
        if (remaining <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // Auto remove
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
        clearInterval(countdownInterval);
    }, duration);
    
    // Click to close
    alertDiv.onclick = () => {
        alertDiv.remove();
        clearInterval(countdownInterval);
    };
}

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

// Get day name
function getDayName(dayNumber) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayNumber] || '';
}

// Get short day name
function getShortDayName(dayNumber) {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[dayNumber] || '';
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate time format
function isValidTime(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

// Parse time to minutes
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes to time string
function minutesToTimeString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Local storage helpers
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
}

function setToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
        return false;
    }
}

// Device state management
function saveDeviceStates() {
    const systemConfig = window.configManager.getSystemConfig();
    if (systemConfig.restoreState !== 'yes') return;
    
    const states = [];
    for (let i = 1; i <= 4; i++) {
        const switchElement = document.getElementById(`switch${i}`);
        const pwmSlider = document.getElementById(`pwmSlider${i}`);
        
        if (switchElement && pwmSlider) {
            states.push({
                state: switchElement.checked,
                pwm: parseInt(pwmSlider.value)
            });
        }
    }
    
    setToStorage('deviceStates', states);
    addDebugLog('Device states saved');
}

function loadDeviceStates() {
    const systemConfig = window.configManager.getSystemConfig();
    if (systemConfig.restoreState !== 'yes') return;
    
    const states = getFromStorage('deviceStates', []);
    
    setTimeout(() => {
        states.forEach((state, index) => {
            const switchElement = document.getElementById(`switch${index + 1}`);
            const pwmSlider = document.getElementById(`pwmSlider${index + 1}`);
            const pwmValue = document.getElementById(`pwmValue${index + 1}`);
            
            if (switchElement && pwmSlider && pwmValue) {
                switchElement.checked = state.state;
                pwmSlider.value = state.pwm;
                pwmValue.textContent = `${state.pwm}%`;
                
                // Enable intensity control if PWM is not 0 or 100
                if (state.pwm > 0 && state.pwm < 100) {
                    const intensityToggle = document.getElementById(`intensityToggle${index + 1}`);
                    const pwmControl = document.getElementById(`pwmControl${index + 1}`);
                    if (intensityToggle && pwmControl) {
                        intensityToggle.checked = true;
                        pwmControl.classList.remove('hidden');
                    }
                }
            }
        });
        
        addDebugLog('Device states restored');
    }, 100);
}

// Error handling
function handleError(error, context = '') {
    const message = `Error${context ? ' in ' + context : ''}: ${error.message}`;
    addDebugLog(message, 'error');
    showToast(message, 'error');
    console.error(error);
}

// Network status detection
function checkNetworkStatus() {
    if (!navigator.onLine) {
        showToast('No internet connection', 'warning');
        return false;
    }
    return true;
}

// Initialize network status monitoring
window.addEventListener('online', () => {
    showToast('Internet connection restored', 'success');
    addDebugLog('Network connection restored', 'success');
});

window.addEventListener('offline', () => {
    showToast('Internet connection lost', 'warning');
    addDebugLog('Network connection lost', 'warning');
});

// Export utility functions
window.utils = {
    addDebugLog,
    showToast,
    showAlert,
    showAutoCloseAlert,
    formatTime,
    getDayName,
    getShortDayName,
    debounce,
    throttle,
    generateId,
    isValidEmail,
    isValidTime,
    parseTimeToMinutes,
    minutesToTimeString,
    getFromStorage,
    setToStorage,
    saveDeviceStates,
    loadDeviceStates,
    handleError,
    checkNetworkStatus
};