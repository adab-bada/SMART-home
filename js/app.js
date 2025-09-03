// Main Application Controller
class SmartHomeApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            addDebugLog('Initializing Smart Home Controller...');
            
            // Wait for all managers to be ready
            this.waitForManagers().then(() => {
                this.setupApplication();
                this.isInitialized = true;
                addDebugLog('Smart Home Controller initialized successfully', 'success');
            });
            
        } catch (error) {
            handleError(error, 'app initialization');
        }
    }
    
    async waitForManagers() {
        // Wait for essential managers
        const checkManagers = () => {
            return window.configManager && 
                   window.themeManager && 
                   window.deviceManager && 
                   window.mqttClient && 
                   window.scheduleManager && 
                   window.loginManager && 
                   window.navigationManager;
        };
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!checkManagers() && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!checkManagers()) {
            throw new Error('Failed to initialize all managers');
        }
        
        addDebugLog('All managers ready');
    }
    
    setupApplication() {
        // Load device states if restore is enabled
        loadDeviceStates();
        
        // Setup debug panel toggle
        this.setupDebugPanel();
        
        // Setup PWA installer
        this.setupPWA();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup auto-save
        this.setupAutoSave();
        
        addDebugLog('Application setup complete');
    }
    
    setupDebugPanel() {
        const toggleDebug = document.getElementById('toggleDebug');
        const debugPanel = document.getElementById('debugPanel');
        
        if (toggleDebug && debugPanel) {
            toggleDebug.addEventListener('click', () => {
                debugPanel.classList.toggle('hidden');
                const icon = toggleDebug.querySelector('i');
                const span = toggleDebug.querySelector('span');
                
                if (debugPanel.classList.contains('hidden')) {
                    icon.className = 'fas fa-eye';
                    span.textContent = 'Tampilkan';
                } else {
                    icon.className = 'fas fa-eye-slash';
                    span.textContent = 'Sembunyikan';
                }
            });
        }
    }
    
    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        addDebugLog('Service Worker registered', 'success');
                    })
                    .catch(error => {
                        addDebugLog('Service Worker registration failed: ' + error.message, 'error');
                    });
            });
        }
        
        // PWA install prompt
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            const installBtn = document.createElement('button');
            installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
            installBtn.className = 'btn btn-primary install-btn';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 30px;
                z-index: 1001;
                box-shadow: var(--shadow-lg);
            `;
            
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        addDebugLog('PWA installation accepted', 'success');
                    }
                    
                    deferredPrompt = null;
                    installBtn.remove();
                }
            });
            
            document.body.appendChild(installBtn);
        });
        
        window.addEventListener('appinstalled', () => {
            addDebugLog('PWA installed successfully', 'success');
            showToast('App installed successfully!', 'success');
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + number keys for switch control
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const switchNum = parseInt(e.key);
                toggleSwitch(switchNum);
                addDebugLog(`Keyboard shortcut: Switch ${switchNum} toggled`);
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
                
                // Close theme panel
                const themePanel = document.getElementById('themePanel');
                if (themePanel && themePanel.classList.contains('active')) {
                    themePanel.classList.remove('active');
                }
            }
        });
    }
    
    setupAutoSave() {
        // Auto-save device states every 30 seconds
        setInterval(() => {
            saveDeviceStates();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            saveDeviceStates();
        });
    }
    
    // Health check
    performHealthCheck() {
        const checks = {
            configManager: !!window.configManager,
            themeManager: !!window.themeManager,
            deviceManager: !!window.deviceManager,
            mqttClient: !!window.mqttClient,
            scheduleManager: !!window.scheduleManager,
            loginManager: !!window.loginManager,
            navigationManager: !!window.navigationManager
        };
        
        const failedChecks = Object.entries(checks)
            .filter(([name, status]) => !status)
            .map(([name]) => name);
        
        if (failedChecks.length > 0) {
            addDebugLog(`Health check failed: ${failedChecks.join(', ')}`, 'error');
            return false;
        }
        
        addDebugLog('Health check passed', 'success');
        return true;
    }
    
    // Restart application
    restart() {
        addDebugLog('Restarting application...');
        location.reload();
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        window.smartHomeApp = new SmartHomeApp();
    }, 100);
});

// Global functions for debugging
window.healthCheck = () => {
    if (window.smartHomeApp) {
        return window.smartHomeApp.performHealthCheck();
    }
    return false;
};

window.restartApp = () => {
    if (window.smartHomeApp) {
        window.smartHomeApp.restart();
    }
};

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    addDebugLog(`Uncaught error: ${e.message}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    addDebugLog(`Unhandled promise rejection: ${e.reason}`, 'error');
});