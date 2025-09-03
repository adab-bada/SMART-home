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
        const themeFab = document.getElementById('themeFab');
        if (themeFab) {
            themeFab.addEventListener('click', () => {
                this.toggleThemePanel();
            });
        }

        // Theme preset selection
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const theme = preset.dataset.theme;
                this.selectTheme(theme);
            });
        });

        // Animation selection
        const animationSelect = document.getElementById('switchAnimation');
        if (animationSelect) {
            animationSelect.addEventListener('change', (e) => {
                this.applySwitchAnimation(e.target.value);
            });
        }

        // Custom colors
        const applyColorsBtn = document.getElementById('applyCustomColors');
        if (applyColorsBtn) {
            applyColorsBtn.addEventListener('click', () => {
                this.applyCustomColors();
            });
        }

        // Close theme panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                this.closeThemePanel();
            }
        });
    }

    toggleThemePanel() {
        const panel = document.getElementById('themePanel');
        if (panel) {
            panel.classList.toggle('active');
        }
    }

    closeThemePanel() {
        const panel = document.getElementById('themePanel');
        if (panel) {
            panel.classList.remove('active');
        }
    }

    selectTheme(theme) {
        // Update active preset
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        
        const activePreset = document.querySelector(`[data-theme="${theme}"]`);
        if (activePreset) {
            activePreset.classList.add('active');
        }

        this.applyTheme(theme);
        this.currentTheme = theme;
        this.saveThemeSettings();
        
        addDebugLog(`Theme changed to: ${theme}`, 'success');
        showToast(`Theme changed to ${theme}`, 'success');
    }

    applyTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('light-theme', 'dark-theme', 'modern-theme', 'neon-theme', 'classic-theme');
        
        // Apply new theme class
        document.body.classList.add(`${theme}-theme`);
    }

    applySwitchAnimation(animation) {
        this.currentAnimation = animation;
        
        // Update all switch elements
        document.querySelectorAll('.switch-3d').forEach(switchEl => {
            switchEl.classList.remove('flip', 'rotate', 'scale', 'slide');
            switchEl.classList.add(animation);
        });

        // Update animation selector
        const animationSelect = document.getElementById('switchAnimation');
        if (animationSelect) {
            animationSelect.value = animation;
        }
        
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
        
        setToStorage('themeSettings', settings);
    }

    loadThemeSettings() {
        const settings = getFromStorage('themeSettings', {});
        
        this.currentTheme = settings.theme || 'light';
        this.currentAnimation = settings.animation || 'flip';
        this.customColors = settings.customColors || this.customColors;

        // Update UI elements
        const animationSelect = document.getElementById('switchAnimation');
        if (animationSelect) {
            animationSelect.value = this.currentAnimation;
        }
        
        const customPrimary = document.getElementById('customPrimary');
        const customSecondary = document.getElementById('customSecondary');
        const customSuccess = document.getElementById('customSuccess');
        
        if (customPrimary) customPrimary.value = this.customColors.primary;
        if (customSecondary) customSecondary.value = this.customColors.secondary;
        if (customSuccess) customSuccess.value = this.customColors.success;

        // Apply custom colors if they exist
        if (settings.customColors) {
            document.documentElement.style.setProperty('--primary', this.customColors.primary);
            document.documentElement.style.setProperty('--secondary', this.customColors.secondary);
            document.documentElement.style.setProperty('--success', this.customColors.success);
        }
        
        // Update active theme preset
        const activePreset = document.querySelector(`[data-theme="${this.currentTheme}"]`);
        if (activePreset) {
            document.querySelectorAll('.theme-preset').forEach(preset => {
                preset.classList.remove('active');
            });
            activePreset.classList.add('active');
        }
    }
}

// Initialize theme manager
window.themeManager = new ThemeManager();