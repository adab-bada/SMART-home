// Simple Icon Test - Direct access
console.log('🧪 Simple icon test loading...');

// Test function yang langsung akses class
function simpleIconTest() {
    console.log('=== SIMPLE ICON TEST ===');
    
    try {
        // Create instance directly
        const testManager = new DeviceConfigManager();
        console.log('✅ DeviceConfigManager created successfully');
        console.log('✅ Available icons:', testManager.availableIcons.length);
        
        if (testManager.availableIcons.length > 0) {
            console.log('✅ First few icons:');
            testManager.availableIcons.slice(0, 5).forEach(icon => {
                console.log(`  - ${icon.name} (${icon.icon}) [${icon.category}]`);
            });
        }
        
        return testManager.availableIcons.length;
    } catch (error) {
        console.error('❌ Error creating DeviceConfigManager:', error);
        return 0;
    }
}

// Test schedule display
function simpleScheduleTest() {
    console.log('=== SIMPLE SCHEDULE TEST ===');
    
    // Check if schedules exist
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    console.log('📅 Schedules found:', schedules.length);
    
    // Check switch cards
    const cards = document.querySelectorAll('.switch-card');
    console.log('🔲 Switch cards found:', cards.length);
    
    // Check cards with schedule indicators
    const cardsWithSchedules = document.querySelectorAll('.switch-card.has-schedule');
    console.log('⏰ Cards with schedule indicators:', cardsWithSchedules.length);
    
    if (schedules.length > 0 && cardsWithSchedules.length === 0) {
        console.log('🔧 Manually triggering schedule display...');
        if (window.showScheduleOnCards) {
            window.showScheduleOnCards();
        }
    }
}

// Global functions
window.simpleIconTest = simpleIconTest;
window.simpleScheduleTest = simpleScheduleTest;

// Auto-run after page loads
setTimeout(() => {
    console.log('🚀 Running simple tests...');
    simpleIconTest();
    simpleScheduleTest();
}, 2000);