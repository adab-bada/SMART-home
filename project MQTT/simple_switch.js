// Simple 3D switch toggle function
function toggleSwitch3D(switchNum) {
    const switchInput = document.getElementById(`switch${switchNum}`);
    if (!switchInput) return;
    
    // Toggle the checkbox
    switchInput.checked = !switchInput.checked;
    
    const state = switchInput.checked ? 'ON' : 'OFF';
    addDebugLog(`Switch ${switchNum} diubah menjadi: ${state}`);
    
    // Get PWM value
    const pwmSlider = document.getElementById(`pwmSlider${switchNum}`);
    let pwmVal = pwmSlider ? parseInt(pwmSlider.value) : 100;
    
    // If intensity control is disabled, use 100% for ON, 0% for OFF
    if (!intensityEnabled[switchNum-1]) {
        pwmVal = switchInput.checked ? 100 : 0;
    }
    
    // Send MQTT command
    controlLight(switchNum, state, pwmVal);
    
    // Save device states
    saveDeviceStates();
}