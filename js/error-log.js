// Error Logging System
document.addEventListener('DOMContentLoaded', function() {
    // Error Log Elements
    const errorLogToggle = document.getElementById('error-log-toggle');
    const errorLog = document.getElementById('error-log');
    const errorLogClose = document.getElementById('error-log-close');
    const errorLogContent = document.getElementById('error-log-content');
    
    // Initialize error log
    const errorMessages = [];
    
    // Toggle Error Log
    errorLogToggle.addEventListener('click', () => {
        errorLog.classList.toggle('open');
    });
    
    // Close Error Log
    errorLogClose.addEventListener('click', () => {
        errorLog.classList.remove('open');
    });
    
    // Close Error Log when clicking outside
    document.addEventListener('click', (event) => {
        if (!errorLog.contains(event.target) && 
            event.target !== errorLogToggle && 
            !errorLogToggle.contains(event.target)) {
            errorLog.classList.remove('open');
        }
    });
    
    // Global error handler
    window.addEventListener('error', function(event) {
        logError('JavaScript Error', event.message, event.filename, event.lineno);
        return false;
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        logError('Promise Error', event.reason);
        return false;
    });
    
    // Override console.error
    const originalConsoleError = console.error;
    console.error = function() {
        // Call original console.error
        originalConsoleError.apply(console, arguments);
        
        // Log to our error system
        const errorMessage = Array.from(arguments).join(' ');
        logError('Console Error', errorMessage);
    };
    
    // Log error function
    window.logError = function(type, message, file = '', line = '') {
        const timestamp = new Date().toLocaleTimeString();
        const errorObj = {
            type,
            message,
            file,
            line,
            timestamp
        };
        
        errorMessages.push(errorObj);
        updateErrorLog();
        
        // Show error indicator
        errorLogToggle.classList.add('has-errors');
        
        // Show notification
        showNotification('エラーが発生しました。詳細はエラーログを確認してください。', 'error');
        
        return errorObj;
    };
    
    // Clear error log
    window.clearErrorLog = function() {
        errorMessages.length = 0;
        updateErrorLog();
        errorLogToggle.classList.remove('has-errors');
    };
    
    // Update error log display
    function updateErrorLog() {
        errorLogContent.innerHTML = '';
        
        if (errorMessages.length === 0) {
            errorLogContent.innerHTML = '<p>エラーはありません</p>';
            return;
        }
        
        // Create error log entries
        errorMessages.forEach((error, index) => {
            const errorEntry = document.createElement('div');
            errorEntry.className = 'error-entry';
            
            const errorHeader = document.createElement('div');
            errorHeader.className = 'error-header';
            errorHeader.innerHTML = `
                <span class="error-type">${error.type}</span>
                <span class="error-timestamp">${error.timestamp}</span>
            `;
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = error.message;
            
            const errorDetails = document.createElement('div');
            errorDetails.className = 'error-details';
            if (error.file && error.line) {
                errorDetails.textContent = `${error.file}:${error.line}`;
            }
            
            errorEntry.appendChild(errorHeader);
            errorEntry.appendChild(errorMessage);
            if (error.file || error.line) {
                errorEntry.appendChild(errorDetails);
            }
            
            errorLogContent.appendChild(errorEntry);
            
            // Add separator except for last item
            if (index < errorMessages.length - 1) {
                const separator = document.createElement('hr');
                errorLogContent.appendChild(separator);
            }
        });
        
        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'btn secondary';
        clearButton.innerHTML = '<i class="fas fa-trash"></i> ログをクリア';
        clearButton.addEventListener('click', clearErrorLog);
        
        errorLogContent.appendChild(document.createElement('hr'));
        errorLogContent.appendChild(clearButton);
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
    
    // Initialize error log
    updateErrorLog();
});
