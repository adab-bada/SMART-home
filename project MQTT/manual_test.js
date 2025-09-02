// Manual Switch Card Generator - untuk test
function manualGenerateCards() {
    console.log('=== MANUAL CARD GENERATION ===');
    
    const switchGrid = document.getElementById('switchGrid');
    if (!switchGrid) {
        console.error('switchGrid not found!');
        return;
    }
    
    // Simple test cards
    const testHTML = 
        '<div class="switch-card" data-switch="1">' +
            '<div class="switch-title">Test Card 1</div>' +
        '</div>' +
        '<div class="switch-card" data-switch="2">' +
            '<div class="switch-title">Test Card 2</div>' +
        '</div>' +
        '<div class="switch-card" data-switch="3">' +
            '<div class="switch-title">Test Card 3</div>' +
        '</div>';
    
    switchGrid.innerHTML = testHTML;
    console.log('✅ Manual cards generated');
    
    // Check immediately
    setTimeout(() => {
        const cards = document.querySelectorAll('.switch-card');
        console.log('Manual cards check:');
        cards.forEach((card, index) => {
            const dataSwitch = card.getAttribute('data-switch');
            console.log(`  Card ${index + 1}: data-switch="${dataSwitch}"`);
        });
        
        // Test schedule display
        if (window.showScheduleOnCards) {
            console.log('Testing schedule display with manual cards...');
            window.showScheduleOnCards();
        }
    }, 100);
}

window.manualGenerateCards = manualGenerateCards;