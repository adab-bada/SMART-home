// Debug Switch Cards
function debugSwitchCards() {
    console.log('=== SWITCH CARDS DEBUG ===');
    
    const allCards = document.querySelectorAll('.switch-card');
    console.log('Total switch cards:', allCards.length);
    
    allCards.forEach((card, index) => {
        const dataSwitch = card.getAttribute('data-switch');
        const title = card.querySelector('.switch-title')?.textContent;
        console.log(`Card ${index + 1}: data-switch="${dataSwitch}", title="${title}"`);
    });
    
    // Test specific selectors
    console.log('Testing selectors:');
    console.log('- [data-switch="1"]:', document.querySelector('[data-switch="1"]'));
    console.log('- [data-switch="2"]:', document.querySelector('[data-switch="2"]'));
    console.log('- [data-switch="3"]:', document.querySelector('[data-switch="3"]'));
}

window.debugSwitchCards = debugSwitchCards;

// Auto-run
setTimeout(debugSwitchCards, 3000);