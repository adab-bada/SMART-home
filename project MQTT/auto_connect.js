// Simple Auto-Connect Manager
document.addEventListener('DOMContentLoaded', () => {
    // Set default auto-connect if not exists
    if (!localStorage.getItem('autoConnect')) {
        localStorage.setItem('autoConnect', 'yes');
    }
    
    // Auto-connect after page load
    setTimeout(() => {
        const autoConnect = localStorage.getItem('autoConnect');
        if (autoConnect === 'yes' && typeof connectMQTT === 'function') {
            console.log('🔄 Auto-connecting to MQTT...');
            connectMQTT();
        }
    }, 3000);
});

// Save auto-connect setting when changed
document.addEventListener('change', (e) => {
    if (e.target.id === 'autoConnect') {
        localStorage.setItem('autoConnect', e.target.value);
        console.log('Auto-connect setting saved:', e.target.value);
    }
});