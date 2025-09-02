// Fix script untuk masalah koneksi MQTT dan animasi switch
document.addEventListener('DOMContentLoaded', function() {
    // Fix untuk animasi switch 3D
    setTimeout(() => {
        // Pastikan semua switch 3D memiliki event listener yang benar
        for (let i = 1; i <= 4; i++) {
            const switch3d = document.getElementById(`switch3d${i}`);
            const switchInput = document.getElementById(`switch${i}`);
            
            if (switch3d && switchInput) {
                // Remove existing listeners to prevent duplicates
                switch3d.replaceWith(switch3d.cloneNode(true));
                const newSwitch3d = document.getElementById(`switch3d${i}`);
                const newSwitchInput = document.getElementById(`switch${i}`);
                
                // Add proper click handler
                newSwitch3d.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle the checkbox
                    newSwitchInput.checked = !newSwitchInput.checked;
                    
                    // Trigger the change event
                    const changeEvent = new Event('change', { bubbles: true });
                    newSwitchInput.dispatchEvent(changeEvent);
                });
            }
        }
        
        // Re-attach switch listeners after fixing
        if (typeof attachSwitchListeners === 'function') {
            attachSwitchListeners();
        }
    }, 500);
    
    // Fix untuk koneksi MQTT yang lebih stabil
    const originalConnect = window.connectMQTT;
    if (originalConnect) {
        window.connectMQTT = function() {
            // Clear any existing reconnection attempts
            if (window.reconnectTimeout) {
                clearTimeout(window.reconnectTimeout);
                window.reconnectTimeout = null;
            }
            
            // Call original connect function
            originalConnect();
        };
    }
    
    // Improved error handling for MQTT
    const originalProcessMessage = window.processMessage;
    if (originalProcessMessage) {
        window.processMessage = function(topic, message) {
            try {
                originalProcessMessage(topic, message);
            } catch (error) {
                console.error('Error processing MQTT message:', error);
                addDebugLog('Error processing message: ' + error.message, 'error');
            }
        };
    }
    
    // Fix untuk theme animation application
    const originalApplySwitchAnimation = themeManager?.applySwitchAnimation;
    if (originalApplySwitchAnimation) {
        themeManager.applySwitchAnimation = function(animation) {
            this.currentAnimation = animation;
            
            // Update all switch elements with proper selectors
            document.querySelectorAll('.switch-3d').forEach(switchEl => {
                switchEl.classList.remove('flip', 'rotate', 'scale', 'slide');
                switchEl.classList.add(animation);
                
                // Force reflow to ensure animation applies
                switchEl.offsetHeight;
            });

            // Update animation selector
            const animationSelect = document.getElementById('switchAnimation');
            if (animationSelect) {
                animationSelect.value = animation;
            }
            
            this.saveThemeSettings();
            addDebugLog(`Switch animation changed to: ${animation}`, 'success');
        };
    }
});

// Utility function to fix MQTT connection issues
function fixMQTTConnection() {
    if (typeof client !== 'undefined' && client) {
        // Add better error handling
        client.on('error', function(err) {
            console.error('MQTT Error:', err);
            addDebugLog(`MQTT Error: ${err.message}`, 'error');
            
            // Don't immediately try to reconnect on error
            setTimeout(() => {
                if (!isConnected && !isExplicitDisconnect) {
                    addDebugLog('Attempting to reconnect after error...', 'info');
                    connectMQTT();
                }
            }, 5000);
        });
        
        // Improve offline/online handling
        client.on('offline', function() {
            addDebugLog('Client went offline', 'info');
            updateConnectionStatus('disconnected');
            isConnected = false;
        });
        
        client.on('reconnect', function() {
            addDebugLog('Attempting to reconnect...', 'info');
            updateConnectionStatus('connecting');
        });
    }
}

// Call fix function when needed
if (typeof client !== 'undefined') {
    fixMQTTConnection();
}