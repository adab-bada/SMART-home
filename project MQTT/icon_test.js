// Icon Test - Verifikasi semua icon tersedia
function testIconAvailability() {
    console.log('=== ICON AVAILABILITY TEST ===');
    
    // Wait for DeviceConfigManager to be available
    if (!window.deviceConfigManager) {
        console.log('DeviceConfigManager not ready, waiting...');
        setTimeout(() => {
            testIconAvailability();
        }, 1000);
        return 0;
    }
    
    const icons = window.deviceConfigManager.availableIcons;
    console.log(`✅ Total icons available: ${icons.length}`);
    
    if (icons.length === 0) {
        console.error('❌ No icons found in availableIcons array!');
        return 0;
    }
    
    // Group by category
    const categories = {};
    icons.forEach(icon => {
        if (!categories[icon.category]) {
            categories[icon.category] = [];
        }
        categories[icon.category].push(icon);
    });
    
    console.log('Icons by category:');
    Object.keys(categories).forEach(category => {
        console.log(`- ${category}: ${categories[category].length} icons`);
    });
    
    return icons.length;
}

// Test device config synchronization
function testDeviceConfigSync() {
    console.log('=== DEVICE CONFIG SYNC TEST ===');
    
    // Get devices from localStorage
    let savedDevices = [];
    try {
        const saved = localStorage.getItem('deviceConfig');
        if (saved) {
            savedDevices = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading saved devices:', error);
    }
    
    console.log('Saved devices in localStorage:', savedDevices);
    
    // Get devices from device config manager
    if (window.deviceConfigManager) {
        const managerDevices = window.deviceConfigManager.getDevices();
        console.log('Devices from manager:', managerDevices);
        
        // Check if they match
        const match = JSON.stringify(savedDevices) === JSON.stringify(managerDevices);
        console.log('Devices match:', match);
        
        return match;
    } else {
        console.error('DeviceConfigManager not found!');
        return false;
    }
}

// Test schedule display
function testScheduleDisplay() {
    console.log('=== SCHEDULE DISPLAY TEST ===');
    
    // Get schedules from localStorage
    let schedules = [];
    try {
        const saved = localStorage.getItem('schedules');
        if (saved) {
            schedules = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
    
    console.log('Schedules found:', schedules.length);
    schedules.forEach((schedule, index) => {
        console.log(`Schedule ${index + 1}:`, schedule);
    });
    
    // Check switch cards with schedules
    const switchCards = document.querySelectorAll('.switch-card');
    console.log('Switch cards found:', switchCards.length);
    
    const cardsWithSchedules = document.querySelectorAll('.switch-card.has-schedule');
    console.log('Cards with schedule indicators:', cardsWithSchedules.length);
    
    return {
        totalSchedules: schedules.length,
        totalCards: switchCards.length,
        cardsWithSchedules: cardsWithSchedules.length
    };
}

// Run all tests
function runAllTests() {
    console.log('🧪 Running all tests...');
    
    setTimeout(() => {
        const iconCount = testIconAvailability();
        const syncResult = testDeviceConfigSync();
        const scheduleResult = testScheduleDisplay();
        
        console.log('=== TEST RESULTS ===');
        console.log(`✅ Icons available: ${iconCount}`);
        console.log(`${syncResult ? '✅' : '❌'} Device config sync: ${syncResult}`);
        console.log(`✅ Schedule display:`, scheduleResult);
        
        if (iconCount < 40) {
            console.warn('⚠️ Expected at least 40 icons, but found', iconCount);
        }
        
        if (!syncResult) {
            console.warn('⚠️ Device config not synchronized between localStorage and manager');
        }
        
        console.log('🧪 Tests completed');
    }, 2000);
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🧪 Auto-running tests...');
        runAllTests();
    }, 3000);
});

// Manual test trigger - Global functions
window.runTests = runAllTests;
window.testIcons = testIconAvailability;
window.testSync = testDeviceConfigSync;
window.testSchedules = testScheduleDisplay;
window.runAllTests = runAllTests;

// Debug functions
window.debugDeviceConfig = () => {
    console.log('DeviceConfigManager:', window.deviceConfigManager);
    if (window.deviceConfigManager) {
        console.log('Available icons:', window.deviceConfigManager.availableIcons.length);
        console.log('Current devices:', window.deviceConfigManager.getDevices());
    }
};

window.debugSchedules = () => {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    console.log('Schedules in localStorage:', schedules);
    console.log('Schedule data:', window.scheduleData);
    const cards = document.querySelectorAll('.switch-card.has-schedule');
    console.log('Cards with schedules:', cards.length);
};