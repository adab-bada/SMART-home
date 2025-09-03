// Device Management System
class DeviceManager {
    constructor() {
        this.devices = [];
        this.intensityEnabled = [false, false, false, false];
        this.availableIcons = [
            // Lighting
            { icon: 'fas fa-lightbulb', name: 'Lampu', category: 'Lighting' },
            { icon: 'fas fa-sun', name: 'Matahari', category: 'Lighting' },
            { icon: 'fas fa-moon', name: 'Bulan', category: 'Lighting' },
            { icon: 'fas fa-fire', name: 'Api', category: 'Lighting' },
            
            // Rooms
            { icon: 'fas fa-home', name: 'Rumah', category: 'Rooms' },
            { icon: 'fas fa-bed', name: 'Kamar Tidur', category: 'Rooms' },
            { icon: 'fas fa-utensils', name: 'Dapur', category: 'Rooms' },
            { icon: 'fas fa-couch', name: 'Ruang Tamu', category: 'Rooms' },
            { icon: 'fas fa-bath', name: 'Kamar Mandi', category: 'Rooms' },
            { icon: 'fas fa-door-open', name: 'Pintu', category: 'Rooms' },
            
            // Appliances
            { icon: 'fas fa-tv', name: 'TV', category: 'Appliances' },
            { icon: 'fas fa-fan', name: 'Kipas', category: 'Appliances' },
            { icon: 'fas fa-snowflake', name: 'AC', category: 'Appliances' },
            { icon: 'fas fa-thermometer-half', name: 'Heater', category: 'Appliances' },
            { icon: 'fas fa-music', name: 'Speaker', category: 'Appliances' },
            { icon: 'fas fa-camera', name: 'Kamera', category: 'Appliances' },
            
            // Security
            { icon: 'fas fa-shield-alt', name: 'Keamanan', category: 'Security' },
            { icon: 'fas fa-lock', name: 'Kunci', category: 'Security' },
            { icon: 'fas fa-key', name: 'Kunci Pintu', category: 'Security' },
            { icon: 'fas fa-eye', name: 'CCTV', category: 'Security' },
            
            // Electronics
            { icon: 'fas fa-plug', name: 'Stop Kontak', category: 'Electronics' },
            { icon: 'fas fa-bolt', name: 'Listrik', category: 'Electronics' },
            { icon: 'fas fa-power-off', name: 'Power', category: 'Electronics' },
            { icon: 'fas fa-microchip', name: 'Smart Device', category: 'Electronics' }
        ];
        
        this.init();
    }
    
    init() {
        this.loadDevices();
        this.generateSwitchCards();
        this.renderDeviceConfig();
        this.bindEvents();
        
        addDebugLog('Device manager initialized');
    }
    
    loadDevices() {
        this.devices = getFromStorage('deviceConfig', [
            { id: 1, name: 'Lampu Ruang Tamu', icon: 'fas fa-lightbulb' },
            { id: 2, name: 'Lampu Kamar Tidur', icon: 'fas fa-bed' },
            { id: 3, name: 'Lampu Dapur', icon: 'fas fa-utensils' },
            { id: 4, name: 'Lampu Teras', icon: 'fas fa-home' }
        ]);
        
        // Update global variable for compatibility
        window.deviceConfig = this.devices;
    }
    
    saveDevices() {
        setToStorage('deviceConfig', this.devices);
        window.deviceConfig = this.devices;
        
        // Regenerate switch cards
        this.generateSwitchCards();
        
        // Update schedule options
        if (window.scheduleManager) {
            window.scheduleManager.updateDeviceOptions();
        }
        
        addDebugLog('Device configuration saved');
    }
    
    generateSwitchCards() {
        const switchGrid = document.getElementById('switchGrid');
        if (!switchGrid) return;
        
        const currentAnimation = window.themeManager ? window.themeManager.currentAnimation : 'flip';
        let html = '';
        
        this.devices.forEach((device, index) => {
            const num = device.id;
            html += `
                <div class="switch-card" data-switch="${num}">
                    <div class="switch-icon">
                        <i class="${device.icon}"></i>
                    </div>
                    <div class="switch-title">${device.name}</div>
                    <div class="switch-control">
                        <div class="switch-3d ${currentAnimation}" onclick="toggleSwitch(${num})">
                            <input type="checkbox" id="switch${num}">
                            <div class="switch-3d-inner">
                                <div class="switch-face front">OFF</div>
                                <div class="switch-face back">ON</div>
                            </div>
                        </div>
                    </div>
                    <div class="intensity-control">
                        <div class="intensity-toggle">
                            <span class="toggle-label">Kontrol Intensitas</span>
                            <label class="intensity-switch">
                                <input type="checkbox" id="intensityToggle${num}" onchange="toggleIntensity(${num})">
                                <span class="intensity-slider"></span>
                            </label>
                        </div>
                        <div class="pwm-control hidden" id="pwmControl${num}">
                            <label>Intensitas: <span class="pwm-value" id="pwmValue${num}">100%</span></label>
                            <input type="range" min="0" max="100" value="100" class="pwm-slider" id="pwmSlider${num}" oninput="updatePWMValue(${num})">
                        </div>
                    </div>
                </div>
            `;
        });
        
        switchGrid.innerHTML = html;
        
        // Attach switch listeners
        this.attachSwitchListeners();
        
        // Trigger schedule display update
        setTimeout(() => {
            if (window.scheduleManager) {
                window.scheduleManager.updateScheduleDisplay();
            }
        }, 100);
        
        addDebugLog(`Generated ${this.devices.length} switch cards`);
    }
    
    attachSwitchListeners() {
        this.devices.forEach(device => {
            const num = device.id;
            const switchElement = document.getElementById(`switch${num}`);
            const pwmSlider = document.getElementById(`pwmSlider${num}`);
            const intensityToggle = document.getElementById(`intensityToggle${num}`);
            
            if (switchElement) {
                switchElement.addEventListener('change', () => {
                    const state = switchElement.checked ? 'ON' : 'OFF';
                    let pwmVal = pwmSlider ? parseInt(pwmSlider.value) : 100;
                    
                    if (!this.intensityEnabled[num - 1]) {
                        pwmVal = switchElement.checked ? 100 : 0;
                    }
                    
                    if (window.mqttClient) {
                        window.mqttClient.controlDevice(num, state, pwmVal);
                    }
                    
                    saveDeviceStates();
                    addDebugLog(`Switch ${num} changed to: ${state}`);
                });
            }
            
            if (pwmSlider) {
                pwmSlider.addEventListener('input', () => {
                    const pwmValue = document.getElementById(`pwmValue${num}`);
                    if (pwmValue) {
                        pwmValue.textContent = `${pwmSlider.value}%`;
                    }
                    
                    if (switchElement && switchElement.checked && this.intensityEnabled[num - 1]) {
                        if (window.mqttClient) {
                            window.mqttClient.controlDevice(num, 'ON', parseInt(pwmSlider.value));
                        }
                        saveDeviceStates();
                    }
                });
            }
        });
    }
    
    renderDeviceConfig() {
        const deviceConfigList = document.getElementById('deviceConfigList');
        if (!deviceConfigList) return;
        
        let html = '';
        this.devices.forEach(device => {
            html += `
                <div class="device-config-item" data-device-id="${device.id}">
                    <div class="device-config-header">
                        <div class="device-preview">
                            <i class="${device.icon}" style="font-size: 24px; color: var(--primary);"></i>
                            <span class="device-name">${device.name}</span>
                        </div>
                        <button class="btn btn-primary btn-sm edit-device-btn" data-device-id="${device.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `;
        });
        
        deviceConfigList.innerHTML = html;
    }
    
    bindEvents() {
        // Edit device buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-device-btn')) {
                const deviceId = parseInt(e.target.closest('.edit-device-btn').dataset.deviceId);
                this.showEditModal(deviceId);
            }
        });
        
        // Save device config button
        const saveBtn = document.getElementById('saveDeviceConfigBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveDevices();
                showToast('Device configuration saved!', 'success');
            });
        }
    }
    
    showEditModal(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;
        
        this.createEditModal(device);
    }
    
    createEditModal(device) {
        // Remove existing modal
        const existingModal = document.getElementById('deviceEditModal');
        if (existingModal) existingModal.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'deviceEditModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const iconCategoriesHTML = this.renderIconCategories();
        const iconGridHTML = this.renderIconGrid('All');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Edit Perangkat: ${device.name}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nama Perangkat</label>
                        <input type="text" id="deviceName" class="form-control" value="${device.name}">
                    </div>
                    <div class="form-group">
                        <label>Pilih Ikon (${this.availableIcons.length} tersedia)</label>
                        <div class="icon-categories">
                            ${iconCategoriesHTML}
                        </div>
                        <div class="icon-grid" id="iconGrid">
                            ${iconGridHTML}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="deviceManager.saveDeviceEdit(${device.id})">Simpan</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set current icon as selected
        setTimeout(() => {
            const currentIcon = modal.querySelector(`[data-icon="${device.icon}"]`);
            if (currentIcon) {
                currentIcon.classList.add('selected');
                modal.selectedIcon = device.icon;
            }
        }, 100);
        
        // Bind category filter events
        this.bindModalEvents(modal, device);
    }
    
    bindModalEvents(modal, device) {
        // Category selection
        modal.querySelectorAll('.icon-category').forEach(cat => {
            cat.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                
                modal.querySelectorAll('.icon-category').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                
                const iconGrid = modal.querySelector('#iconGrid');
                iconGrid.innerHTML = this.renderIconGrid(category);
                
                // Restore selection
                setTimeout(() => {
                    const currentIcon = modal.querySelector(`[data-icon="${device.icon}"]`);
                    if (currentIcon) {
                        currentIcon.classList.add('selected');
                        modal.selectedIcon = device.icon;
                    }
                }, 50);
                
                // Re-bind icon selection
                this.bindIconSelection(modal);
            });
        });
        
        // Icon selection
        this.bindIconSelection(modal);
    }
    
    bindIconSelection(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.icon-option')) {
                const iconOption = e.target.closest('.icon-option');
                const icon = iconOption.dataset.icon;
                
                // Remove previous selection
                modal.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked icon
                iconOption.classList.add('selected');
                
                // Store selected icon
                modal.selectedIcon = icon;
            }
        });
    }
    
    renderIconCategories() {
        const categories = ['All', ...new Set(this.availableIcons.map(icon => icon.category))];
        return categories.map(cat => 
            `<button class="icon-category ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>`
        ).join('');
    }
    
    renderIconGrid(category) {
        const icons = category === 'All' ? this.availableIcons : 
                     this.availableIcons.filter(icon => icon.category === category);
        
        return icons.map(iconData => `
            <div class="icon-option" data-icon="${iconData.icon}" title="${iconData.name}">
                <i class="${iconData.icon}"></i>
                <span>${iconData.name}</span>
            </div>
        `).join('');
    }
    
    saveDeviceEdit(deviceId) {
        const modal = document.getElementById('deviceEditModal');
        const newName = modal.querySelector('#deviceName').value.trim();
        const newIcon = modal.selectedIcon;
        
        if (!newName) {
            showToast('Nama perangkat tidak boleh kosong!', 'error');
            return;
        }
        
        if (!newIcon) {
            showToast('Pilih ikon untuk perangkat!', 'error');
            return;
        }
        
        // Update device
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            device.name = newName;
            device.icon = newIcon;
            
            this.saveDevices();
            this.renderDeviceConfig();
            
            showToast('Perangkat berhasil diperbarui!', 'success');
        }
        
        modal.remove();
    }
    
    getDevices() {
        return this.devices;
    }
    
    getDevice(id) {
        return this.devices.find(d => d.id === id);
    }
}

// Global functions for switch control
function toggleSwitch(switchNum) {
    const switchInput = document.getElementById(`switch${switchNum}`);
    if (!switchInput) return;
    
    switchInput.checked = !switchInput.checked;
    
    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    switchInput.dispatchEvent(changeEvent);
}

function toggleIntensity(switchNum) {
    const intensityToggle = document.getElementById(`intensityToggle${switchNum}`);
    const pwmControl = document.getElementById(`pwmControl${switchNum}`);
    
    if (!intensityToggle || !pwmControl) return;
    
    if (window.deviceManager) {
        window.deviceManager.intensityEnabled[switchNum - 1] = intensityToggle.checked;
    }
    
    if (intensityToggle.checked) {
        pwmControl.classList.remove('hidden');
        addDebugLog(`Intensity control enabled for switch ${switchNum}`);
    } else {
        pwmControl.classList.add('hidden');
        
        // Set PWM to 100% if switch is ON
        const switchElement = document.getElementById(`switch${switchNum}`);
        const pwmSlider = document.getElementById(`pwmSlider${switchNum}`);
        const pwmValue = document.getElementById(`pwmValue${switchNum}`);
        
        if (switchElement && switchElement.checked && pwmSlider && pwmValue) {
            pwmSlider.value = 100;
            pwmValue.textContent = '100%';
            
            if (window.mqttClient) {
                window.mqttClient.controlDevice(switchNum, 'ON', 100);
            }
        }
        
        addDebugLog(`Intensity control disabled for switch ${switchNum}`);
    }
    
    saveDeviceStates();
}

function updatePWMValue(switchNum) {
    const pwmSlider = document.getElementById(`pwmSlider${switchNum}`);
    const pwmValue = document.getElementById(`pwmValue${switchNum}`);
    
    if (pwmSlider && pwmValue) {
        pwmValue.textContent = `${pwmSlider.value}%`;
        
        const switchElement = document.getElementById(`switch${switchNum}`);
        if (switchElement && switchElement.checked && window.deviceManager && window.deviceManager.intensityEnabled[switchNum - 1]) {
            if (window.mqttClient) {
                window.mqttClient.controlDevice(switchNum, 'ON', parseInt(pwmSlider.value));
            }
            saveDeviceStates();
        }
    }
}

// Initialize device manager
window.deviceManager = new DeviceManager();