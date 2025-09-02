// Switch Card Generator with Schedule Display Support
function generateSwitchCards() {
    console.log('🔄 generateSwitchCards() called');
    
    const switchGrid = document.getElementById('switchGrid');
    if (!switchGrid) {
        console.error('❌ switchGrid element not found!');
        return;
    }
    
    console.log('✅ switchGrid found:', switchGrid);

    // Get devices
    let devices = [];
    try {
        const saved = localStorage.getItem('deviceConfig');
        if (saved) {
            devices = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading devices:', error);
    }
    
    if (devices.length === 0) {
        devices = [
            { id: 1, name: 'Lampu Ruang Tamu', icon: 'fas fa-lightbulb' },
            { id: 2, name: 'Lampu Kamar Tidur', icon: 'fas fa-bed' },
            { id: 3, name: 'Lampu Dapur', icon: 'fas fa-utensils' },
            { id: 4, name: 'Lampu Teras', icon: 'fas fa-home' }
        ];
    }
    
    console.log('Generating cards for', devices.length, 'devices');

    const currentAnimation = localStorage.getItem('switchAnimation') || 'flip';
    let html = '';
    
    for (let i = 0; i < devices.length; i++) {
        const device = devices[i];
        const num = i + 1;
        const name = device.name || ('Device ' + num);
        const icon = device.icon || 'fas fa-lightbulb';
        
        html += '<div class="switch-card" data-switch="' + num + '">' +
            '<div class="switch-icon"><i class="' + icon + '"></i></div>' +
            '<div class="switch-title">' + name + '</div>' +
            '<div class="switch-control">' +
                '<div class="switch-3d ' + currentAnimation + '" onclick="toggleSwitch3D(' + num + ')">' +
                    '<input type="checkbox" id="switch' + num + '">' +
                    '<div class="switch-3d-inner">' +
                        '<div class="switch-face front">OFF</div>' +
                        '<div class="switch-face back">ON</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="intensity-control">' +
                '<div class="intensity-toggle">' +
                    '<span class="toggle-label">Intensitas</span>' +
                    '<label class="intensity-switch">' +
                        '<input type="checkbox" id="intensityToggle' + num + '" onchange="toggleIntensity(' + num + ')">' +
                        '<span class="intensity-slider"></span>' +
                    '</label>' +
                '</div>' +
                '<div class="pwm-control hidden" id="pwmControl' + num + '">' +
                    '<input type="range" min="0" max="100" value="100" class="pwm-slider" id="pwmSlider' + num + '" oninput="updatePWMValue(' + num + ')">' +
                    '<div style="text-align: center; margin-top: 5px;">' +
                        '<span class="pwm-value" id="pwmValue' + num + '">100%</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    switchGrid.innerHTML = html;
    console.log('✅ Switch cards generated, HTML length:', html.length);
    
    // Immediate check
    const cards = document.querySelectorAll('.switch-card');
    console.log('✅ Cards in DOM:', cards.length);

    // Trigger schedule display
    setTimeout(() => {
        if (window.refreshScheduleDisplay) {
            window.refreshScheduleDisplay();
        }
        if (window.showScheduleOnCards) {
            window.showScheduleOnCards();
        }
    }, 300);
}

// Initialize switch cards when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing switch cards...');
    setTimeout(() => {
        generateSwitchCards();
    }, 1000);
});

// Regenerate cards when animation changes
document.addEventListener('animationChanged', () => {
    generateSwitchCards();
});

// Global function for manual trigger
window.generateSwitchCards = generateSwitchCards;

// Auto-generate after all scripts loaded
setTimeout(() => {
    console.log('Auto-generating switch cards...');
    generateSwitchCards();
}, 2000);