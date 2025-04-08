// Settings Panel Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Settings Panel Elements
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsPanelClose = document.getElementById('settings-panel-close');
    
    // Save Settings Elements
    const saveSettingsCheckbox = document.getElementById('save-settings');
    const clearSettingsBtn = document.getElementById('clear-settings');
    
    // Settings Form Elements
    const removeFillers = document.getElementById('remove-fillers');
    const addTimestamps = document.getElementById('add-timestamps');
    const timestampInterval = document.getElementById('timestamp-interval');
    const groupByTopic = document.getElementById('group-by-topic');
    const addTitles = document.getElementById('add-titles');
    const speakerFormat = document.getElementById('speaker-format');
    const modelSelect = document.getElementById('model-select');
    // const demoMode = document.getElementById('demo-mode'); // Removed demo mode
    const apiKey = document.getElementById('api-key');
    const temperature = document.getElementById('temperature');
    
    // Toggle Settings Panel
    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
    });
    
    // Close Settings Panel
    settingsPanelClose.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
    });
    
    // Close Settings Panel when clicking outside
    document.addEventListener('click', (event) => {
        if (!settingsPanel.contains(event.target) && 
            event.target !== settingsToggle && 
            !settingsToggle.contains(event.target)) {
            settingsPanel.classList.remove('open');
        }
    });
    
    // Toggle API Key visibility based on demo mode (Removed)
    /*
    demoMode.addEventListener('change', function() {
        const apiKeyContainer = apiKey.parentElement;
        apiKeyContainer.style.display = this.checked ? 'none' : 'flex';
        
        if (this.checked) {
            // Clear API key if demo mode is enabled
            apiKey.value = '';
            if (saveSettingsCheckbox.checked) {
                localStorage.removeItem('conversation-formatter-api-key');
            }
        }
    });
    */
    
    // Initialize API key visibility (Always visible now)
    apiKey.parentElement.style.display = 'flex';
    
    // Load saved settings
    loadSettings();
    
    // Save settings when changed
    const settingsInputs = [
        removeFillers, addTimestamps, timestampInterval, 
        groupByTopic, addTitles, speakerFormat, 
        modelSelect, /* demoMode, */ apiKey, temperature // Removed demoMode
    ];
    
    settingsInputs.forEach(input => {
        input.addEventListener('change', saveSettings);
    });
    
    // Clear saved settings
    clearSettingsBtn.addEventListener('click', () => {
        localStorage.removeItem('conversation-formatter-settings');
        localStorage.removeItem('conversation-formatter-api-key');
        
        // Reset to defaults
        removeFillers.checked = true;
        addTimestamps.checked = true;
        timestampInterval.value = 10;
        groupByTopic.checked = true;
        addTitles.checked = true;
        speakerFormat.value = '{speaker}: {text}';
        modelSelect.value = 'gemini-2.5-pro-exp-03-25'; // Default to experimental
        // demoMode.checked = true; // Removed demo mode
        apiKey.value = '';
        temperature.value = 0; // Default temperature to 0
        document.getElementById('temperature-value').textContent = 0; // Default temperature to 0
        
        // Update API key visibility (Always visible now)
        apiKey.parentElement.style.display = 'flex';
        
        // Show notification
        showNotification('保存した設定をクリアしました');
    });
    
    // Save settings function
    function saveSettings() {
        if (!saveSettingsCheckbox.checked) return;
        
        const settings = {
            removeFillers: removeFillers.checked,
            addTimestamps: addTimestamps.checked,
            timestampInterval: timestampInterval.value,
            groupByTopic: groupByTopic.checked,
            addTitles: addTitles.checked,
            speakerFormat: speakerFormat.value,
            modelSelect: modelSelect.value,
            // demoMode: demoMode.checked, // Removed demo mode
            temperature: temperature.value
        };
        
        localStorage.setItem('conversation-formatter-settings', JSON.stringify(settings));
        
        // Save API key separately (Always save if provided)
        if (apiKey.value) {
            localStorage.setItem('conversation-formatter-api-key', apiKey.value);
        } else {
            // Remove API key from storage if it's cleared
            localStorage.removeItem('conversation-formatter-api-key');
        }
        
        // Show notification
        showNotification('設定を保存しました');
    }
    
    // Load settings function
    function loadSettings() {
        const savedSettings = localStorage.getItem('conversation-formatter-settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            removeFillers.checked = settings.removeFillers;
            addTimestamps.checked = settings.addTimestamps;
            timestampInterval.value = settings.timestampInterval;
            groupByTopic.checked = settings.groupByTopic;
            addTitles.checked = settings.addTitles;
            speakerFormat.value = settings.speakerFormat;
            modelSelect.value = settings.modelSelect;
            // demoMode.checked = settings.demoMode; // Removed demo mode
            temperature.value = settings.temperature;
            document.getElementById('temperature-value').textContent = settings.temperature;
        }
        
        // Load API key separately
        const savedApiKey = localStorage.getItem('conversation-formatter-api-key');
        if (savedApiKey) {
            apiKey.value = savedApiKey;
            // If API key exists, disable demo mode (Removed)
            // demoMode.checked = false;
            apiKey.parentElement.style.display = 'flex'; // Ensure API key field is visible if key exists
        }
    }
    
    // Notification function (reused from main.js)
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});
