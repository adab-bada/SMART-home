// Muat konfigurasi dari localStorage
function loadConfig() {
    try {
        const savedConfig = localStorage.getItem('mqttConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            document.getElementById('brokerProtocol').value = config.protocol || defaultConfig.protocol;
            document.getElementById('brokerAddress').value = config.broker || defaultConfig.broker;
            document.getElementById('brokerPort').value = config.port || defaultConfig.port;
            document.getElementById('brokerPath').value = config.path || defaultConfig.path;
            document.getElementById('clientId').value = config.clientId || defaultConfig.clientId;
            document.getElementById('username').value = config.username || '';
            document.getElementById('password').value = config.password || '';
            document.getElementById('topicControl').value = config.topicControl || defaultConfig.topicControl;
            document.getElementById('topicStatus').value = config.topicStatus || defaultConfig.topicStatus;
            addDebugLog('Konfigurasi MQTT dimuat dari localStorage');
        } else {
            // Gunakan konfigurasi default
            document.getElementById('brokerProtocol').value = defaultConfig.protocol;
            document.getElementById('brokerAddress').value = defaultConfig.broker;
            document.getElementById('brokerPort').value = defaultConfig.port;
            document.getElementById('brokerPath').value = defaultConfig.path;
            document.getElementById('clientId').value = defaultConfig.clientId;
            document.getElementById('topicControl').value = defaultConfig.topicControl;
            document.getElementById('topicStatus').value = defaultConfig.topicStatus;
            addDebugLog('Menggunakan konfigurasi MQTT default');
        }
        
        // Muat konfigurasi perangkat
        const savedDeviceConfig = localStorage.getItem('deviceConfig');
        if (savedDeviceConfig) {
            const deviceConfig = JSON.parse(savedDeviceConfig);
            defaultConfig.devices = deviceConfig.devices || defaultConfig.devices;
            addDebugLog('Konfigurasi perangkat dimuat dari localStorage');
        }
        
        // Muat konfigurasi sistem
        const savedSystemConfig = localStorage.getItem('systemConfig');
        if (savedSystemConfig) {
            const systemConfig = JSON.parse(savedSystemConfig);
            document.getElementById('restoreState').value = systemConfig.restoreState || defaultConfig.system.restoreState;
            document.getElementById('autoConnect').value = systemConfig.autoConnect || defaultConfig.system.autoConnect;
            document.getElementById('autoReconnect').checked = systemConfig.autoReconnect !== 'no';
            addDebugLog('Konfigurasi sistem dimuat dari localStorage');
        } else {
            document.getElementById('restoreState').value = defaultConfig.system.restoreState;
            document.getElementById('autoConnect').value = defaultConfig.system.autoConnect;
            document.getElementById('autoReconnect').checked = defaultConfig.system.autoReconnect !== 'no';
        }
        
        // Muat status perangkat jika restoreState diaktifkan
        if (getSystemConfig().restoreState === 'yes') {
            const savedDeviceStates = localStorage.getItem('deviceStates');
            if (savedDeviceStates) {
                deviceStates = JSON.parse(savedDeviceStates);
                addDebugLog('Status perangkat dipulihkan dari localStorage');
                
                // Update UI dengan status yang dipulihkan
                setTimeout(() => {
                    for (let i = 0; i < deviceStates.length; i++) {
                        const switchElement = document.getElementById(`switch${i+1}`);
                        const pwmSlider = document.getElementById(`pwmSlider${i+1}`);
                        const pwmValue = document.getElementById(`pwmValue${i+1}`);
                        
                        if (switchElement && pwmSlider && pwmValue) {
                            switchElement.checked = deviceStates[i].state;
                            pwmSlider.value = deviceStates[i].pwm;
                            pwmValue.textContent = `${deviceStates[i].pwm}%`;
                            
                            // Jika PWM bukan 0 atau 100, aktifkan kontrol intensitas
                            if (deviceStates[i].pwm > 0 && deviceStates[i].pwm < 100) {
                                const intensityToggle = document.getElementById(`intensityToggle${i+1}`);
                                const pwmControl = document.getElementById(`pwmControl${i+1}`);
                                if (intensityToggle && pwmControl) {
                                    intensityToggle.checked = true;
                                    pwmControl.classList.remove('hidden');
                                    intensityEnabled[i] = true;
                                }
                            }
                        }
                    }
                }, 100);
            }
        }
        
    } catch (error) {
        addDebugLog('Error loading config: ' + error.message, 'error');
    }
}

// Dapatkan konfigurasi sistem
function getSystemConfig() {
    return {
        restoreState: document.getElementById('restoreState').value,
        autoConnect: document.getElementById('autoConnect').value,
        autoReconnect: document.getElementById('autoReconnect').checked ? 'yes' : 'no'
    };
}

// Render konfigurasi perangkat
function renderDeviceConfig() {
    const deviceConfigList = document.getElementById('deviceConfigList');
    deviceConfigList.innerHTML = '';
    
    defaultConfig.devices.forEach(device => {
        const deviceConfigItem = document.createElement('div');
        deviceConfigItem.className = 'form-group';
        deviceConfigItem.innerHTML = `
            <label for="deviceName${device.id}">Nama Perangkat ${device.id}</label>
            <input type="text" id="deviceName${device.id}" class="form-control" value="${device.name}">
            <label for="deviceIcon${device.id}">Icon Perangkat ${device.id}</label>
            <select id="deviceIcon${device.id}" class="form-control">
                <option value="lightbulb" ${device.icon === 'lightbulb' ? 'selected' : ''}>Lampu</option>
                <option value="fan" ${device.icon === 'fan' ? 'selected' : ''}>Kipas</option>
                <option value="plug" ${device.icon === 'plug' ? 'selected' : ''}>Stopkontak</option>
                <option value="tv" ${device.icon === 'tv' ? 'selected' : ''}>TV</option>
                <option value="thermometer-half" ${device.icon === 'thermometer-half' ? 'selected' : ''}>AC</option>
            </select>
            <label for="deviceRestore${device.id}">Pulihkan Status</label>
            <select id="deviceRestore${device.id}" class="form-control">
                <option value="true" ${device.restoreState === true ? 'selected' : ''}>Ya</option>
                <option value="false" ${device.restoreState === false ? 'selected' : ''}>Tidak</option>
            </select>
        `;
        deviceConfigList.appendChild(deviceConfigItem);
    });
    
    // Update opsi saklar di form jadwal
    const scheduleSwitch = document.getElementById('scheduleSwitch');
    scheduleSwitch.innerHTML = '';
    defaultConfig.devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        option.textContent = device.name;
        scheduleSwitch.appendChild(option);
    });
}

// Inisialisasi event listeners
function initEventListeners() {
    addDebugLog('Memasang event listeners...');
    
    // Theme toggle (legacy support)
    document.getElementById('themeToggle').addEventListener('click', () => {
        const currentTheme = themeManager.currentTheme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        themeManager.selectTheme(newTheme);
    });
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            if (target && target !== 'login') {
                navigateTo(target);
            }
        });
    });
    
    // Config tabs
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Sembunyikan semua konten config
            document.querySelectorAll('.config-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Tampilkan konten yang dipilih
            document.getElementById(target).classList.add('active');
            
            // Update tab aktif
            document.querySelectorAll('.config-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Auto reconnect toggle
    document.getElementById('autoReconnect').addEventListener('change', function() {
        const systemConfig = getSystemConfig();
        localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
        
        if (this.checked) {
            addDebugLog('Reconnect otomatis diaktifkan');
            showToast('Reconnect otomatis diaktifkan', 'success');
        } else {
            addDebugLog('Reconnect otomatis dinonaktifkan');
            showToast('Reconnect otomatis dinonaktifkan', 'info');
            // Hentikan reconnect interval jika ada
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = null;
            }
        }
    });
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'flex';
    });
    
    // Add schedule button
    document.getElementById('addScheduleBtn').addEventListener('click', () => {
        document.getElementById('scheduleModal').style.display = 'flex';
    });
    
    // Close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Login form
    document.getElementById('loginSubmitBtn').addEventListener('click', handleLogin);
    document.getElementById('continueWithoutLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'none';
        isAdmin = false;
        addDebugLog('Melanjutkan tanpa login');
    });
    
    // Configuration
    document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
    document.getElementById('saveDeviceConfigBtn').addEventListener('click', saveDeviceConfig);
    document.getElementById('saveSystemConfigBtn').addEventListener('click', saveSystemConfig);
    document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
    
    // Connection controls
    document.getElementById('connectBtn').addEventListener('click', connectMQTT);
    document.getElementById('disconnectBtn').addEventListener('click', disconnectMQTT);
    
    // Schedule form
    document.getElementById('saveScheduleBtn').addEventListener('click', addSchedule);
    document.getElementById('scheduleIntensity').addEventListener('input', function() {
        document.getElementById('scheduleIntensityValue').textContent = this.value + '%';
    });
    
    // Switch controls (akan diattach setelah render)
    setTimeout(() => {
        attachSwitchListeners();
    }, 100);
    
    // Toggle debug panel
    document.getElementById('toggleDebug').addEventListener('click', toggleDebugPanel);
    
    addDebugLog('Semua event listeners berhasil dipasang');
}

// Attach switch event listeners
function attachSwitchListeners() {
    for (let i = 1; i <= 4; i++) {
        const switchElement = document.getElementById(`switch${i}`);
        const pwmSlider = document.getElementById(`pwmSlider${i}`);
        const pwmValue = document.getElementById(`pwmValue${i}`);
        const intensityToggle = document.getElementById(`intensityToggle${i}`);
        const pwmControl = document.getElementById(`pwmControl${i}`);
        
        if (switchElement && pwmSlider && pwmValue && intensityToggle && pwmControl) {
            // Toggle kontrol intensitas
            intensityToggle.addEventListener('change', () => {
                intensityEnabled[i-1] = intensityToggle.checked;
                
                if (intensityToggle.checked) {
                    pwmControl.classList.remove('hidden');
                    addDebugLog(`Kontrol intensitas untuk saklar ${i} diaktifkan`);
                } else {
                    pwmControl.classList.add('hidden');
                    // Jika intensitas dinonaktifkan, set nilai PWM ke 100% jika saklar ON
                    if (switchElement.checked) {
                        pwmSlider.value = 100;
                        pwmValue.textContent = '100%';
                        controlLight(i, 'ON', 100);
                    }
                    addDebugLog(`Kontrol intensitas untuk saklar ${i} dinonaktifkan`);
                }
                
                // Simpan status perangkat
                saveDeviceStates();
            });
            
            // Remove complex event listener - using onclick instead
            
            switchElement.addEventListener('change', () => {
                const state = switchElement.checked ? 'ON' : 'OFF';
                addDebugLog(`Switch ${i} diubah menjadi: ${state}`);
                
                let pwmVal = parseInt(pwmSlider.value);
                if (!intensityEnabled[i-1]) {
                    pwmVal = switchElement.checked ? 100 : 0;
                }
                
                controlLight(i, state, pwmVal);
                saveDeviceStates();
            });
            
            pwmSlider.addEventListener('input', () => {
                pwmValue.textContent = `${pwmSlider.value}%`;
                addDebugLog(`PWM ${i} diubah menjadi: ${pwmSlider.value}%`);
                if (document.getElementById(`switch${i}`).checked && intensityEnabled[i-1]) {
                    controlLight(i, 'ON', parseInt(pwmSlider.value));
                    
                    // Simpan status perangkat
                    saveDeviceStates();
                }
            });
        }
    }
}

// Simpan status perangkat ke localStorage
function saveDeviceStates() {
    if (getSystemConfig().restoreState === 'yes') {
        for (let i = 1; i <= 4; i++) {
            const switchElement = document.getElementById(`switch${i}`);
            const pwmSlider = document.getElementById(`pwmSlider${i}`);
            
            if (switchElement && pwmSlider) {
                deviceStates[i-1] = {
                    state: switchElement.checked,
                    pwm: parseInt(pwmSlider.value)
                };
            }
        }
        
        localStorage.setItem('deviceStates', JSON.stringify(deviceStates));
        addDebugLog('Status perangkat disimpan');
    }
}

// Toggle tampilan debug panel
function toggleDebugPanel() {
    const debugPanel = document.getElementById('debugPanel');
    const toggleButton = document.getElementById('toggleDebug');
    const isHidden = debugPanel.classList.contains('hidden');
    
    if (isHidden) {
        debugPanel.classList.remove('hidden');
        toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i> Sembunyikan';
    } else {
        debugPanel.classList.add('hidden');
        toggleButton.innerHTML = '<i class="fas fa-eye"></i> Tampilkan';
    }
}

// Navigasi
function navigateTo(sectionId) {
    // Sembunyikan semua section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Tampilkan section yang dipilih
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigasi aktif
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[data-target="${sectionId}"]`).classList.add('active');
    
    // Scroll ke section yang dipilih
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
    
    // Jika bukan admin, batasi akses ke konfigurasi
    if (sectionId === 'configuration' && !isAdmin) {
        showAlert('Hanya admin yang dapat mengakses menu konfigurasi', 'error');
        navigateTo('dashboard');
    }
    
    addDebugLog('Navigasi ke: ' + sectionId);
}

// Handle login
function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username === 'admin' && password === 'admin123') {
        isAdmin = true;
        document.getElementById('loginModal').style.display = 'none';
        showAlert('Login berhasil sebagai admin', 'success');
        showToast('Login berhasil sebagai admin', 'success');
        addDebugLog('Login berhasil sebagai admin');
    } else {
        showAlert('Username atau password salah', 'error');
        showToast('Username atau password salah', 'error');
        addDebugLog('Login gagal: username atau password salah', 'error');
    }
}

// Simpan konfigurasi MQTT
function saveConfig() {
    const protocol = document.getElementById('brokerProtocol').value;
    const broker = document.getElementById('brokerAddress').value;
    const port = document.getElementById('brokerPort').value;
    const path = document.getElementById('brokerPath').value;
    const clientId = document.getElementById('clientId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const topicControl = document.getElementById('topicControl').value;
    const topicStatus = document.getElementById('topicStatus').value;

    const config = {
        protocol,
        broker,
        port,
        path,
        clientId,
        username,
        password,
        topicControl,
        topicStatus
    };

    localStorage.setItem('mqttConfig', JSON.stringify(config));
    showAlert('Konfigurasi MQTT berhasil disimpan', 'success');
    showToast('Konfigurasi MQTT berhasil disimpan', 'success');
    addDebugLog('Konfigurasi MQTT disimpan');
    
    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Simpan konfigurasi perangkat
function saveDeviceConfig() {
    for (let i = 1; i <= 4; i++) {
        const name = document.getElementById(`deviceName${i}`).value;
        const icon = document.getElementById(`deviceIcon${i}`).value;
        const restoreState = document.getElementById(`deviceRestore${i}`).value === 'true';
        
        defaultConfig.devices[i-1] = {
            id: i,
            name,
            icon,
            restoreState
        };
    }
    
    localStorage.setItem('deviceConfig', JSON.stringify({ devices: defaultConfig.devices }));
    showAlert('Konfigurasi perangkat berhasil disimpan', 'success');
    showToast('Konfigurasi perangkat berhasil disimpan', 'success');
    addDebugLog('Konfigurasi perangkat disimpan');
    
    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Perbarui tampilan
    renderDevices();
    renderDeviceConfig();
    
    // Pasang ulang event listeners
    setTimeout(() => {
        attachSwitchListeners();
    }, 100);
}

// Simpan konfigurasi sistem
function saveSystemConfig() {
    const systemConfig = getSystemConfig();
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
    showAlert('Konfigurasi sistem berhasil disimpan', 'success');
    showToast('Konfigurasi sistem berhasil disimpan', 'success');
    addDebugLog('Konfigurasi sistem disimpan');
    
    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Test koneksi
function testConnection() {
    showAlert('Menguji koneksi...', 'info');
    showToast('Menguji koneksi...', 'info');
    addDebugLog('Menguji koneksi broker');
    
    // Simpan status koneksi sebelumnya
    const wasConnected = isConnected;
    if (wasConnected) {
        disconnectMQTT();
    }
    
    // Coba hubungkan
    connectMQTT();
    
    // Setelah 3 detik, putuskan koneksi tes
    setTimeout(() => {
        if (isConnected) {
            showAlert('Koneksi berhasil!', 'success');
            showToast('Koneksi berhasil!', 'success');
            addDebugLog('Test koneksi berhasil', 'success');
            if (!wasConnected) {
                disconnectMQTT();
            }
        } else {
            showAlert('Koneksi gagal. Periksa konfigurasi.', 'error');
            showToast('Koneksi gagal. Periksa konfigurasi.', 'error');
            addDebugLog('Test koneksi gagal', 'error');
        }
    }, 3000);
}

// Hubungkan ke broker MQTT (Simple version like working one)
function connectMQTT() {
    isExplicitDisconnect = false;
    
    const brokerUrl = 'wss://test.mosquitto.org:8081/mqtt';
    const clientId = 'web-client-' + Math.random().toString(16).substr(2, 8);
    
    addDebugLog(`Mencoba terhubung ke broker: ${brokerUrl}`);
    updateConnectionStatus('connecting');
    showAlert('Menghubungkan ke broker...', 'info');
    showToast('Menghubungkan ke broker...', 'info');
    
    // Hentikan client sebelumnya jika ada
    if (client) {
        client.end();
        client = null;
    }
    
    client = mqtt.connect(brokerUrl, {
        clientId: clientId,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        keepalive: 30
    });
    
    client.on('connect', function() {
        isConnected = true;
        addDebugLog('Terhubung ke broker MQTT', 'success');
        updateConnectionStatus('connected');
        showAlert('Terhubung ke broker MQTT', 'success');
        showToast('Terhubung ke broker MQTT', 'success');
        
        client.subscribe('home/light/status', function(err) {
            if (!err) {
                addDebugLog('Subscribe ke topik: home/light/status', 'success');
            }
        });
    });
    
    client.on('message', function(topic, message) {
        addDebugLog(`Pesan diterima pada ${topic}: ${message.toString()}`, 'info');
        processMessage(topic, message.toString());
    });
    
    client.on('error', function(err) {
        addDebugLog(`Error: ${err.message}`, 'error');
        updateConnectionStatus('disconnected');
        isConnected = false;
    });
    
    client.on('close', function() {
        addDebugLog('Koneksi ditutup', 'info');
        updateConnectionStatus('disconnected');
        isConnected = false;
    });
}

// Minta status update dari perangkat (Simplified)
function requestStatusUpdate() {
    // Simplified - no status request needed for basic functionality
    addDebugLog('Status update tidak diperlukan untuk versi sederhana', 'info');
}

// Putuskan koneksi MQTT
function disconnectMQTT() {
    isExplicitDisconnect = true;
    
    if (client) {
        client.end();
        addDebugLog('Koneksi diputuskan');
        showAlert('Koneksi diputuskan', 'info');
        showToast('Koneksi diputuskan', 'info');
    }
    isConnected = false;
    updateConnectionStatus('disconnected');
}

// Update status koneksi UI
function updateConnectionStatus(status) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    statusIndicator.classList.remove('connected', 'disconnected', 'connecting', 'error');
    
    switch (status) {
        case 'connected':
            statusIndicator.classList.add('connected');
            statusText.textContent = 'Terhubung';
            break;
        case 'connecting':
            statusIndicator.classList.add('connecting');
            statusText.textContent = 'Menghubungkan...';
            break;
        case 'error':
            statusIndicator.classList.add('disconnected');
            statusText.textContent = 'Error';
            break;
        default:
            statusIndicator.classList.add('disconnected');
            statusText.textContent = 'Terputus';
            break;
    }
}

// Proses pesan MQTT (Simple version)
function processMessage(topic, message) {
    addDebugLog(`Memproses pesan dari ${topic}: ${message}`, 'info');
    
    try {
        if (topic === 'home/light/status') {
            const data = JSON.parse(message);
            
            if (data.switches && Array.isArray(data.switches)) {
                data.switches.forEach(switchData => {
                    if (switchData.device && switchData.device.startsWith('switch')) {
                        const switchNum = switchData.device.replace('switch', '');
                        const switchElement = document.getElementById(`switch${switchNum}`);
                        
                        if (switchElement && switchData.hasOwnProperty('state')) {
                            switchElement.checked = switchData.state === 'ON';
                            addDebugLog(`Device ${switchData.device} diperbarui: ${switchData.state}`, 'success');
                        }
                    }
                });
            }
        }
    } catch (e) {
        addDebugLog('Error parsing message: ' + e.message, 'error');
    }
}

// Kontrol lampu (Simple version)
function controlLight(switchNum, state, pwmValue = 0) {
    if (!client || !isConnected) {
        showAlert('Tidak terhubung ke broker', 'error');
        showToast('Tidak terhubung ke broker', 'error');
        addDebugLog('Tidak terhubung ke broker', 'error');
        return;
    }
    
    const message = JSON.stringify({
        device: `switch${switchNum}`,
        state: state,
        pwm: pwmValue,
        timestamp: new Date().toISOString()
    });
    
    client.publish('home/light/control', message, function(err) {
        if (err) {
            addDebugLog('Gagal mengirim perintah: ' + err.message, 'error');
        } else {
            addDebugLog(`Perintah dikirim: Device switch${switchNum} - ${state} - PWM ${pwmValue}`, 'success');
        }
    });
}

// Tampilkan alert
function showAlert(message, type) {
    const alert = document.getElementById('connectionAlert');
    alert.textContent = message;
    alert.className = 'alert';
    alert.classList.add(`alert-${type}`);
    alert.style.display = 'flex';
    
    // Sembunyikan alert setelah 5 detik
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}