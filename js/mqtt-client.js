// MQTT Client Management
class MQTTClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.isExplicitDisconnect = false;
        this.reconnectInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        
        // Auto-connect if enabled
        const systemConfig = window.configManager.getSystemConfig();
        if (systemConfig.autoConnect === 'yes') {
            setTimeout(() => {
                this.connect();
            }, 2000);
        }
    }
    
    bindEvents() {
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const testConnectionBtn = document.getElementById('testConnectionBtn');
        const saveConfigBtn = document.getElementById('saveConfigBtn');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connect());
        }
        
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnect());
        }
        
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.testConnection());
        }
        
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                window.configManager.saveMQTTConfig();
                showToast('MQTT configuration saved!', 'success');
            });
        }
    }
    
    connect() {
        this.isExplicitDisconnect = false;
        
        const config = window.configManager.getMQTTConfig();
        const brokerUrl = `${config.protocol}://${config.broker}:${config.port}${config.path}`;
        
        addDebugLog(`Connecting to broker: ${brokerUrl}`);
        this.updateConnectionStatus('connecting');
        showToast('Connecting to broker...', 'info');
        
        // Cleanup existing client
        if (this.client) {
            this.client.end();
            this.client = null;
        }
        
        // Create new client
        const clientOptions = {
            clientId: config.clientId,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 10000,
            keepalive: 30
        };
        
        // Add credentials if provided
        if (config.username) {
            clientOptions.username = config.username;
            clientOptions.password = config.password;
        }
        
        this.client = mqtt.connect(brokerUrl, clientOptions);
        
        this.client.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            addDebugLog('Connected to MQTT broker', 'success');
            this.updateConnectionStatus('connected');
            showToast('Connected to MQTT broker', 'success');
            
            // Subscribe to status topic
            this.client.subscribe(config.topicStatus, (err) => {
                if (!err) {
                    addDebugLog(`Subscribed to: ${config.topicStatus}`, 'success');
                } else {
                    addDebugLog(`Subscription error: ${err.message}`, 'error');
                }
            });
            
            // Request status update
            this.requestStatusUpdate();
        });
        
        this.client.on('message', (topic, message) => {
            this.processMessage(topic, message.toString());
        });
        
        this.client.on('error', (err) => {
            addDebugLog(`MQTT Error: ${err.message}`, 'error');
            this.updateConnectionStatus('error');
            this.isConnected = false;
            
            // Auto-reconnect if enabled
            this.handleReconnect();
        });
        
        this.client.on('close', () => {
            addDebugLog('Connection closed', 'info');
            this.updateConnectionStatus('disconnected');
            this.isConnected = false;
            
            // Auto-reconnect if enabled and not explicitly disconnected
            if (!this.isExplicitDisconnect) {
                this.handleReconnect();
            }
        });
        
        this.client.on('offline', () => {
            addDebugLog('Client went offline', 'info');
            this.updateConnectionStatus('disconnected');
            this.isConnected = false;
        });
        
        this.client.on('reconnect', () => {
            addDebugLog('Attempting to reconnect...', 'info');
            this.updateConnectionStatus('connecting');
        });
    }
    
    disconnect() {
        this.isExplicitDisconnect = true;
        
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
        
        if (this.client) {
            this.client.end();
            addDebugLog('Connection disconnected');
            showToast('Connection disconnected', 'info');
        }
        
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
    }
    
    handleReconnect() {
        const systemConfig = window.configManager.getSystemConfig();
        if (systemConfig.autoReconnect !== 'yes' || this.isExplicitDisconnect) {
            return;
        }
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            addDebugLog('Max reconnection attempts reached', 'error');
            showToast('Max reconnection attempts reached', 'error');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
        
        addDebugLog(`Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'info');
        
        setTimeout(() => {
            if (!this.isConnected && !this.isExplicitDisconnect) {
                this.connect();
            }
        }, delay);
    }
    
    testConnection() {
        showToast('Testing connection...', 'info');
        addDebugLog('Testing connection');
        
        const wasConnected = this.isConnected;
        if (wasConnected) {
            this.disconnect();
        }
        
        // Test connection
        setTimeout(() => {
            this.connect();
            
            // Check result after 3 seconds
            setTimeout(() => {
                if (this.isConnected) {
                    showToast('Connection test successful!', 'success');
                    if (!wasConnected) {
                        this.disconnect();
                    }
                } else {
                    showToast('Connection test failed. Check configuration.', 'error');
                }
            }, 3000);
        }, 500);
    }
    
    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (!statusIndicator || !statusText) return;
        
        statusIndicator.classList.remove('connected', 'disconnected', 'connecting', 'error');
        
        switch (status) {
            case 'connected':
                statusIndicator.classList.add('connected');
                statusText.textContent = 'Connected';
                break;
            case 'connecting':
                statusIndicator.classList.add('connecting');
                statusText.textContent = 'Connecting...';
                break;
            case 'error':
                statusIndicator.classList.add('disconnected');
                statusText.textContent = 'Error';
                break;
            default:
                statusIndicator.classList.add('disconnected');
                statusText.textContent = 'Disconnected';
                break;
        }
    }
    
    processMessage(topic, message) {
        addDebugLog(`Message received on ${topic}: ${message}`, 'info');
        
        try {
            const config = window.configManager.getMQTTConfig();
            
            if (topic === config.topicStatus) {
                const data = JSON.parse(message);
                
                if (data.switches && Array.isArray(data.switches)) {
                    data.switches.forEach(switchData => {
                        this.updateSwitchFromMessage(switchData);
                    });
                } else if (data.device) {
                    this.updateSwitchFromMessage(data);
                }
            }
        } catch (error) {
            addDebugLog('Error parsing message: ' + error.message, 'error');
        }
    }
    
    updateSwitchFromMessage(switchData) {
        if (!switchData.device || !switchData.device.startsWith('switch')) return;
        
        const switchNum = switchData.device.replace('switch', '');
        const switchElement = document.getElementById(`switch${switchNum}`);
        const pwmSlider = document.getElementById(`pwmSlider${switchNum}`);
        const pwmValue = document.getElementById(`pwmValue${switchNum}`);
        
        if (switchElement && switchData.hasOwnProperty('state')) {
            switchElement.checked = switchData.state === 'ON';
            addDebugLog(`Device ${switchData.device} updated: ${switchData.state}`, 'success');
        }
        
        if (pwmSlider && pwmValue && switchData.hasOwnProperty('pwm')) {
            pwmSlider.value = switchData.pwm;
            pwmValue.textContent = `${switchData.pwm}%`;
        }
        
        saveDeviceStates();
    }
    
    controlDevice(switchNum, state, pwmValue = 100) {
        if (!this.client || !this.isConnected) {
            showToast('Not connected to broker', 'error');
            addDebugLog('Cannot control device: not connected', 'error');
            return;
        }
        
        const config = window.configManager.getMQTTConfig();
        const message = JSON.stringify({
            device: `switch${switchNum}`,
            state: state,
            pwm: pwmValue,
            timestamp: new Date().toISOString()
        });
        
        this.client.publish(config.topicControl, message, (err) => {
            if (err) {
                addDebugLog('Failed to send command: ' + err.message, 'error');
                showToast('Failed to send command', 'error');
            } else {
                addDebugLog(`Command sent: switch${switchNum} - ${state} - PWM ${pwmValue}`, 'success');
            }
        });
    }
    
    requestStatusUpdate() {
        if (!this.client || !this.isConnected) return;
        
        const config = window.configManager.getMQTTConfig();
        const message = JSON.stringify({
            action: 'status_request',
            timestamp: new Date().toISOString()
        });
        
        this.client.publish(config.topicControl, message, (err) => {
            if (!err) {
                addDebugLog('Status update requested', 'info');
            }
        });
    }
}

// Initialize MQTT client
window.mqttClient = new MQTTClient();