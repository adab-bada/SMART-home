// Tambah jadwal
function addSchedule() {
    try {
        console.log('addSchedule() called');
        
        const name = document.getElementById('scheduleName').value;
        const daysSelect = document.getElementById('scheduleDays');
        
        // Get selected days manually
        let days = [];
        if (daysSelect) {
            for (let i = 0; i < daysSelect.options.length; i++) {
                if (daysSelect.options[i].selected) {
                    days.push(parseInt(daysSelect.options[i].value));
                }
            }
        }
        
        const time = document.getElementById('scheduleTime').value;
        const switchNum = document.getElementById('scheduleSwitch').value;
        const action = document.getElementById('scheduleAction').value;
        const intensity = document.getElementById('scheduleIntensity').value;
        
        console.log('Form values:', { name, days, time, switchNum, action, intensity });
        
        if (!name || days.length === 0 || !time || !switchNum) {
            alert('Harap isi semua field yang diperlukan');
            return;
        }
        
        const newSchedule = {
            id: Date.now(),
            name,
            days,
            time,
            switchNum: parseInt(switchNum),
            action,
            intensity: parseInt(intensity)
        };
        
        console.log('New schedule:', newSchedule);
        
        // Initialize schedules array if not exists
        if (!window.schedules) {
            window.schedules = [];
        }
        
        window.schedules.push(newSchedule);
        saveSchedules();
        renderSchedules();
        
        // Close modal
        const modal = document.getElementById('scheduleModal');
        if (modal) modal.style.display = 'none';
        
        alert('Jadwal berhasil ditambahkan!');
        
        // Reset form
        document.getElementById('scheduleName').value = '';
        if (daysSelect) {
            for (let i = 0; i < daysSelect.options.length; i++) {
                daysSelect.options[i].selected = false;
            }
        }
        document.getElementById('scheduleTime').value = '';
        const switchSelect = document.getElementById('scheduleSwitch');
        if (switchSelect) switchSelect.selectedIndex = 0;
        const actionSelect = document.getElementById('scheduleAction');
        if (actionSelect) actionSelect.selectedIndex = 0;
        document.getElementById('scheduleIntensity').value = 100;
        
    } catch (error) {
        console.error('Error in addSchedule:', error);
        alert('Error: ' + error.message);
    }
}

// Make function global
window.addSchedule = addSchedule;

// Simpan jadwal ke localStorage
function saveSchedules() {
    if (!window.schedules) window.schedules = [];
    localStorage.setItem('schedules', JSON.stringify(window.schedules));
    console.log('Schedules saved:', window.schedules);
    // Trigger schedule display update
    document.dispatchEvent(new CustomEvent('scheduleUpdated'));
}

// Render daftar jadwal
function renderSchedules() {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;
    
    scheduleList.innerHTML = '';
    
    if (!window.schedules) window.schedules = [];
    
    console.log('Rendering schedules:', window.schedules);
    
    if (window.schedules.length === 0) {
        scheduleList.innerHTML = '<p>Belum ada jadwal. Tambahkan jadwal baru.</p>';
        return;
    }
    
    window.schedules.forEach(schedule => {
        let daysText = '';
        if (schedule.days && Array.isArray(schedule.days)) {
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            daysText = schedule.days.map(day => dayNames[day]).join(', ');
        } else {
            daysText = 'Tidak ada hari dipilih';
        }
        
        const intensityText = schedule.action === 'on' ? ` - Intensitas: ${schedule.intensity}%` : '';
        let deviceName = `Saklar ${schedule.switchNum}`;
        if (window.deviceConfigManager) {
            const device = window.deviceConfigManager.getDevices().find(d => d.id == schedule.switchNum);
            if (device) deviceName = device.name;
        }
        
        const scheduleElement = document.createElement('div');
        scheduleElement.className = 'schedule-card';
        scheduleElement.innerHTML = `
            <h3>${schedule.name}</h3>
            <div class="schedule-time">${daysText} - ${schedule.time}</div>
            <p>Saklar: ${deviceName} - Aksi: ${getActionName(schedule.action)}${intensityText}</p>
            <div class="schedule-actions">
                <button class="btn btn-warning btn-sm edit-btn" data-id="${schedule.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${schedule.id}">Hapus</button>
            </div>
        `;
        
        scheduleList.appendChild(scheduleElement);
    });
    
    // Tambahkan event listener untuk tombol edit dan hapus
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            editSchedule(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            deleteSchedule(id);
        });
    });
}

// Dapatkan nama aksi
function getActionName(action) {
    const names = {
        'on': 'Hidupkan',
        'off': 'Matikan',
        'toggle': 'Toggle'
    };
    return names[action] || 'Tidak diketahui';
}

// Edit jadwal
function editSchedule(id) {
    if (!isAdmin) {
        showAlert('Hanya admin yang dapat mengedit jadwal', 'error');
        showToast('Hanya admin yang dapat mengedit jadwal', 'error');
        return;
    }
    
    const schedule = window.schedules.find(s => s.id === id);
    if (!schedule) return;
    
    // Isi form dengan data jadwal
    document.getElementById('scheduleName').value = schedule.name;
    
    const daysSelect = document.getElementById('scheduleDays');
    Array.from(daysSelect.options).forEach(option => {
        option.selected = schedule.days.includes(parseInt(option.value));
    });
    
    document.getElementById('scheduleTime').value = schedule.time;
    document.getElementById('scheduleSwitch').value = schedule.switchNum;
    document.getElementById('scheduleAction').value = schedule.action;
    document.getElementById('scheduleIntensity').value = schedule.intensity || 100;
    document.getElementById('scheduleIntensityValue').textContent = (schedule.intensity || 100) + '%';
    
    // Hapus jadwal lama dan buka modal untuk editing
    window.schedules = window.schedules.filter(s => s.id !== id);
    document.getElementById('scheduleModal').style.display = 'flex';
    
    addDebugLog(`Mengedit jadwal: ${schedule.name}`, 'info');
}

// Hapus jadwal
function deleteSchedule(id) {
    if (!isAdmin) {
        showAlert('Hanya admin yang dapat menghapus jadwal', 'error');
        showToast('Hanya admin yang dapat menghapus jadwal', 'error');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
        window.schedules = window.schedules.filter(s => s.id !== id);
        saveSchedules();
        renderSchedules();
        console.log('Schedule deleted');
        alert('Jadwal berhasil dihapus');
    }
}

// Muat jadwal dari localStorage
function loadSchedules() {
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) {
        window.schedules = JSON.parse(savedSchedules);
    } else {
        window.schedules = [];
    }
    console.log('Schedules loaded:', window.schedules);
}

// Jalankan pengecekan jadwal setiap detik
function checkSchedules() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substr(0, 8);
    
    window.schedules.forEach(schedule => {
        if (schedule.days.includes(currentDay) && schedule.time === currentTime) {
            executeSchedule(schedule);
        }
    });
}

// Eksekusi aksi jadwal
function executeSchedule(schedule) {
    if (!isConnected) {
        addDebugLog('Tidak terhubung, tidak dapat menjalankan jadwal', 'error');
        return;
    }
    
    const switchElement = document.getElementById(`switch${schedule.switchNum}`);
    const pwmSlider = document.getElementById(`pwmSlider${schedule.switchNum}`);
    
    switch (schedule.action) {
        case 'on':
            switchElement.checked = true;
            controlLight(schedule.switchNum, 'ON', parseInt(schedule.intensity || 100));
            break;
        case 'off':
            switchElement.checked = false;
            controlLight(schedule.switchNum, 'OFF', 0);
            break;
        case 'toggle':
            switchElement.checked = !switchElement.checked;
            const state = switchElement.checked ? 'ON' : 'OFF';
            const pwm = switchElement.checked ? parseInt(schedule.intensity || 100) : 0;
            controlLight(schedule.switchNum, state, pwm);
            break;
    }
    
    addDebugLog(`Jadwal dieksekusi: ${schedule.name}`, 'success');
}

// Populate switch options in schedule modal
function populateSwitchOptions() {
    const switchSelect = document.getElementById('scheduleSwitch');
    if (!switchSelect) return;
    
    switchSelect.innerHTML = '';
    
    let devices = [];
    if (window.deviceConfigManager) {
        devices = window.deviceConfigManager.getDevices();
    } else {
        // Fallback devices
        devices = [
            { id: 1, name: 'Lampu Ruang Tamu' },
            { id: 2, name: 'Lampu Kamar Tidur' },
            { id: 3, name: 'Lampu Dapur' },
            { id: 4, name: 'Lampu Teras' }
        ];
    }
    
    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        option.textContent = device.name;
        switchSelect.appendChild(option);
    });
}

// Inisialisasi tambahan setelah DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadSchedules();
        renderSchedules();
        populateSwitchOptions();
        
        // Jalankan pengecekan jadwal setiap detik
        setInterval(checkSchedules, 1000);
        
        addDebugLog('Schedule functions ready', 'success');
    }, 2000);
});

// Update switch options when device config changes
document.addEventListener('deviceConfigChanged', () => {
    setTimeout(populateSwitchOptions, 100);
});

// Also populate when modal opens
document.addEventListener('click', (e) => {
    if (e.target.id === 'addScheduleBtn') {
        setTimeout(populateSwitchOptions, 100);
    }
});