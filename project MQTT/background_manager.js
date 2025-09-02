// Background Manager for Smart Home Controller
class BackgroundManager {
    constructor() {
        this.presetBackgrounds = {
            gradient: null, // Default gradient
            nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
            space: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1920&h=1080&fit=crop',
            ocean: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&h=1080&fit=crop',
            city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop',
            abstract: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&h=1080&fit=crop'
        };
        
        this.currentBackground = 'gradient';
        this.currentOpacity = 0.8;
        
        this.init();
    }

    init() {
        this.loadSavedBackground();
        this.bindEvents();
        this.updateOpacityDisplay();
    }

    bindEvents() {
        // Background preset selection
        document.querySelectorAll('.bg-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const bgType = e.currentTarget.dataset.bg;
                this.setBackground(bgType);
                this.updateActivePreset(e.currentTarget);
            });
        });

        // Custom file upload
        const fileInput = document.getElementById('customBgFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }

        // Opacity control
        const opacitySlider = document.getElementById('bgOpacity');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                this.setOpacity(parseFloat(e.target.value));
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBackground');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToDefault();
            });
        }
    }

    setBackground(bgType) {
        this.currentBackground = bgType;
        
        if (bgType === 'gradient') {
            // Remove custom background
            document.body.classList.remove('custom-bg');
            document.body.style.removeProperty('--custom-bg-image');
        } else {
            // Set preset background
            const bgUrl = this.presetBackgrounds[bgType];
            if (bgUrl) {
                document.body.classList.add('custom-bg');
                document.body.style.setProperty('--custom-bg-image', `url(${bgUrl})`);
                document.body.style.setProperty('--custom-bg-opacity', this.currentOpacity);
            }
        }
        
        this.saveBackground();
        this.showToast(`Background changed to ${bgType}`, 'success');
    }

    setCustomBackground(imageUrl) {
        this.currentBackground = 'custom';
        document.body.classList.add('custom-bg');
        document.body.style.setProperty('--custom-bg-image', `url(${imageUrl})`);
        document.body.style.setProperty('--custom-bg-opacity', this.currentOpacity);
        
        this.saveBackground();
        this.updateActivePreset(null);
        this.showToast('Custom background applied', 'success');
    }

    setOpacity(opacity) {
        this.currentOpacity = opacity;
        document.body.style.setProperty('--custom-bg-opacity', opacity);
        this.updateOpacityDisplay();
        this.saveBackground();
    }

    updateOpacityDisplay() {
        const opacityValue = document.getElementById('bgOpacityValue');
        if (opacityValue) {
            opacityValue.textContent = Math.round(this.currentOpacity * 100) + '%';
        }
        
        const opacitySlider = document.getElementById('bgOpacity');
        if (opacitySlider) {
            opacitySlider.value = this.currentOpacity;
        }
    }

    updateActivePreset(activeElement) {
        // Remove active class from all presets
        document.querySelectorAll('.bg-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        
        // Add active class to selected preset
        if (activeElement) {
            activeElement.classList.add('active');
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.setCustomBackground(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    resetToDefault() {
        this.setBackground('gradient');
        this.setOpacity(0.8);
        
        // Reset active preset
        const gradientPreset = document.querySelector('.bg-preset[data-bg="gradient"]');
        if (gradientPreset) {
            this.updateActivePreset(gradientPreset);
        }
        
        this.showToast('Background reset to default', 'info');
    }

    saveBackground() {
        const bgData = {
            type: this.currentBackground,
            opacity: this.currentOpacity,
            customUrl: this.currentBackground === 'custom' ? 
                document.body.style.getPropertyValue('--custom-bg-image') : null
        };
        
        localStorage.setItem('smartHomeBackground', JSON.stringify(bgData));
    }

    loadSavedBackground() {
        try {
            const saved = localStorage.getItem('smartHomeBackground');
            if (saved) {
                const bgData = JSON.parse(saved);
                this.currentOpacity = bgData.opacity || 0.8;
                
                if (bgData.type === 'custom' && bgData.customUrl) {
                    document.body.classList.add('custom-bg');
                    document.body.style.setProperty('--custom-bg-image', bgData.customUrl);
                    document.body.style.setProperty('--custom-bg-opacity', this.currentOpacity);
                    this.currentBackground = 'custom';
                } else if (bgData.type && bgData.type !== 'gradient') {
                    this.setBackground(bgData.type);
                    
                    // Set active preset
                    const preset = document.querySelector(`.bg-preset[data-bg="${bgData.type}"]`);
                    if (preset) {
                        this.updateActivePreset(preset);
                    }
                } else {
                    // Default gradient
                    const gradientPreset = document.querySelector('.bg-preset[data-bg="gradient"]');
                    if (gradientPreset) {
                        this.updateActivePreset(gradientPreset);
                    }
                }
            } else {
                // Set default active preset
                const gradientPreset = document.querySelector('.bg-preset[data-bg="gradient"]');
                if (gradientPreset) {
                    this.updateActivePreset(gradientPreset);
                }
            }
        } catch (error) {
            console.error('Error loading saved background:', error);
        }
    }

    showToast(message, type = 'info') {
        // Use existing toast function if available
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Update CSS for custom background
const style = document.createElement('style');
style.textContent = `
    body.custom-bg::before {
        background-image: var(--custom-bg-image);
        opacity: var(--custom-bg-opacity, 0.8);
    }
`;
document.head.appendChild(style);

// Initialize background manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.backgroundManager = new BackgroundManager();
});