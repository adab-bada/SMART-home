// Login Management
// Initialize admin status
window.isAdmin = false;

// Emergency recovery system - Session-based (not persistent)
let failedLoginCount = 0; // Always starts at 0 on page load
let logoClickCount = 0;
let logoClickTimer = null;
let emergencyModeActive = false;
let isProcessingLogin = false; // Prevent multiple login attempts
let emergencyModeTimer = null; // Timer for emergency mode timeout

function handleLogin() {
    // Prevent multiple simultaneous login attempts
    if (isProcessingLogin) {
        console.log('Login already in progress, ignoring duplicate call');
        return;
    }
    
    console.log(`=== LOGIN ATTEMPT START ===`);
    console.log(`Current failedLoginCount BEFORE: ${failedLoginCount}`);
    console.log(`Emergency mode active: ${emergencyModeActive}`);
    
    isProcessingLogin = true;
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberLogin').checked;
    
    // Get current login config
    const loginConfig = loadLoginConfig();
    
    // Check credentials
    if (username === loginConfig.username && password === loginConfig.password) {
        window.isAdmin = true;
        
        if (remember) {
            localStorage.setItem('rememberedLogin', 'true');
            localStorage.setItem('loginExpiry', Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        }
        
        document.getElementById('loginModal').style.display = 'none';
        updateLoginStatus();
        // Reset failed login count on success
        failedLoginCount = 0;
        emergencyModeActive = false;
        hideEmergencyMode();
        console.log('Login successful - reset failed count to 0');
        
        // Reset processing flag
        isProcessingLogin = false;
    } else {
        // Increment failed login count (session-based only)
        failedLoginCount++;
        console.log(`=== FAILED LOGIN ===`);
        console.log(`Failed login attempt: ${failedLoginCount}/5`);
        console.log(`Emergency mode was: ${emergencyModeActive}`);
        
        // Reset processing flag before showing alert
        isProcessingLogin = false;
        
        if (failedLoginCount >= 5) {
            console.log(`TRIGGERING EMERGENCY MODE at count: ${failedLoginCount}`);
            emergencyModeActive = true;
            showAutoCloseAlert('Terlalu banyak percobaan gagal. Mode emergency diaktifkan.', 4000);
            document.getElementById('loginModal').style.display = 'none';
            showEmergencyMode();
        } else {
            console.log(`Silent count: ${failedLoginCount}/5 - no popup`);
        }
        console.log(`=== LOGIN ATTEMPT END ===`);
    }
}

function checkRememberedLogin() {
    const remembered = localStorage.getItem('rememberedLogin');
    const expiry = localStorage.getItem('loginExpiry');
    
    if (remembered === 'true' && expiry && Date.now() < parseInt(expiry)) {
        window.isAdmin = true;
        updateLoginStatus();
        console.log('Auto-logged in as admin');
    }
    
    // Session-based counter - always starts at 0
    failedLoginCount = 0;
    emergencyModeActive = false;
    console.log('Session-based counter initialized at 0');
}

// Logo click handler for emergency recovery
function handleLogoClick() {
    if (!emergencyModeActive) return;
    
    logoClickCount++;
    
    // Start timer on first click
    if (logoClickCount === 1) {
        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
            console.log('Logo click timeout - resetting counter');
        }, 5000);
    }
    
    console.log(`Logo clicked: ${logoClickCount}/10`);
    
    // Check if 10 clicks reached
    if (logoClickCount >= 10) {
        clearTimeout(logoClickTimer);
        logoClickCount = 0;
        emergencyModeActive = false;
        
        // Show emergency modal
        document.getElementById('emergencyModal').style.display = 'flex';
        hideEmergencyMode();
        console.log('Emergency recovery activated!');
    }
}

// Handle emergency recovery
function handleEmergencyRecovery() {
    const username = document.getElementById('emergencyUsername').value;
    const password = document.getElementById('emergencyPassword').value;
    
    if (username === 'admin' && password === 'admin') {
        // Reset to default credentials
        saveLoginConfig('admin', 'admin');
        
        // Reset counters
        failedLoginCount = 0;
        emergencyModeActive = false;
        console.log('Emergency recovery successful - reset all counters');
        
        // Auto login as admin
        window.isAdmin = true;
        updateLoginStatus();
        
        // Close modal
        document.getElementById('emergencyModal').style.display = 'none';
        
        // Silent success for recovery - already hidden hint when modal opened
    } else {
        showAutoCloseAlert('Kredensial default salah!', 4000);
    }
}

// Reset failed login counter (for debugging)
function resetFailedLoginCounter() {
    failedLoginCount = 0;
    emergencyModeActive = false;
    hideEmergencyMode();
    console.log('Failed login counter manually reset to 0');
}

// Auto-close alert function
function showAutoCloseAlert(message, duration = 4000) {
    // Create custom alert that auto-closes
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--card-bg);
        color: var(--dark);
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        min-width: 300px;
        border: 2px solid var(--primary);
    `;
    alertDiv.innerHTML = `
        <div style="margin-bottom: 15px; font-size: 16px;">${message}</div>
        <div style="font-size: 12px; color: var(--gray);">Auto close in <span id="countdown">${duration/1000}</span>s</div>
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
    
    // Auto remove after duration
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
        clearInterval(countdownInterval);
    }, duration);
    
    // Click to close immediately
    alertDiv.onclick = () => {
        alertDiv.remove();
        clearInterval(countdownInterval);
    };
}

// Show emergency mode visual feedback
function showEmergencyMode() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.classList.add('emergency-mode');
        
        // Auto-scroll to logo for emergency mode
        logo.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Add pulsing effect to draw attention
        logo.style.transform = 'scale(1.2)';
        setTimeout(() => {
            if (logo.classList.contains('emergency-mode')) {
                logo.style.transform = 'scale(1)';
            }
        }, 500);
    }
    
    // Set 7 second timeout for emergency mode
    emergencyModeTimer = setTimeout(() => {
        emergencyModeActive = false;
        failedLoginCount = 0; // Reset counter after emergency timeout
        hideEmergencyMode();
        console.log('Emergency mode timeout - deactivated and counter reset');
    }, 7000);
}

// Hide emergency mode visual feedback
function hideEmergencyMode() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.classList.remove('emergency-mode');
        logo.style.transform = ''; // Reset transform
    }
    
    // Clear emergency mode timer
    if (emergencyModeTimer) {
        clearTimeout(emergencyModeTimer);
        emergencyModeTimer = null;
    }
}

function updateLoginStatus() {
    const loginBtn = document.getElementById('loginBtn');
    if (window.isAdmin) {
        loginBtn.innerHTML = '<i class="fas fa-user-shield"></i><span>Admin</span>';
        loginBtn.onclick = logout;
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login</span>';
        loginBtn.onclick = () => document.getElementById('loginModal').style.display = 'flex';
    }
}

function logout() {
    window.isAdmin = false;
    localStorage.removeItem('rememberedLogin');
    localStorage.removeItem('loginExpiry');
    updateLoginStatus();
    // Silent logout - no alert
}

// Load login credentials
function loadLoginConfig() {
    const saved = localStorage.getItem('loginConfig');
    if (saved) {
        const config = JSON.parse(saved);
        return { username: config.username || 'admin', password: config.password || 'admin' };
    }
    return { username: 'admin', password: 'admin' };
}

// Save login credentials
function saveLoginConfig(username, password) {
    const config = { username, password };
    localStorage.setItem('loginConfig', JSON.stringify(config));
}

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INITIALIZING LOGIN SYSTEM ===');
    
    // Session-based counter - no need for localStorage cleanup
    console.log(`Initial failedLoginCount: ${failedLoginCount}`);
    
    // Check remembered login
    checkRememberedLogin();
    
    // Bind login button (remove any existing handlers first)
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    if (loginSubmitBtn) {
        // Remove any existing onclick handlers
        loginSubmitBtn.onclick = null;
        loginSubmitBtn.removeEventListener('click', handleLogin); // Remove if exists
        // Add new handler
        loginSubmitBtn.onclick = handleLogin;
        console.log('Login button handler bound');
    }
    
    // Add Enter key support for login form
    const loginForm = document.getElementById('loginModal');
    if (loginForm) {
        loginForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !isProcessingLogin) {
                e.preventDefault();
                handleLogin();
            }
        });
    }
    
    // Bind continue without login
    const continueBtn = document.getElementById('continueWithoutLogin');
    if (continueBtn) {
        continueBtn.onclick = () => {
            document.getElementById('loginModal').style.display = 'none';
        };
    }
    
    // Emergency password toggle
    const toggleEmergencyPassword = document.getElementById('toggleEmergencyPassword');
    if (toggleEmergencyPassword) {
        toggleEmergencyPassword.onclick = () => {
            const emergencyPasswordField = document.getElementById('emergencyPassword');
            const icon = toggleEmergencyPassword.querySelector('i');
            if (emergencyPasswordField.type === 'password') {
                emergencyPasswordField.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                emergencyPasswordField.type = 'password';
                icon.className = 'fas fa-eye';
            }
        };
    }
    
    // Emergency recovery handlers
    const emergencySubmitBtn = document.getElementById('emergencySubmitBtn');
    if (emergencySubmitBtn) {
        emergencySubmitBtn.onclick = handleEmergencyRecovery;
    }
    
    const cancelEmergencyBtn = document.getElementById('cancelEmergencyBtn');
    if (cancelEmergencyBtn) {
        cancelEmergencyBtn.onclick = () => {
            document.getElementById('emergencyModal').style.display = 'none';
            // No hint banner to show
            logoClickCount = 0;
        };
    }
    
    // Logo click handler for emergency mode
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', handleLogoClick);
        logo.style.cursor = 'pointer';
    }
    
    // Login password toggle
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    if (toggleLoginPassword) {
        toggleLoginPassword.onclick = () => {
            const loginPasswordField = document.getElementById('loginPassword');
            const icon = toggleLoginPassword.querySelector('i');
            if (loginPasswordField.type === 'password') {
                loginPasswordField.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                loginPasswordField.type = 'password';
                icon.className = 'fas fa-eye';
            }
        };
    }
    
    // Bind modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });
    
    // Load login config to form
    const loginConfig = loadLoginConfig();
    const adminUsernameField = document.getElementById('adminUsername');
    const adminPasswordField = document.getElementById('adminPassword');
    if (adminUsernameField) adminUsernameField.value = loginConfig.username;
    if (adminPasswordField) adminPasswordField.value = loginConfig.password;
    
    // Bind save login config
    const saveLoginConfigBtn = document.getElementById('saveLoginConfigBtn');
    if (saveLoginConfigBtn) {
        saveLoginConfigBtn.onclick = () => {
            const newUsername = document.getElementById('adminUsername').value;
            const newPassword = document.getElementById('adminPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!newUsername || !newPassword) {
                alert('Username dan password tidak boleh kosong');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('Konfirmasi password tidak cocok');
                return;
            }
            
            saveLoginConfig(newUsername, newPassword);
            
            // Silent logout and show login modal
            logout();
            setTimeout(() => {
                document.getElementById('loginModal').style.display = 'flex';
            }, 500);
        };
    }
    
    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    
    if (togglePassword) {
        togglePassword.onclick = () => {
            const passwordField = document.getElementById('adminPassword');
            const icon = togglePassword.querySelector('i');
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordField.type = 'password';
                icon.className = 'fas fa-eye';
            }
        };
    }
    
    if (toggleConfirmPassword) {
        toggleConfirmPassword.onclick = () => {
            const confirmField = document.getElementById('confirmPassword');
            const icon = toggleConfirmPassword.querySelector('i');
            if (confirmField.type === 'password') {
                confirmField.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                confirmField.type = 'password';
                icon.className = 'fas fa-eye';
            }
        };
    }
    
    // Config tabs handling
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.config-content').forEach(c => c.classList.remove('active'));
            
            // Add active to clicked tab
            tab.classList.add('active');
            const target = tab.dataset.target;
            const content = document.getElementById(target);
            if (content) content.classList.add('active');
        });
    });
    
    // Initial login status
    updateLoginStatus();
});

// Global functions (only if not already defined)
if (!window.handleLogin) {
    window.handleLogin = handleLogin;
}
if (!window.logout) {
    window.logout = logout;
}
if (!window.showAutoCloseAlert) {
    window.showAutoCloseAlert = showAutoCloseAlert;
}