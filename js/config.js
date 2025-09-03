// Configuration Management
class ConfigManager {
    constructor() {
        this.defaultConfig = {
            mqtt: {
                protocol: 'wss',
                broker: 'test.mosquitto.org',
                port: 8081,
                path: '/mqtt',
                clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
                username: '',
                password: '',
                topicControl: 'home/light/control',
                topicStatus: 'home/light/status'
            },
            devices: [
                { id: 1, name: 'Lampu Ruang Tamu', icon: 'fas fa-lightbulb' },
                { id: 2, name: 'Lampu Kamar Tidur', icon: 'fas fa-bed' },
                { id: 3, name: 'Lampu Dapur', icon: 'fas fa-utensils' },
                { id: 4, name: 'Lampu Teras', icon: 'fas fa-home' }
            ],
            system: {
                restoreState: 'yes',
                autoConnect: 'no',
                autoReconnect: 'yes'
            },
            login: {
                username: 'admin',
                password: 'admin'
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadAllConfigs();
    }
    
    loadAllConfigs() {
        this.loadMQTTConfig();
        this.loadDeviceConfig();
        this.loadSystemConfig();
        this.loadLoginConfig();
    }
    
    loadMQTTConfig() {
        try {
            const saved = localStorage.getItem('mqttConfig');
            const config = saved ? JSON.parse(saved) : this.defaultConfig.mqtt;
            
            // Update form fields
            document.getElementById('brokerProtocol').value = config.protocol;
            document.getElementById('brokerAddress').value = config.broker;
            document.getElementById('brokerPort').value = config.port;
            document.getElementById('brokerPath').value = config.path;
            document.getElementById('clientId').value = config.clientId;
            document.getElementById('username').value = config.username || '';
            document.getElementById('password').value = config.password || '';
            document.getElementById('topicControl').value = config.topicControl;
            document.getElementById('topicStatus').value = config.topicStatus;
            
            addDebugLog('MQTT configuration loaded');
        } catch (error) {
            addDebugLog('Error loading MQTT config: ' + error.message, 'error');
        }
    }
    
    loadDeviceConfig() {
        try {
            const saved = localStorage.getItem('deviceConfig');
            const devices = saved ? JSON.parse(saved) : this.defaultConfig.devices;
            
            // Store in global variable for other modules
            window.deviceConfig = devices;
            
            addDebugLog('Device configuration loaded');
        } catch (error) {
            addDebugLog('Error loading device config: ' + error.message, 'error');
            window.deviceConfig = this.defaultConfig.devices;
        }
    }
    
    loadSystemConfig() {
        try {
            const saved = localStorage.getItem('systemConfig');
            const config = saved ? JSON.parse(saved) : this.defaultConfig.system;
            
            document.getElementById('restoreState').value = config.restoreState;
            document.getElementById('autoConnect').value = config.autoConnect;
            document.getElementById('autoReconnect').checked = config.autoReconnect === 'yes';
            
            addDebugLog('System configuration loaded');
        } catch (error) {
            addDebugLog('Error loading system config: ' + error.message, 'error');
        }
    }
    
    loadLoginConfig() {
        try {
            const saved = localStorage.getItem('loginConfig');
            const config = saved ? JSON.parse(saved) : this.defaultConfig.login;
            
            document.getElementById('adminUsername').value = config.username;
            document.getElementById('adminPassword').value = config.password;
            
            addDebugLog('Login configuration loaded');
        } catch (error) {
            addDebugLog('Error loading login config: ' + error.message, 'error');
        }
    }
    
    saveMQTTConfig() {
        const config = {
            protocol: document.getElementById('brokerProtocol').value,
            broker: document.getElementById('brokerAddress').value,
            port: document.getElementById('brokerPort').value,
            path: document.getElementById('brokerPath').value,
            clientId: document.getElementById('clientId').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            topicControl: document.getElementById('topicControl').value,
            topicStatus: document.getElementById('topicStatus').value
        };
        
        localStorage.setItem('mqttConfig', JSON.stringify(config));
        addDebugLog('MQTT configuration saved');
        return config;
    }
    
    saveDeviceConfig() {
        if (window.deviceConfig) {
            localStorage.setItem('deviceConfig', JSON.stringify(window.deviceConfig));
            addDebugLog('Device configuration saved');
        }
    }
    
    saveSystemConfig() {
        const config = {
            restoreState: document.getElementById('restoreState').value,
            autoConnect: document.getElementById('autoConnect').value,
            autoReconnect: document.getElementById('autoReconnect').checked ? 'yes' : 'no'
        };
        
        localStorage.setItem('systemConfig', JSON.stringify(config));
        addDebugLog('System configuration saved');
        return config;
    }
    
    saveLoginConfig() {
        const config = {
            username: document.getElementById('adminUsername').value,
            password: document.getElementById('adminPassword').value
        };
        
        localStorage.setItem('loginConfig', JSON.stringify(config));
        addDebugLog('Login configuration saved');
        return config;
    }
    
    getMQTTConfig() {
        const saved = localStorage.getItem('mqttConfig');
        return saved ? JSON.parse(saved) : this.defaultConfig.mqtt;
    }
    
    getSystemConfig() {
        const saved = localStorage.getItem('systemConfig');
        return saved ? JSON.parse(saved) : this.defaultConfig.system;
    }
    
    getLoginConfig() {
        const saved = localStorage.getItem('loginConfig');
        return saved ? JSON.parse(saved) : this.defaultConfig.login;
    }
}

// Initialize config manager
window.configManager = new ConfigManager();