// Navigation Management
class NavigationManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.showSection('dashboard');
        
        addDebugLog('Navigation manager initialized');
    }
    
    bindEvents() {
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.navigateTo(target);
            });
        });
        
        // Config tabs
        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.showConfigTab(target);
            });
        });
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    navigateTo(sectionId) {
        // Check admin access for configuration
        if (sectionId === 'configuration' && !window.isAdmin) {
            showAutoCloseAlert('Hanya admin yang dapat mengakses menu konfigurasi', 4000);
            return;
        }
        
        this.showSection(sectionId);
        this.updateActiveNav(sectionId);
        this.currentSection = sectionId;
        
        addDebugLog(`Navigated to: ${sectionId}`);
    }
    
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    updateActiveNav(sectionId) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current nav item
        const activeNav = document.querySelector(`[data-target="${sectionId}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }
    
    showConfigTab(tabId) {
        // Hide all config contents
        document.querySelectorAll('.config-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show target config content
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Update active tab
        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-target="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Initialize navigation manager
window.navigationManager = new NavigationManager();

// Global navigation function for compatibility
window.showSection = (sectionId) => {
    if (window.navigationManager) {
        window.navigationManager.showSection(sectionId);
    }
};