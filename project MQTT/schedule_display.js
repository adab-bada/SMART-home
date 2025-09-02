// Schedule Display Manager for Switch Cards
class ScheduleDisplayManager {
    constructor() {
        this.schedules = [];
        this.init();
    }

    init() {
        this.loadSchedules();
        this.updateAllSwitchCards();
        
        // Update every minute
        setInterval(() => {
            this.loadSchedules();
            this.updateAllSwitchCards();
        }, 60000);
    }

    loadSchedules() {
        try {
            const saved = localStorage.getItem('schedules');
            this.schedules = saved ? JSON.parse(saved) : [];
            console.log('Loaded schedules from localStorage:', this.schedules);
        } catch (error) {
            console.error('Error loading schedules:', error);
            this.schedules = [];
        }
    }

    updateAllSwitchCards() {
        const switchCards = document.querySelectorAll('.switch-card');
        switchCards.forEach(card => {
            const switchId = card.dataset.switch;
            if (switchId) {
                this.updateSwitchScheduleDisplay(switchId, card);
            }
        });
    }

    updateSwitchScheduleDisplay(switchId, cardElement) {
        const switchSchedules = this.getSchedulesForSwitch(switchId);
        const activeSchedules = this.getActiveSchedules(switchSchedules);
        
        // Update card appearance
        if (activeSchedules.length > 0) {
            cardElement.classList.add('has-schedule');
        } else {
            cardElement.classList.remove('has-schedule');
        }

        // Update or create schedule info display
        this.updateScheduleInfo(cardElement, activeSchedules);
    }

    getSchedulesForSwitch(switchId) {
        const filtered = this.schedules.filter(schedule => {
            // Check switchNum field (actual field name used in schedule_functions.js)
            const scheduleSwitch = schedule.switchNum;
            const match = scheduleSwitch == switchId;
            console.log(`Checking schedule for switch ${switchId}:`, schedule, 'switchNum:', scheduleSwitch, 'Match:', match);
            return match;
        });
        console.log(`Found ${filtered.length} schedules for switch ${switchId}`);
        return filtered;
    }

    getActiveSchedules(schedules) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const active = schedules.filter(schedule => {
            // Check if schedule is for today
            if (!schedule.days || !schedule.days.includes(currentDay.toString())) {
                return false;
            }

            // Check if schedule is within next 4 hours (extended for testing)
            const scheduleTime = this.parseTime(schedule.time);
            const timeDiff = scheduleTime - currentTime;
            
            return timeDiff >= -60 && timeDiff <= 240; // From 1 hour ago to 4 hours ahead
        });
        
        console.log(`Active schedules for today (${currentDay}):`, active);
        return active;
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    getDayName(dayNumber) {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        return days[dayNumber] || '';
    }

    updateScheduleInfo(cardElement, activeSchedules) {
        let scheduleInfoElement = cardElement.querySelector('.schedule-info');
        
        // Remove existing schedule info if no active schedules
        if (activeSchedules.length === 0) {
            if (scheduleInfoElement) {
                scheduleInfoElement.remove();
            }
            return;
        }

        // Create schedule info element if it doesn't exist
        if (!scheduleInfoElement) {
            scheduleInfoElement = document.createElement('div');
            scheduleInfoElement.className = 'schedule-info active';
            cardElement.appendChild(scheduleInfoElement);
        }

        // Generate schedule display HTML
        const scheduleHTML = activeSchedules.map(schedule => {
            const actionClass = schedule.action === 'off' ? 'off' : '';
            const actionText = schedule.action === 'on' ? 'ON' : 
                              schedule.action === 'off' ? 'OFF' : 'TOGGLE';
            
            return `
                <div class="schedule-item">
                    <span class="schedule-time">${this.formatTime(schedule.time)}</span>
                    <span class="schedule-action ${actionClass}">${actionText}</span>
                </div>
            `;
        }).join('');

        scheduleInfoElement.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; color: var(--warning);">
                📅 Jadwal Aktif (${activeSchedules.length})
            </div>
            ${scheduleHTML}
        `;
    }

    // Method to be called when schedules are updated
    refreshScheduleDisplay() {
        this.loadSchedules();
        this.updateAllSwitchCards();
    }

    // Method to toggle schedule info visibility
    toggleScheduleInfo(switchId) {
        const card = document.querySelector(`[data-switch="${switchId}"]`);
        if (card) {
            const scheduleInfo = card.querySelector('.schedule-info');
            if (scheduleInfo) {
                scheduleInfo.classList.toggle('active');
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleDisplayManager = new ScheduleDisplayManager();
    
    // Add refresh button event listener
    const refreshBtn = document.getElementById('refreshScheduleBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('Manual refresh triggered');
            if (window.scheduleDisplayManager) {
                window.scheduleDisplayManager.refreshScheduleDisplay();
            }
        });
    }
});

// Listen for schedule updates
document.addEventListener('scheduleUpdated', () => {
    console.log('Schedule updated event received');
    if (window.scheduleDisplayManager) {
        window.scheduleDisplayManager.refreshScheduleDisplay();
    }
});