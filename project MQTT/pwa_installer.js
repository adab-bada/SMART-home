// PWA Installer for Smart Home Controller
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.createInstallButton();
        this.bindEvents();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    createInstallButton() {
        // Create install button
        this.installButton = document.createElement('button');
        this.installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
        this.installButton.className = 'install-btn';
        this.installButton.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            z-index: 1001;
            background: #4361ee;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            display: none;
            transition: all 0.3s ease;
        `;
        
        this.installButton.addEventListener('mouseenter', () => {
            this.installButton.style.transform = 'scale(1.05)';
        });
        
        this.installButton.addEventListener('mouseleave', () => {
            this.installButton.style.transform = 'scale(1)';
        });

        document.body.appendChild(this.installButton);
    }

    bindEvents() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Install button click
        this.installButton.addEventListener('click', () => {
            this.installApp();
        });

        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.showToast('App installed successfully!', 'success');
        });

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App is running in standalone mode');
            this.hideInstallButton();
        }
    }

    showInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'block';
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            this.showToast('Installation not available', 'error');
            return;
        }

        // Show install prompt
        this.deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        this.deferredPrompt = null;
        this.hideInstallButton();
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

// Initialize PWA installer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaInstaller = new PWAInstaller();
});