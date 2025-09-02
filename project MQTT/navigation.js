// Navigation Handler
// Initialize admin status
window.isAdmin = false;

document.addEventListener('DOMContentLoaded', () => {
    // Navigation handling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;
            
            if (target === 'configuration') {
                // Check admin status
                if (!window.isAdmin) {
                    // Use auto-close alert if available, otherwise fallback to regular alert
                    if (typeof window.showAutoCloseAlert === 'function') {
                        window.showAutoCloseAlert('Hanya admin yang bisa membuka menu konfigurasi', 4000);
                    } else {
                        alert('Hanya admin yang bisa membuka menu konfigurasi');
                    }
                    return;
                }
            }
            
            if (target) {
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                e.currentTarget.classList.add('active');
                
                // Hide all content sections
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show target section
                const targetSection = document.getElementById(target);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            }
        });
    });
});

// Global navigation function
window.showSection = function(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
};