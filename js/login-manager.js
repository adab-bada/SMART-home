// Login Management System
class LoginManager {
    constructor() {
        this.isAdmin = false;
        this.failedLoginCount = 0;
        this.logoClickCount = 0;
        this.logoClickTimer = null;
        this.emergencyModeActive = false;
        this.isProcessingLogin = false;
        this.emergencyModeTimer = null;
        
        this.init();
    }
    
    init() {
        this.checkRememberedLogin();
        this.bindEvents();
        this.updateLoginStatus();
        
        addDebugLog('Login manager initialized');
    }
    
    bindEvents() {
        // Login form
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        const continueBtn = document.getElementById('continueWithoutLogin');
        const loginModal = document.getElementById('loginModal');
        
        if (loginSubmitBtn) {
            loginSubmitBtn.addEventListener('click', () => this.handleLogin());
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                loginModal.style.display = 'none';
            });
        }
        
        // Enter key support for login
        if (loginModal) {
            loginModal.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.isProcessingLogin) {
                    e.preventDefault();
                    this.handleLogin();
                }
            });
        }
        
        // Emergency recovery
        const emergencySubmitBtn = document.getElementById('emergencySubmitBtn');
        const cancelEmergencyBtn = document.getElementById('cancelEmergencyBtn');
        
        if (emergencySubmitBtn) {
            emergencySubmitBtn.addEventListener('click', () => this.handleEmergencyRecovery());
        }
        
        if (cancelEmergencyBtn) {
            cancelEmergencyBtn.addEventListener('click', () => {
                document.getElementById('emergencyModal').style.display = 'none';
                this.logoClickCount = 0;
            });
        }
        
        // Logo click for emergency mode
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => this.handleLogoClick());
        }
        
        // Password toggles
        this.bindPasswordToggles();
        
        // Login config save
        const saveLoginConfigBtn = document.getElementById('saveLoginConfigBtn');
        if (saveLoginConfigBtn) {
            saveLoginConfigBtn.addEventListener('click', () => this.saveLoginConfig());
        }
    }
    
    bindPasswordToggles() {
        const toggles = [
            { toggleId: 'toggleLoginPassword', fieldId: 'loginPassword' },
            { toggleId: 'togglePassword', fieldId: 'adminPassword' },
            { toggleId: 'toggleConfirmPassword', fieldId: 'confirmPassword' },
            { toggleId: 'toggleEmergencyPassword', fieldId: 'emergencyPassword' }
        ];
        
        toggles.forEach(({ toggleId, fieldId }) => {
            const toggle = document.getElementById(toggleId);
            const field = document.getElementById(fieldId);
            
            if (toggle && field) {
                toggle.addEventListener('click', () => {
                    const icon = toggle.querySelector('i');
                    if (field.type === 'password') {
                        field.type = 'text';
                        icon.className = 'fas fa-eye-slash';
                    } else {
                        field.type = 'password';
                        icon.className = 'fas fa-eye';
                    }
                });
            }
        });
    }
    
    handleLogin() {
        if (this.isProcessingLogin) return;
        
        this.isProcessingLogin = true;
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('rememberLogin').checked;
        
        const loginConfig = window.configManager.getLoginConfig();
        
        if (username === loginConfig.username && password === loginConfig.password) {
            this.isAdmin = true;
            window.isAdmin = true;
            
            if (remember) {
                localStorage.setItem('rememberedLogin', 'true');
                localStorage.setItem('loginExpiry', Date.now() + (7 * 24 * 60 * 60 * 1000));
            }
            
            document.getElementById('loginModal').style.display = 'none';
            this.updateLoginStatus();
            
            // Reset failed login count
            this.failedLoginCount = 0;
            this.emergencyModeActive = false;
            this.hideEmergencyMode();
            
            showToast('Login successful', 'success');
            addDebugLog('Login successful', 'success');
        } else {
            this.failedLoginCount++;
            
            if (this.failedLoginCount >= 5) {
                this.emergencyModeActive = true;
                showAutoCloseAlert('Too many failed attempts. Emergency mode activated.', 4000);
                document.getElementById('loginModal').style.display = 'none';
                this.showEmergencyMode();
            } else {
                showToast('Invalid username or password', 'error');
            }
        }
        
        this.isProcessingLogin = false;
    }
    
    handleEmergencyRecovery() {
        const username = document.getElementById('emergencyUsername').value;
        const password = document.getElementById('emergencyPassword').value;
        
        if (username === 'admin' && password === 'admin') {
            // Reset to default credentials
            window.configManager.defaultConfig.login = { username: 'admin', password: 'admin' };
            localStorage.setItem('loginConfig', JSON.stringify({ username: 'admin', password: 'admin' }));
            
            // Reset counters
            this.failedLoginCount = 0;
            this.emergencyModeActive = false;
            
            // Auto login as admin
            this.isAdmin = true;
            window.isAdmin = true;
            this.updateLoginStatus();
            
            // Close modal
            document.getElementById('emergencyModal').style.display = 'none';
            
            showToast('Emergency recovery successful', 'success');
            addDebugLog('Emergency recovery successful', 'success');
        } else {
            showAutoCloseAlert('Invalid default credentials!', 4000);
        }
    }
    
    handleLogoClick() {
        if (!this.emergencyModeActive) return;
        
        this.logoClickCount++;
        
        if (this.logoClickCount === 1) {
            this.logoClickTimer = setTimeout(() => {
                this.logoClickCount = 0;
            }, 5000);
        }
        
        if (this.logoClickCount >= 10) {
            clearTimeout(this.logoClickTimer);
            this.logoClickCount = 0;
            this.emergencyModeActive = false;
            
            document.getElementById('emergencyModal').style.display = 'flex';
            this.hideEmergencyMode();
            
            addDebugLog('Emergency recovery activated', 'info');
        }
    }
    
    showEmergencyMode() {
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.classList.add('emergency-mode');
            
            logo.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
        
        this.emergencyModeTimer = setTimeout(() => {
            this.emergencyModeActive = false;
            this.failedLoginCount = 0;
            this.hideEmergencyMode();
            addDebugLog('Emergency mode timeout', 'info');
        }, 7000);
    }
    
    hideEmergencyMode() {
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.classList.remove('emergency-mode');
        }
        
        if (this.emergencyModeTimer) {
            clearTimeout(this.emergencyModeTimer);
            this.emergencyModeTimer = null;
        }
    }
    
    checkRememberedLogin() {
        const remembered = localStorage.getItem('rememberedLogin');
        const expiry = localStorage.getItem('loginExpiry');
        
        if (remembered === 'true' && expiry && Date.now() < parseInt(expiry)) {
            this.isAdmin = true;
            window.isAdmin = true;
            this.updateLoginStatus();
            addDebugLog('Auto-logged in as admin');
        }
        
        // Reset session-based counters
        this.failedLoginCount = 0;
        this.emergencyModeActive = false;
    }
    
    updateLoginStatus() {
        const loginBtn = document.getElementById('loginBtn');
        if (!loginBtn) return;
        
        if (this.isAdmin) {
            loginBtn.innerHTML = '<i class="fas fa-user-shield"></i><span>Admin</span>';
            loginBtn.onclick = () => this.logout();
        } else {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login</span>';
            loginBtn.onclick = () => {
                document.getElementById('loginModal').style.display = 'flex';
            };
        }
    }
    
    logout() {
        this.isAdmin = false;
        window.isAdmin = false;
        localStorage.removeItem('rememberedLogin');
        localStorage.removeItem('loginExpiry');
        this.updateLoginStatus();
        
        showToast('Logged out successfully', 'info');
        addDebugLog('User logged out');
    }
    
    saveLoginConfig() {
        const newUsername = document.getElementById('adminUsername').value;
        const newPassword = document.getElementById('adminPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!newUsername || !newPassword) {
            showToast('Username dan password tidak boleh kosong', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('Konfirmasi password tidak cocok', 'error');
            return;
        }
        
        window.configManager.saveLoginConfig();
        
        // Logout and show login modal
        this.logout();
        setTimeout(() => {
            document.getElementById('loginModal').style.display = 'flex';
        }, 500);
        
        showToast('Login configuration updated', 'success');
    }
}

// Initialize login manager
window.loginManager = new LoginManager();

// Global compatibility
window.isAdmin = false;
window.handleLogin = () => window.loginManager.handleLogin();
window.logout = () => window.loginManager.logout();