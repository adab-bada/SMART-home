// Schedule Management System
class ScheduleManager {
    constructor() {
        this.schedules = [];
        this.checkInterval = null;
        
        this.init();
    }
    
    init() {
        this.loadSchedules();
        this.renderSchedules();
        this.updateDeviceOptions();
        this.bindEvents();
        this.startScheduleChecker();
        this.updateScheduleDisplay();
        
        addDebugLog('Schedule manager initialized');
    }
    
    bindEvents() {
        const addScheduleBtn = document.getElementById('addScheduleBtn');
        const saveScheduleBtn = document.getElementById('saveScheduleBtn');
        const scheduleIntensity = document.getElementById('scheduleIntensity');
        
        if (addScheduleBtn) {
            addScheduleBtn.addEventListener('click', () => {
                this.showAddScheduleModal();
            });
        }
        
        if (saveScheduleBtn) {
            saveScheduleBtn.addEventListener('click', () => {
                this.addSchedule();
            });
        }
        
        if (scheduleIntensity) {
            scheduleIntensity.addEventListener('input', () => {
                const value = document.getElementById('scheduleIntensityValue');
                if (value) {
                    value.textContent = scheduleIntensity.value + '%';
                }
            });
        }
    }
    
    showAddScheduleModal() {
        this.updateDeviceOptions();
        document.getElementById('scheduleModal').style.display = 'flex';
    }
    
    loadSchedules() {
        this.schedules = getFromStorage('schedules', []);
        addDebugLog(`Loaded ${this.schedules.length} schedules`);
    }
    
    saveSchedules() {
        setToStorage('schedules', this.schedules);
        addDebugLog('Schedules saved to localStorage');
        
        // Trigger schedule display update
        this.updateScheduleDisplay();
    }
    
    addSchedule() {
        try {
            const name = document.getElementById('scheduleName').value.trim();
            const daysSelect = document.getElementById('scheduleDays');
            const time = document.getElementById('scheduleTime').value;
            const switchNum = document.getElementById('scheduleSwitch').value;
            const action = document.getElementById('scheduleAction').value;
            const intensity = document.getElementById('scheduleIntensity').value;
            
            // Get selected days
            const days = [];
            if (daysSelect) {
                for (let option of daysSelect.options) {
                    if (option.selected) {
                        days.push(parseInt(option.value));
                    }
                }
            }
            
            // Validation
            if (!name) {
                showToast('Nama jadwal tidak boleh kosong', 'error');
                return;
            }
            
            if (days.length === 0) {
                showToast('Pilih minimal satu hari', 'error');
                return;
            }
            
            if (!time) {
                showToast('Waktu harus diisi', 'error');
                return;
            }
            
            if (!switchNum) {
                showToast('Pilih perangkat', 'error');
                return;
            }
            
            const newSchedule = {
                id: generateId(),
                name,
                days,
                time,
                switchNum: parseInt(switchNum),
                action,
                intensity: parseInt(intensity)
            };
            
            this.schedules.push(newSchedule);
            this.saveSchedules();
            this.renderSchedules();
            
            // Close modal and reset form
            document.getElementById('scheduleModal').style.display = 'none';
            this.resetScheduleForm();
            
            showToast('Jadwal berhasil ditambahkan!', 'success');
            addDebugLog(`Schedule added: ${name}`, 'success');
            
        } catch (error) {
            handleError(error, 'addSchedule');
        }
    }
    
    resetScheduleForm() {
        document.getElementById('scheduleName').value = '';
        document.getElementById('scheduleTime').value = '';
        document.getElementById('scheduleIntensity').value = 100;
        document.getElementById('scheduleIntensityValue').textContent = '100%';
        
        const daysSelect = document.getElementById('scheduleDays');
        if (daysSelect) {
            for (let option of daysSelect.options) {
                option.selected = false;
            }
        }
        
        const switchSelect = document.getElementById('scheduleSwitch');
        if (switchSelect) {
            switchSelect.selectedIndex = 0;
        }
        
        const actionSelect = document.getElementById('scheduleAction');
        if (actionSelect) {
            actionSelect.selectedIndex = 0;
        }
    }
    
    renderSchedules() {
        const scheduleList = document.getElementById('scheduleList');
        if (!scheduleList) return;
        
        if (this.schedules.length === 0) {
            scheduleList.innerHTML = `
                <div class="schedule-card">
                    <p style="text-align: center; color: var(--text-secondary);">
                        Belum ada jadwal. Klik "Tambah Jadwal" untuk membuat jadwal baru.
                    </p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.schedules.forEach(schedule => {
            const daysText = schedule.days.map(day => getDayName(day)).join(', ');
            const deviceName = this.getDeviceName(schedule.switchNum);
            const actionName = this.getActionName(schedule.action);
            const intensityText = schedule.action === 'on' ? ` - Intensitas: ${schedule.intensity}%` : '';
            
            html += `
                <div class="schedule-card">
                    <h3>${schedule.name}</h3>
                    <div class="schedule-time">${daysText} - ${formatTime(schedule.time)}</div>
                    <p>Perangkat: ${deviceName} - Aksi: ${actionName}${intensityText}</p>
                    <div class="schedule-actions">
                        <button class="btn btn-warning btn-sm" onclick="scheduleManager.editSchedule(${schedule.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="scheduleManager.deleteSchedule(${schedule.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `;
        });
        
        scheduleList.innerHTML = html;
    }
    
    getDeviceName(switchNum) {
        if (window.deviceManager) {
            const device = window.deviceManager.getDevice(switchNum);
            return device ? device.name : `Switch ${switchNum}`;
        }
        return `Switch ${switchNum}`;
    }
    
    getActionName(action) {
        const names = {
            'on': 'Hidupkan',
            'off': 'Matikan',
            'toggle': 'Toggle'
        };
        return names[action] || 'Unknown';
    }
    
    editSchedule(id) {
        if (!window.isAdmin) {
            showToast('Hanya admin yang dapat mengedit jadwal', 'error');
            return;
        }
        
        const schedule = this.schedules.find(s => s.id === id);
        if (!schedule) return;
        
        // Fill form with schedule data
        document.getElementById('scheduleName').value = schedule.name;
        document.getElementById('scheduleTime').value = schedule.time;
        document.getElementById('scheduleSwitch').value = schedule.switchNum;
        document.getElementById('scheduleAction').value = schedule.action;
        document.getElementById('scheduleIntensity').value = schedule.intensity || 100;
        document.getElementById('scheduleIntensityValue').textContent = (schedule.intensity || 100) + '%';
        
        // Select days
        const daysSelect = document.getElementById('scheduleDays');
        if (daysSelect) {
            for (let option of daysSelect.options) {
                option.selected = schedule.days.includes(parseInt(option.value));
            }
        }
        
        // Remove old schedule and show modal for editing
        this.schedules = this.schedules.filter(s => s.id !== id);
        document.getElementById('scheduleModal').style.display = 'flex';
        
        addDebugLog(`Editing schedule: ${schedule.name}`, 'info');
    }
    
    deleteSchedule(id) {
        if (!window.isAdmin) {
            showToast('Hanya admin yang dapat menghapus jadwal', 'error');
            return;
        }
        
        if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
            this.schedules = this.schedules.filter(s => s.id !== id);
            this.saveSchedules();
            this.renderSchedules();
            
            showToast('Jadwal berhasil dihapus', 'success');
            addDebugLog('Schedule deleted', 'success');
        }
    }
    
    updateDeviceOptions() {
        const switchSelect = document.getElementById('scheduleSwitch');
        if (!switchSelect) return;
        
        switchSelect.innerHTML = '';
        
        const devices = window.deviceManager ? window.deviceManager.getDevices() : window.deviceConfig || [];
        
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            switchSelect.appendChild(option);
        });
    }
    
    startScheduleChecker() {
        // Check schedules every minute
        this.checkInterval = setInterval(() => {
            this.checkSchedules();
        }, 60000);
        
        addDebugLog('Schedule checker started');
    }
    
    checkSchedules() {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
        
        this.schedules.forEach(schedule => {
            if (schedule.days.includes(currentDay) && schedule.time === currentTime) {
                this.executeSchedule(schedule);
            }
        });
    }
    
    executeSchedule(schedule) {
        if (!window.mqttClient || !window.mqttClient.isConnected) {
            addDebugLog('Cannot execute schedule: not connected to MQTT', 'error');
            return;
        }
        
        const switchElement = document.getElementById(`switch${schedule.switchNum}`);
        if (!switchElement) return;
        
        let newState, pwmValue;
        
        switch (schedule.action) {
            case 'on':
                newState = 'ON';
                pwmValue = schedule.intensity || 100;
                switchElement.checked = true;
                break;
            case 'off':
                newState = 'OFF';
                pwmValue = 0;
                switchElement.checked = false;
                break;
            case 'toggle':
                newState = switchElement.checked ? 'OFF' : 'ON';
                pwmValue = switchElement.checked ? 0 : (schedule.intensity || 100);
                switchElement.checked = !switchElement.checked;
                break;
        }
        
        // Update PWM slider
        const pwmSlider = document.getElementById(`pwmSlider${schedule.switchNum}`);
        const pwmValueElement = document.getElementById(`pwmValue${schedule.switchNum}`);
        if (pwmSlider && pwmValueElement) {
            pwmSlider.value = pwmValue;
            pwmValueElement.textContent = `${pwmValue}%`;
        }
        
        // Send MQTT command
        window.mqttClient.controlDevice(schedule.switchNum, newState, pwmValue);
        
        // Save device states
        saveDeviceStates();
        
        addDebugLog(`Schedule executed: ${schedule.name} - ${newState}`, 'success');
        showToast(`Schedule executed: ${schedule.name}`, 'success');
    }
    
    updateScheduleDisplay() {
        const switchCards = document.querySelectorAll('.switch-card');
        
        // Clear existing schedule indicators
        switchCards.forEach(card => {
            card.classList.remove('has-schedule');
            const existingBtn = card.querySelector('.schedule-toggle-btn');
            if (existingBtn) existingBtn.remove();
        });
        
        // Group schedules by switch
        const schedulesBySwitch = {};
        this.schedules.forEach(schedule => {
            const switchNum = schedule.switchNum.toString();
            if (!schedulesBySwitch[switchNum]) {
                schedulesBySwitch[switchNum] = [];
            }
            schedulesBySwitch[switchNum].push(schedule);
        });
        
        // Add schedule indicators to cards
        Object.keys(schedulesBySwitch).forEach(switchNum => {
            const switchCard = document.querySelector(`[data-switch="${switchNum}"]`);
            if (switchCard) {
                switchCard.classList.add('has-schedule');
                
                // Add schedule toggle button
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'schedule-toggle-btn';
                toggleBtn.textContent = 'Jadwal';
                toggleBtn.onclick = () => this.showSchedulePopup(switchNum);
                
                switchCard.appendChild(toggleBtn);
            }
        });
        
        addDebugLog(`Schedule display updated for ${Object.keys(schedulesBySwitch).length} switches`);
    }
    
    showSchedulePopup(switchNum) {
        const schedules = this.schedules.filter(s => s.switchNum.toString() === switchNum);
        if (schedules.length === 0) return;
        
        // Create popup if not exists
        let popup = document.getElementById('schedulePopup');
        let overlay = document.getElementById('popupOverlay');
        
        if (!popup) {
            // Create overlay
            overlay = document.createElement('div');
            overlay.id = 'popupOverlay';
            overlay.className = 'popup-overlay';
            overlay.onclick = this.hideSchedulePopup;
            document.body.appendChild(overlay);
            
            // Create popup
            popup = document.createElement('div');
            popup.id = 'schedulePopup';
            popup.className = 'schedule-popup';
            document.body.appendChild(popup);
        }
        
        // Get device name
        const deviceName = this.getDeviceName(parseInt(switchNum));
        
        // Generate popup content
        const scheduleItems = schedules.map(schedule => `
            <div class="schedule-popup-item">
                <div>
                    <div style="font-weight: bold;">${schedule.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${schedule.days.map(day => getShortDayName(day)).join(', ')}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="schedule-popup-time">${formatTime(schedule.time)}</div>
                    <div class="schedule-popup-action ${schedule.action === 'off' ? 'off' : ''}">
                        ${schedule.action.toUpperCase()}
                    </div>
                </div>
            </div>
        `).join('');
        
        popup.innerHTML = `
            <div class="schedule-popup-header">
                <div class="schedule-popup-title">📅 Jadwal ${deviceName}</div>
                <button class="schedule-popup-close" onclick="scheduleManager.hideSchedulePopup()">&times;</button>
            </div>
            <div class="schedule-popup-content">
                ${scheduleItems}
            </div>
        `;
        
        // Show popup
        overlay.classList.add('show');
        popup.classList.add('show');
    }
    
    hideSchedulePopup() {
        const popup = document.getElementById('schedulePopup');
        const overlay = document.getElementById('popupOverlay');
        
        if (popup) popup.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    }
    
    renderSchedules() {
        const scheduleList = document.getElementById('scheduleList');
        if (!scheduleList) return;
        
        if (this.schedules.length === 0) {
            scheduleList.innerHTML = `
                <div class="schedule-card">
                    <p style="text-align: center; color: var(--text-secondary);">
                        Belum ada jadwal. Klik "Tambah Jadwal" untuk membuat jadwal baru.
                    </p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.schedules.forEach(schedule => {
            const daysText = schedule.days.map(day => getDayName(day)).join(', ');
            const deviceName = this.getDeviceName(schedule.switchNum);
            const actionName = this.getActionName(schedule.action);
            const intensityText = schedule.action === 'on' ? ` - Intensitas: ${schedule.intensity}%` : '';
            
            html += `
                <div class="schedule-card">
                    <h3>${schedule.name}</h3>
                    <div class="schedule-time">${daysText} - ${formatTime(schedule.time)}</div>
                    <p>Perangkat: ${deviceName} - Aksi: ${actionName}${intensityText}</p>
                    <div class="schedule-actions">
                        <button class="btn btn-warning btn-sm" onclick="scheduleManager.editSchedule(${schedule.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="scheduleManager.deleteSchedule(${schedule.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `;
        });
        
        scheduleList.innerHTML = html;
    }
    
    startScheduleChecker() {
        // Check schedules every minute
        this.checkInterval = setInterval(() => {
            this.checkSchedules();
        }, 60000);
        
        addDebugLog('Schedule checker started');
    }
    
    checkSchedules() {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
        
        this.schedules.forEach(schedule => {
            if (schedule.days.includes(currentDay) && schedule.time === currentTime) {
                this.executeSchedule(schedule);
            }
        });
    }
    
    executeSchedule(schedule) {
        if (!window.mqttClient || !window.mqttClient.isConnected) {
            addDebugLog('Cannot execute schedule: not connected to MQTT', 'error');
            return;
        }
        
        const switchElement = document.getElementById(`switch${schedule.switchNum}`);
        if (!switchElement) return;
        
        let newState, pwmValue;
        
        switch (schedule.action) {
            case 'on':
                newState = 'ON';
                pwmValue = schedule.intensity || 100;
                switchElement.checked = true;
                break;
            case 'off':
                newState = 'OFF';
                pwmValue = 0;
                switchElement.checked = false;
                break;
            case 'toggle':
                newState = switchElement.checked ? 'OFF' : 'ON';
                pwmValue = switchElement.checked ? 0 : (schedule.intensity || 100);
                switchElement.checked = !switchElement.checked;
                break;
        }
        
        // Update PWM controls
        const pwmSlider = document.getElementById(`pwmSlider${schedule.switchNum}`);
        const pwmValueElement = document.getElementById(`pwmValue${schedule.switchNum}`);
        if (pwmSlider && pwmValueElement) {
            pwmSlider.value = pwmValue;
            pwmValueElement.textContent = `${pwmValue}%`;
        }
        
        // Send MQTT command
        window.mqttClient.controlDevice(schedule.switchNum, newState, pwmValue);
        
        // Save device states
        saveDeviceStates();
        
        addDebugLog(`Schedule executed: ${schedule.name} - ${newState}`, 'success');
        showToast(`Schedule executed: ${schedule.name}`, 'success');
    }
    
    updateDeviceOptions() {
        const switchSelect = document.getElementById('scheduleSwitch');
        if (!switchSelect) return;
        
        switchSelect.innerHTML = '';
        
        const devices = window.deviceManager ? window.deviceManager.getDevices() : window.deviceConfig || [];
        
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            switchSelect.appendChild(option);
        });
    }
}

// Initialize schedule manager
window.scheduleManager = new ScheduleManager();