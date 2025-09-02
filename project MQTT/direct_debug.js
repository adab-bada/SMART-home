// Direct Console Debug
console.log('=== DIRECT DEBUG ===');
console.log('DOM ready state:', document.readyState);
console.log('switchGrid element:', document.getElementById('switchGrid'));
console.log('switch-card elements:', document.querySelectorAll('.switch-card'));
console.log('switch-card count:', document.querySelectorAll('.switch-card').length);

// Test selector variations
console.log('Test selectors:');
console.log('- .switch-card:', document.querySelectorAll('.switch-card').length);
console.log('- div.switch-card:', document.querySelectorAll('div.switch-card').length);
console.log('- [data-switch]:', document.querySelectorAll('[data-switch]').length);
console.log('- #switchGrid .switch-card:', document.querySelectorAll('#switchGrid .switch-card').length);

// Check if elements exist but have different class
const allDivs = document.querySelectorAll('div');
console.log('Total divs:', allDivs.length);

allDivs.forEach((div, index) => {
    if (div.className && div.className.includes('switch')) {
        console.log(`Div ${index}: class="${div.className}"`);
    }
});

// Manual schedule test
function manualScheduleTest() {
    console.log('=== MANUAL SCHEDULE TEST ===');
    
    // Create test schedules
    const schedules = [
        { id: 1, name: 'Test 1', switchNum: 1, action: 'on', time: '07:00', days: [1,2,3,4,5] },
        { id: 2, name: 'Test 2', switchNum: 2, action: 'off', time: '22:00', days: [0,1,2,3,4,5,6] }
    ];
    
    localStorage.setItem('schedules', JSON.stringify(schedules));
    console.log('Test schedules saved');
    
    // Try to find cards manually
    const grid = document.getElementById('switchGrid');
    if (grid) {
        console.log('switchGrid found, innerHTML length:', grid.innerHTML.length);
        console.log('switchGrid children:', grid.children.length);
        
        // Add schedule indicators manually
        for (let i = 0; i < grid.children.length; i++) {
            const card = grid.children[i];
            if (card.getAttribute('data-switch') === '1' || card.getAttribute('data-switch') === '2') {
                card.classList.add('has-schedule');
                console.log('Added schedule to card', card.getAttribute('data-switch'));
            }
        }
    }
}

window.manualScheduleTest = manualScheduleTest;