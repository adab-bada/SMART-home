// Test Schedule Creator - untuk testing
function createTestSchedule() {
    const testSchedules = [
        {
            id: 1001,
            name: 'Lampu Pagi',
            switchNum: 1,
            action: 'on',
            time: '07:00',
            days: [1, 2, 3, 4, 5],
            intensity: 80
        },
        {
            id: 1002,
            name: 'Lampu Malam',
            switchNum: 2,
            action: 'off',
            time: '22:00',
            days: [0, 1, 2, 3, 4, 5, 6],
            intensity: 100
        },
        {
            id: 1003,
            name: 'Lampu Sore',
            switchNum: 3,
            action: 'on',
            time: '18:00',
            days: [0, 6],
            intensity: 60
        }
    ];
    
    localStorage.setItem('schedules', JSON.stringify(testSchedules));
    console.log('✅ Test schedules created:', testSchedules);
    
    // Trigger display update
    setTimeout(() => {
        if (window.refreshScheduleDisplay) {
            window.refreshScheduleDisplay();
        }
        if (window.showScheduleOnCards) {
            window.showScheduleOnCards();
        }
    }, 500);
    
    alert('✅ Test schedules created! Check switch cards for schedule indicators.');
}

// Global function
window.createTestSchedule = createTestSchedule;

// Add test button - tidak perlu karena sudah ada di HTML