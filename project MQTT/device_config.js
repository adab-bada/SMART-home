// Device Configuration Manager
class DeviceConfigManager {
    constructor() {
        this.devices = [
            { id: 1, name: 'Lampu Ruang Tamu', icon: 'fas fa-lightbulb' },
            { id: 2, name: 'Lampu Kamar Tidur', icon: 'fas fa-bed' },
            { id: 3, name: 'Lampu Dapur', icon: 'fas fa-utensils' },
            { id: 4, name: 'Lampu Teras', icon: 'fas fa-home' }
        ];
        
        this.availableIcons = [
            // Lighting
            { icon: 'fas fa-lightbulb', name: 'Lampu', category: 'Lighting' },
            { icon: 'fas fa-sun', name: 'Matahari', category: 'Lighting' },
            { icon: 'fas fa-moon', name: 'Bulan', category: 'Lighting' },
            { icon: 'fas fa-fire', name: 'Api', category: 'Lighting' },
            { icon: 'fas fa-candle-holder', name: 'Lilin', category: 'Lighting' },
            
            // Rooms
            { icon: 'fas fa-home', name: 'Rumah', category: 'Rooms' },
            { icon: 'fas fa-bed', name: 'Kamar Tidur', category: 'Rooms' },
            { icon: 'fas fa-utensils', name: 'Dapur', category: 'Rooms' },
            { icon: 'fas fa-couch', name: 'Ruang Tamu', category: 'Rooms' },
            { icon: 'fas fa-bath', name: 'Kamar Mandi', category: 'Rooms' },
            { icon: 'fas fa-door-open', name: 'Pintu', category: 'Rooms' },
            { icon: 'fas fa-stairs', name: 'Tangga', category: 'Rooms' },
            { icon: 'fas fa-warehouse', name: 'Garasi', category: 'Rooms' },
            
            // Appliances
            { icon: 'fas fa-tv', name: 'TV', category: 'Appliances' },
            { icon: 'fas fa-fan', name: 'Kipas', category: 'Appliances' },
            { icon: 'fas fa-snowflake', name: 'AC', category: 'Appliances' },
            { icon: 'fas fa-thermometer-half', name: 'Heater', category: 'Appliances' },
            { icon: 'fas fa-music', name: 'Speaker', category: 'Appliances' },
            { icon: 'fas fa-camera', name: 'Kamera', category: 'Appliances' },
            { icon: 'fas fa-wifi', name: 'WiFi', category: 'Appliances' },
            
            // Outdoor
            { icon: 'fas fa-tree', name: 'Taman', category: 'Outdoor' },
            { icon: 'fas fa-seedling', name: 'Tanaman', category: 'Outdoor' },
            { icon: 'fas fa-car', name: 'Mobil', category: 'Outdoor' },
            { icon: 'fas fa-swimming-pool', name: 'Kolam', category: 'Outdoor' },
            { icon: 'fas fa-umbrella-beach', name: 'Teras', category: 'Outdoor' },
            
            // Security
            { icon: 'fas fa-shield-alt', name: 'Keamanan', category: 'Security' },
            { icon: 'fas fa-lock', name: 'Kunci', category: 'Security' },
            { icon: 'fas fa-key', name: 'Kunci Pintu', category: 'Security' },
            { icon: 'fas fa-eye', name: 'CCTV', category: 'Security' },
            { icon: 'fas fa-bell', name: 'Alarm', category: 'Security' },
            
            // Electronics
            { icon: 'fas fa-plug', name: 'Stop Kontak', category: 'Electronics' },
            { icon: 'fas fa-bolt', name: 'Listrik', category: 'Electronics' },
            { icon: 'fas fa-battery-full', name: 'Baterai', category: 'Electronics' },
            { icon: 'fas fa-power-off', name: 'Power', category: 'Electronics' },
            { icon: 'fas fa-microchip', name: 'Smart Device', category: 'Electronics' },
            
            // Miscellaneous
            { icon: 'fas fa-cog', name: 'Pengaturan', category: 'Misc' },
            { icon: 'fas fa-star', name: 'Favorit', category: 'Misc' },
            { icon: 'fas fa-heart', name: 'Kesukaan', category: 'Misc' },
            { icon: 'fas fa-clock', name: 'Timer', category: 'Misc' },
            { icon: 'fas fa-thermometer', name: 'Sensor', category: 'Misc' }
        ];
        
        this.init();
    }
    
    init() {
        try {
            this.loadDevices();
            console.log('✅ Devices loaded:', this.devices.length);
            
            this.renderDeviceConfig();
            console.log('✅ Device config rendered');
            
            this.bindEvents();
            console.log('✅ Events bound');
            
            console.log('✅ DeviceConfigManager initialized with', this.availableIcons.length, 'icons');
        } catch (error) {
            console.error('❌ Error in DeviceConfigManager.init():', error);
        }
    }
    
    loadDevices() {
        try {
            const saved = localStorage.getItem('deviceConfig');
            if (saved) {
                this.devices = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading device config:', error);
        }
        
        // Ensure devices is always an array
        if (!Array.isArray(this.devices)) {
            this.devices = [
                { id: 1, name: 'Lampu Ruang Tamu', icon: 'fas fa-lightbulb' },
                { id: 2, name: 'Lampu Kamar Tidur', icon: 'fas fa-bed' },
                { id: 3, name: 'Lampu Dapur', icon: 'fas fa-utensils' },
                { id: 4, name: 'Lampu Teras', icon: 'fas fa-home' }
            ];
        }
    }
    
    saveDevices() {
        localStorage.setItem('deviceConfig', JSON.stringify(this.devices));
        // Trigger switch cards regeneration
        if (typeof generateSwitchCards === 'function') {
            generateSwitchCards();
        }
        // Trigger schedule display update
        setTimeout(() => {
            if (window.refreshScheduleDisplay) {
                window.refreshScheduleDisplay();
            }
        }, 200);
    }
    
    renderDeviceConfig() {
        const container = document.getElementById('deviceConfigList');
        if (!container) {
            console.log('⚠️ deviceConfigList container not found, will render later');
            return;
        }
        
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
        
        container.innerHTML = html;
        console.log('✅ Device config rendered for', this.devices.length, 'devices');
    }
    
    bindEvents() {
        // Edit device buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-device-btn')) {
                const deviceId = parseInt(e.target.closest('.edit-device-btn').dataset.deviceId);
                this.showEditModal(deviceId);
            }
        });
        
        // Save device config button (for manual save)
        const saveBtn = document.getElementById('saveDeviceConfigBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveDevices();
                this.showToast('Konfigurasi perangkat disimpan!', 'success');
            });
        }
        
        // Listen for device config changes to update dashboard immediately
        document.addEventListener('deviceConfigChanged', () => {
            if (typeof generateSwitchCards === 'function') {
                generateSwitchCards();
            }
        });
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
        
        console.log('Creating edit modal for device:', device);
        console.log('Available icons:', this.availableIcons.length);
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'deviceEditModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const iconCategoriesHTML = this.renderIconCategories();
        const iconGridHTML = this.renderIconGrid('All');
        
        console.log('Icon categories HTML length:', iconCategoriesHTML.length);
        console.log('Icon grid HTML length:', iconGridHTML.length);
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Edit Perangkat: ${device.name}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
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
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="deviceConfigManager.saveDeviceEdit(${device.id})">Simpan</button>
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
        modal.querySelectorAll('.icon-category').forEach(cat => {
            cat.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                console.log('Category selected:', category);
                
                modal.querySelectorAll('.icon-category').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                
                const iconGrid = modal.querySelector('#iconGrid');
                const newGridHTML = this.renderIconGrid(category);
                iconGrid.innerHTML = newGridHTML;
                
                console.log('Updated grid with', newGridHTML.length, 'characters');
                
                // Restore selection
                setTimeout(() => {
                    const currentIcon = modal.querySelector(`[data-icon="${device.icon}"]`);
                    if (currentIcon) {
                        currentIcon.classList.add('selected');
                    }
                }, 50);
            });
        });
        
        // Bind icon selection events
        this.bindIconSelection(modal);
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
        
        console.log(`Rendering ${icons.length} icons for category: ${category}`);
        
        return icons.map(iconData => `
            <div class="icon-option" data-icon="${iconData.icon}" title="${iconData.name}">
                <i class="${iconData.icon}"></i>
                <span>${iconData.name}</span>
            </div>
        `).join('');
    }
    
    bindIconSelection(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.icon-option')) {
                const iconOption = e.target.closest('.icon-option');
                const icon = iconOption.dataset.icon;
                
                console.log('Icon selected:', icon);
                
                // Remove previous selection
                modal.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                
                // Add selection to clicked icon
                iconOption.classList.add('selected');
                
                // Store selected icon
                modal.selectedIcon = icon;
            }
        });
    }
    
    saveDeviceEdit(deviceId) {
        const modal = document.getElementById('deviceEditModal');
        const newName = modal.querySelector('#deviceName').value.trim();
        const newIcon = modal.selectedIcon;
        
        if (!newName) {
            this.showToast('Nama perangkat tidak boleh kosong!', 'error');
            return;
        }
        
        if (!newIcon) {
            this.showToast('Pilih ikon untuk perangkat!', 'error');
            return;
        }
        
        // Update device
        const device = this.devices.find(d => d.id === deviceId);
        if (device) {
            device.name = newName;
            device.icon = newIcon;
            
            // Save to localStorage immediately
            this.saveDevices();
            this.renderDeviceConfig();
            
            // Trigger custom event for real-time updates
            document.dispatchEvent(new CustomEvent('deviceConfigChanged', {
                detail: { deviceId, name: newName, icon: newIcon }
            }));
            
            this.showToast('Perangkat berhasil diperbarui dan dashboard diupdate!', 'success');
        }
        
        modal.remove();
    }
    
    showToast(message, type = 'info') {
        // Use existing toast function if available
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            alert(message);
        }
    }
    
    getDevices() {
        return this.devices;
    }
}

// Initialize device config manager with error handling
try {
    window.deviceConfigManager = new DeviceConfigManager();
    console.log('✅ DeviceConfigManager initialized immediately');
} catch (error) {
    console.error('❌ Error initializing DeviceConfigManager:', error);
}

// Also initialize on DOM ready as backup
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!window.deviceConfigManager) {
            window.deviceConfigManager = new DeviceConfigManager();
            console.log('✅ DeviceConfigManager initialized on DOM ready');
        }
    } catch (error) {
        console.error('❌ Error initializing DeviceConfigManager on DOM ready:', error);
    }
});