// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.currentAnimation = 'flip';
        this.customColors = {
            primary: '#4361ee',
            secondary: '#3a0ca3',
            success: '#4cc9f0'
        };
        this.init();
    }

    init() {
        this.loadThemeSettings();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
        this.applySwitchAnimation(this.currentAnimation);
    }

    setupEventListeners() {
        // Theme FAB toggle
        document.getElementById('themeFab').addEventListener('click', () => {
            this.toggleThemePanel();
        });

        // Theme preset selection
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const theme = preset.dataset.theme;
                this.selectTheme(theme);
            });
        });

        // Animation selection
        document.getElementById('switchAnimation').addEventListener('change', (e) => {
            this.applySwitchAnimation(e.target.value);
        });

        // Custom colors
        document.getElementById('applyCustomColors').addEventListener('click', () => {
            this.applyCustomColors();
        });

        // Close theme panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                this.closeThemePanel();
            }
        });
    }

    toggleThemePanel() {
        const panel = document.getElementById('themePanel');
        panel.classList.toggle('active');
    }

    closeThemePanel() {
        const panel = document.getElementById('themePanel');
        panel.classList.remove('active');
    }

    selectTheme(theme) {
        // Update active preset
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');

        this.applyTheme(theme);
        this.currentTheme = theme;
        this.saveThemeSettings();
    }

    applyTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('light-theme', 'dark-theme', 'modern-theme', 'neon-theme', 'classic-theme');
        
        // Apply new theme class
        if (theme !== 'light') {
            document.body.classList.add(`${theme}-theme`);
        }

        // Update theme toggle icon
        const themeIcon = document.querySelector('#themeToggle i');
        if (theme === 'dark' || theme === 'neon') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }

        addDebugLog(`Theme changed to: ${theme}`, 'success');
    }

    applySwitchAnimation(animation) {
        this.currentAnimation = animation;
        
        // Update all switch elements
        document.querySelectorAll('.switch-3d').forEach(switchEl => {
            switchEl.classList.remove('flip', 'rotate', 'scale', 'slide');
            switchEl.classList.add(animation);
        });

        // Update animation selector
        document.getElementById('switchAnimation').value = animation;
        
        this.saveThemeSettings();
        addDebugLog(`Switch animation changed to: ${animation}`, 'success');
    }

    applyCustomColors() {
        const primary = document.getElementById('customPrimary').value;
        const secondary = document.getElementById('customSecondary').value;
        const success = document.getElementById('customSuccess').value;

        // Apply custom CSS variables
        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--secondary', secondary);
        document.documentElement.style.setProperty('--success', success);

        this.customColors = { primary, secondary, success };
        this.saveThemeSettings();
        
        showToast('Custom colors applied!', 'success');
        addDebugLog('Custom colors applied', 'success');
    }

    saveThemeSettings() {
        const settings = {
            theme: this.currentTheme,
            animation: this.currentAnimation,
            customColors: this.customColors
        };
        localStorage.setItem('themeSettings', JSON.stringify(settings));
    }

    loadThemeSettings() {
        const saved = localStorage.getItem('themeSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.currentTheme = settings.theme || 'light';
            this.currentAnimation = settings.animation || 'flip';
            this.customColors = settings.customColors || this.customColors;

            // Update UI elements
            document.getElementById('switchAnimation').value = this.currentAnimation;
            document.getElementById('customPrimary').value = this.customColors.primary;
            document.getElementById('customSecondary').value = this.customColors.secondary;
            document.getElementById('customSuccess').value = this.customColors.success;

            // Apply custom colors if they exist
            if (settings.customColors) {
                document.documentElement.style.setProperty('--primary', this.customColors.primary);
                document.documentElement.style.setProperty('--secondary', this.customColors.secondary);
                document.documentElement.style.setProperty('--success', this.customColors.success);
            }
        }
    }
}

// Initialize theme manager
let themeManager;

// Debugging utility
function addDebugLog(message, type = 'info') {
    const now = new Date();
    const timeString = '[' + now.toTimeString().substr(0, 8) + ']';
    
    const debugEntry = document.createElement('div');
    debugEntry.className = 'debug-entry';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'debug-time';
    timeSpan.textContent = timeString;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'debug-' + type;
    messageSpan.textContent = ' ' + message;
    
    debugEntry.appendChild(timeSpan);
    debugEntry.appendChild(messageSpan);
    
    const debugPanel = document.getElementById('debugPanel');
    debugPanel.appendChild(debugEntry);
    
    // Scroll to bottom
    debugPanel.scrollTop = debugPanel.scrollHeight;
    
    // Hapus log lama jika terlalu banyak
    if (debugPanel.children.length > 20) {
        debugPanel.removeChild(debugPanel.children[0]);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Konfigurasi default
const defaultConfig = {
    protocol: 'wss',
    broker: 'test.mosquitto.org',
    port: 8081,
    path: '/mqtt',
    clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
    topicControl: 'home/light/control',
    topicStatus: 'home/light/status',
    devices: [
        { id: 1, name: 'Lampu Utama', icon: 'lightbulb', restoreState: true },
        { id: 2, name: 'Lampu Kamar', icon: 'lightbulb', restoreState: true },
        { id: 3, name: 'Lampu Taman', icon: 'lightbulb', restoreState: true },
        { id: 4, name: 'Lampu Garasi', icon: 'lightbulb', restoreState: true }
    ],
    system: {
        restoreState: 'yes',
        autoConnect: 'no',
        autoReconnect: 'yes'
    }
};

// Variabel global
let client = null;
let isConnected = false;
let schedules = [];
let intensityEnabled = [false, false, false, false];
let deviceStates = [
    { state: false, pwm: 0 },
    { state: false, pwm: 0 },
    { state: false, pwm: 0 },
    { state: false, pwm: 0 }
];
let reconnectInterval = null;
let lastPublishTime = 0;
const PUBLISH_INTERVAL = 1000;
let isExplicitDisconnect = false;

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    try {
        addDebugLog('Aplikasi dimuat. Menginisialisasi...');
        
        // Initialize theme manager
        themeManager = new ThemeManager();
        addDebugLog('Theme manager berhasil diinisialisasi');
        
        // Render devices first
        if (typeof renderDevices === 'function') {
            renderDevices();
            addDebugLog('Perangkat berhasil dirender');
        }
        
        // Check MQTT library (optional for basic functionality)
        if (typeof mqtt !== 'undefined') {
            addDebugLog('MQTT library berhasil dimuat');
            
            // Load config dan auto-connect
            if (typeof loadConfig === 'function') {
                loadConfig();
                addDebugLog('Konfigurasi berhasil dimuat');
            }
            
            // Inisialisasi event listeners
            if (typeof initEventListeners === 'function') {
                initEventListeners();
                addDebugLog('Event listeners berhasil diinisialisasi');
            }
            
            // Update UI status
            if (typeof updateConnectionStatus === 'function') {
                updateConnectionStatus();
            }
        } else {
            addDebugLog('MQTT library tidak ditemukan - mode offline', 'info');
        }
        
        // Initialize debug panel toggle
        const toggleDebug = document.getElementById('toggleDebug');
        const debugPanel = document.getElementById('debugPanel');
        if (toggleDebug && debugPanel) {
            toggleDebug.addEventListener('click', () => {
                debugPanel.classList.toggle('hidden');
                const icon = toggleDebug.querySelector('i');
                const text = toggleDebug.querySelector('span') || toggleDebug;
                if (debugPanel.classList.contains('hidden')) {
                    icon.className = 'fas fa-eye';
                    text.textContent = ' Tampilkan';
                } else {
                    icon.className = 'fas fa-eye-slash';
                    text.textContent = ' Sembunyikan';
                }
            });
        }
        
        addDebugLog('Inisialisasi selesai. Aplikasi siap digunakan.', 'success');
        
    } catch (error) {
        addDebugLog('Error saat inisialisasi: ' + error.message, 'error');
        console.error('Initialization error:', error);
    }
});

// Fallback functions for missing dependencies
function updateConnectionStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    if (statusIndicator && statusText) {
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = 'Offline Mode';
    }
}

function toggleSwitch3D(deviceId) {
    const switchEl = document.getElementById(`switch${deviceId}`);
    if (switchEl) {
        switchEl.checked = !switchEl.checked;
        addDebugLog(`Switch ${deviceId} toggled: ${switchEl.checked ? 'ON' : 'OFF'}`);
    }
}

function getSystemConfig() {
    return defaultConfig.system || { autoConnect: 'no' };
}

// Render daftar perangkat di dashboard dengan 3D switches
function renderDevices() {
    const switchGrid = document.getElementById('switchGrid');
    if (!switchGrid) {
        addDebugLog('Switch grid element not found', 'error');
        return;
    }
    
    switchGrid.innerHTML = '';
    
    defaultConfig.devices.forEach((device, index) => {
        const switchCard = document.createElement('div');
        switchCard.className = 'switch-card';
        switchCard.innerHTML = `
            <div class="switch-icon">
                <i class="fas fa-${device.icon || 'lightbulb'}"></i>
            </div>
            <div class="switch-title">${device.name}</div>
            <div class="switch-control">
                <div class="switch-3d ${themeManager ? themeManager.currentAnimation : 'flip'}" id="switch3d${device.id}" onclick="toggleSwitch3D(${device.id})">
                    <input type="checkbox" id="switch${device.id}">
                    <div class="switch-3d-inner">
                        <div class="switch-face front">OFF</div>
                        <div class="switch-face back">ON</div>
                    </div>
                </div>
            </div>
            <div class="intensity-control">
                <div class="intensity-toggle">
                    <span class="toggle-label">Kontrol Intensitas</span>
                    <label class="intensity-switch">
                        <input type="checkbox" id="intensityToggle${device.id}">
                        <span class="intensity-slider"></span>
                    </label>
                </div>
                <div class="pwm-control hidden" id="pwmControl${device.id}">
                    <label>Intensitas: <span class="pwm-value" id="pwmValue${device.id}">0%</span></label>
                    <input type="range" min="0" max="100" value="0" class="pwm-slider" id="pwmSlider${device.id}">
                </div>
            </div>
        `;
        switchGrid.appendChild(switchCard);
    });
    
    addDebugLog(`${defaultConfig.devices.length} perangkat berhasil dirender`);
}