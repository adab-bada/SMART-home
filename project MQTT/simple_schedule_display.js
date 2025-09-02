// Simple Schedule Display with Popup
let scheduleData = {};

function showScheduleOnCards() {
    console.log('=== SCHEDULE DISPLAY DEBUG ===');
    
    // Wait for switch cards to be available
    const switchCards = document.querySelectorAll('.switch-card');
    if (switchCards.length === 0) {
        console.log('No switch cards found, retrying in 1 second...');
        setTimeout(showScheduleOnCards, 1000);
        return;
    }
    
    // Get schedules from localStorage
    let schedules = [];
    try {
        const saved = localStorage.getItem('schedules');
        schedules = saved ? JSON.parse(saved) : [];
        console.log('Found schedules:', schedules.length);
        schedules.forEach((s, i) => console.log(`Schedule ${i+1}:`, s));
    } catch (e) {
        console.error('Error loading schedules:', e);
        return;
    }
    
    if (schedules.length === 0) {
        console.log('No schedules found');
        return;
    }
    
    // Clear schedule data
    scheduleData = {};
    
    console.log('Found switch cards:', switchCards.length);
    
    // Clear all existing schedule displays
    switchCards.forEach(card => {
        card.classList.remove('has-schedule');
        const existingBtn = card.querySelector('.schedule-toggle-btn');
        if (existingBtn) existingBtn.remove();
    });
    
    // Group schedules by switch
    schedules.forEach(schedule => {
        const switchNum = schedule.switchNum.toString();
        if (!scheduleData[switchNum]) {
            scheduleData[switchNum] = [];
        }
        scheduleData[switchNum].push(schedule);
        console.log(`Added schedule for switch ${switchNum}:`, schedule.name);
    });
    
    console.log('Schedule data grouped:', scheduleData);
    
    // Debug all available cards first
    const allCards = document.querySelectorAll('.switch-card');
    console.log('Available switch cards:');
    allCards.forEach((card, index) => {
        const dataSwitch = card.getAttribute('data-switch');
        console.log(`  Card ${index + 1}: data-switch="${dataSwitch}"`);
    });
    
    // Process each switch with schedules
    Object.keys(scheduleData).forEach(switchNum => {
        console.log(`Looking for switch card with data-switch="${switchNum}"`);
        
        // Try multiple selectors
        let switchCard = document.querySelector(`[data-switch="${switchNum}"]`);
        
        if (!switchCard) {
            // Try as integer
            switchCard = document.querySelector(`[data-switch="${parseInt(switchNum)}"]`);
        }
        
        if (switchCard) {
            console.log(`✅ Adding schedule indicator to switch ${switchNum}`);
            
            // Add visual indicator (alarm icon)
            switchCard.classList.add('has-schedule');
            
            // Add toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'schedule-toggle-btn';
            toggleBtn.textContent = 'Jadwal';
            toggleBtn.onclick = () => showSchedulePopup(switchNum);
            
            switchCard.appendChild(toggleBtn);
        } else {
            console.log(`❌ Switch card not found for switch ${switchNum}`);
            console.log(`  Tried selectors: [data-switch="${switchNum}"], [data-switch="${parseInt(switchNum)}"]`);
        }
    });
    
    const cardsWithSchedules = document.querySelectorAll('.switch-card.has-schedule');
    console.log(`✅ Schedule display complete. ${cardsWithSchedules.length} cards now have schedule indicators`);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showScheduleOnCards, 2000);
});

// Run when schedules change
document.addEventListener('scheduleUpdated', showScheduleOnCards);

// Run when device config changes
document.addEventListener('deviceConfigChanged', () => {
    setTimeout(showScheduleOnCards, 500);
});

// Run when switch cards are regenerated
document.addEventListener('switchCardsGenerated', () => {
    setTimeout(showScheduleOnCards, 300);
});

function showSchedulePopup(switchNum) {
    const schedules = scheduleData[switchNum];
    if (!schedules || schedules.length === 0) return;
    
    // Create popup if not exists
    let popup = document.getElementById('schedulePopup');
    let overlay = document.getElementById('popupOverlay');
    
    if (!popup) {
        // Create overlay
        overlay = document.createElement('div');
        overlay.id = 'popupOverlay';
        overlay.className = 'popup-overlay';
        overlay.onclick = hideSchedulePopup;
        document.body.appendChild(overlay);
        
        // Create popup
        popup = document.createElement('div');
        popup.id = 'schedulePopup';
        popup.className = 'schedule-popup';
        document.body.appendChild(popup);
    }
    
    // Get switch name
    const switchCard = document.querySelector(`[data-switch="${switchNum}"]`);
    const switchName = switchCard ? switchCard.querySelector('.switch-title').textContent : `Switch ${switchNum}`;
    
    // Generate popup content
    const scheduleItems = schedules.map(schedule => `
        <div class="schedule-popup-item">
            <div>
                <div style="font-weight: bold;">${schedule.name}</div>
                <div style="font-size: 12px; color: var(--gray);">${getDaysText(schedule.days)}</div>
            </div>
            <div>
                <div class="schedule-popup-time">${schedule.time}</div>
                <div class="schedule-popup-action ${schedule.action === 'off' ? 'off' : ''}">${schedule.action.toUpperCase()}</div>
            </div>
        </div>
    `).join('');
    
    popup.innerHTML = `
        <div class="schedule-popup-header">
            <div class="schedule-popup-title">📅 Jadwal ${switchName}</div>
            <button class="schedule-popup-close" onclick="hideSchedulePopup()">&times;</button>
        </div>
        <div class="schedule-popup-content">
            ${scheduleItems}
        </div>
    `;
    
    // Show popup
    overlay.classList.add('show');
    popup.classList.add('show');
}

function hideSchedulePopup() {
    const popup = document.getElementById('schedulePopup');
    const overlay = document.getElementById('popupOverlay');
    
    if (popup) popup.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
}

function getDaysText(days) {
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days.map(day => dayNames[day]).join(', ');
}

// Manual refresh function
window.refreshScheduleDisplay = showScheduleOnCards;

// Global function untuk debugging
window.showScheduleOnCards = showScheduleOnCards;
window.scheduleData = scheduleData;