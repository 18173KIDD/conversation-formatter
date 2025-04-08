// Main JavaScript for Conversation Formatter
document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current button and content
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Input Type Selection
    const inputTypeRadios = document.querySelectorAll('input[name="input-type"]');
    const textInputContainer = document.getElementById('text-input-container');
    const fileInputContainer = document.getElementById('file-input-container');
    // const audioInputContainer = document.getElementById('audio-input-container'); // Removed audio input
    
    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const inputType = radio.value;
            
            // Hide all input containers
            textInputContainer.style.display = 'none';
            fileInputContainer.style.display = 'none';
            // audioInputContainer.style.display = 'none'; // Removed audio input
            
            // Show selected input container
            if (inputType === 'text') {
                textInputContainer.style.display = 'block';
            } else if (inputType === 'file') {
                fileInputContainer.style.display = 'block';
            }
            // Removed audio input branch
        });
    });
    
    // File Upload (Functionality removed, now provides info only)

    // Clear Input Button
    const clearInputBtn = document.getElementById('clear-input-btn');
    const conversationInput = document.getElementById('conversation-input');
    clearInputBtn.addEventListener('click', () => {
        conversationInput.value = '';
        showNotification('入力内容をクリアしました', 'info');
    });
    
    // Temperature Range
    const temperatureRange = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    
    temperatureRange.addEventListener('input', () => {
        temperatureValue.textContent = temperatureRange.value;
    });
    
    // Prompt Templates
    const templateBtns = document.querySelectorAll('.template-btn');
    const promptText = document.getElementById('prompt-text');
    
    const templates = {
        standard: `# 形式: 標準フォーマット
# 出力形式: Markdown

会話内容を標準形式でまとめてください。以下の形式で出力してください：

## [トピックタイトル]
### 00:00頃～
- A: 発言内容
- B: 発言内容

## [次のトピック]
### 00:10頃～
- A: 発言内容
- B: 発言内容`,

        minutes: `# 形式: 議事録作成
# 出力形式: Markdown

会話内容を議事録形式でまとめてください。以下の形式で出力してください：

## 会議概要
- 日時
- 参加者
- 目的

## 議題と討議内容
### [議題1]
#### 討議内容
- 要点をまとめて箇条書き

#### 決定事項
- 決定された内容を箇条書き

#### アクションアイテム
- [ ] タスク @担当者 期限:xx/xx`,

        summary: `# 形式: 会話要約
# 出力形式: Markdown

会話内容を要約形式でまとめてください。以下の形式で出力してください：

## 全体サマリー
- 400字程度で全体の要点をまとめる

## 話題ごとの要点
### [話題1]
- 主要なポイントを箇条書き

## 重要な発言・決定事項
- 特に重要な発言や決定事項を抽出

## キーワード
- キーワード: 説明`,

        importance: `# 形式: 重要点抽出
# 出力形式: Markdown

会話の重要ポイントを分析してください。以下の形式で出力してください：

## Executive Summary
3行で超簡潔に要約

## 重要度別ポイント
### High Priority（緊急度: Urgent）
- 重要かつ緊急な項目

### Medium Priority（緊急度: Normal）
- 重要だが緊急ではない項目

## アクション項目
- [ ] アクション（優先度/緊急度）

## 懸念事項・リスク
- リスク: 影響度と対策`
    };
    
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const templateName = btn.getAttribute('data-template');
            promptText.value = templates[templateName];
        });
    });
    
    // Reset Prompt
    const resetPromptBtn = document.getElementById('reset-prompt');
    resetPromptBtn.addEventListener('click', () => {
        promptText.value = templates.standard;
    });
    
    // Apply Prompt
    const applyPromptBtn = document.getElementById('apply-prompt');
    applyPromptBtn.addEventListener('click', () => {
        showNotification('条件を適用しました');
    });
    
    // Format Button
    const formatBtn = document.getElementById('format-btn');
    const outputLoading = document.getElementById('output-loading');
    const outputText = document.getElementById('output-text');
    const cancelBtn = document.getElementById('cancel-btn');
    
    let formatController = null; // For AbortController
    
    formatBtn.addEventListener('click', async () => {
        try {
            // Get input text
            let inputText = '';
            const inputType = document.querySelector('input[name="input-type"]:checked').value;
            
            if (inputType === 'text' || inputType === 'file') {
                inputText = document.getElementById('conversation-input').value.trim();
                if (!inputText) {
                    showNotification('テキストを入力してください', 'error');
                    return;
                }
            }
            
            // Get settings
            const settings = getSettings();
            
            // Show loading
            outputLoading.style.display = 'flex';
            
            // Switch to output tab
            document.querySelector('.tab-btn[data-tab="output"]').click();
            
            // Create AbortController for cancellation
            formatController = new AbortController();
            
            // Format conversation
            const formattedText = await window.formatConversation(inputText, settings, formatController.signal);
            
            // Display result
            outputText.innerHTML = formattedText.replace(/\n/g, '<br>');
            
            // Hide loading
            outputLoading.style.display = 'none';
            
            // Reset controller
            formatController = null;
            
            showNotification('フォーマットが完了しました');
        } catch (error) {
            // Hide loading
            outputLoading.style.display = 'none';
            
            // Reset controller
            formatController = null;
            
            // Check if it's an abort error
            if (error.name === 'AbortError') {
                showNotification('フォーマットがキャンセルされました', 'warning');
            } else {
                logError('Format Error', error.message);
            }
        }
    });
    
    // Cancel Button
    cancelBtn.addEventListener('click', () => {
        if (formatController) {
            formatController.abort();
        }
    });
    
    // Output Actions
    const exportFormatSelect = document.getElementById('export-format-select');
    const exportConfirmBtn = document.getElementById('export-confirm-btn');
    const otherActionSelect = document.getElementById('other-action-select');
    const otherActionConfirmBtn = document.getElementById('other-action-confirm-btn');

    exportConfirmBtn.addEventListener('click', () => {
        const outputText = document.getElementById('output-text').innerText;
        const format = exportFormatSelect.value;

        if (!outputText) {
            showNotification('エクスポートするテキストがありません', 'error');
            return;
        }

        try {
            let content = outputText;
            let filename = `formatted_conversation.${format}`;
            let mimeType = 'text/plain';

            if (format === 'html') {
                content = generateHtmlContent(outputText);
                mimeType = 'text/html';
            } else if (format === 'md') {
                mimeType = 'text/markdown';
            } else if (format === 'json') {
                content = generateJsonContent(outputText);
                mimeType = 'application/json';
            }

            downloadFile(content, filename, mimeType);
            showNotification(`${format.toUpperCase()} 形式でダウンロードしました`);
        } catch (error) {
            logError('Download Error', error.message);
        }
    });

    otherActionConfirmBtn.addEventListener('click', async () => {
        const outputText = document.getElementById('output-text').innerText;
        const action = otherActionSelect.value;

        if (!action) {
            showNotification('アクションを選択してください', 'warning');
            return;
        }

        if (!outputText) {
            showNotification('アクションを実行するテキストがありません', 'error');
            otherActionSelect.value = ''; // Reset selection
            return;
        }

        try {
            switch (action) {
                case 'copy':
                    await navigator.clipboard.writeText(outputText);
                    showNotification('テキストをコピーしました');
                    break;
                case 'print':
                    printOutput(outputText);
                    break;
                case 'share':
                    if (navigator.share) {
                        await navigator.share({
                            title: 'フォーマット済み会話',
                            text: outputText
                        });
                        showNotification('テキストを共有しました');
                    } else {
                        showNotification('共有機能はこのブラウザでサポートされていません', 'error');
                    }
                    break;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                logError('Action Error', error.message);
            }
        }
        otherActionSelect.value = ''; // Reset selection after action
    });

    // Helper Functions (Keep these as they are used by the new listeners)
    function generateHtmlContent(text) {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>フォーマット済み会話</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #343a40;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3 {
            color: #4a6fa5;
        }
        .timestamp {
            color: #6c757d;
            font-style: italic;
            margin-bottom: 10px;
        }
        .topic {
            margin-bottom: 30px;
        }
        .speaker {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>フォーマット済み会話</h1>
    <div class="conversation">
        ${text.replace(/\n/g, '<br>')}
    </div>
</body>
</html>`;
    }

    function generateJsonContent(text) {
        const lines = text.split('\n');
        const topics = [];
        let currentTopic = null;
        
        lines.forEach(line => {
            if (line.startsWith('# ')) {
                if (currentTopic) {
                    topics.push(currentTopic);
                }
                currentTopic = {
                    title: line.substring(2),
                    timestamp: '',
                    messages: []
                };
            } else if (line.match(/^\d{2}:\d{2}頃～/)) {
                if (currentTopic) {
                    currentTopic.timestamp = line;
                }
            } else if (line.match(/^[^:]+:/)) {
                const parts = line.split(':', 2);
                if (currentTopic) {
                    currentTopic.messages.push({
                        speaker: parts[0],
                        text: parts[1].trim()
                    });
                }
            }
        });
        
        if (currentTopic) {
            topics.push(currentTopic);
        }
        
        return JSON.stringify({ topics: topics }, null, 2);
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function printOutput(text) {
        let printWindow = null;
        try {
            printWindow = window.open('', '_blank');
            if (!printWindow) {
                showNotification('ポップアップがブロックされた可能性があります。設定を確認してください。', 'warning');
                logError('Print Error', 'window.open failed, possibly blocked.');
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="ja">
                <head>
                    <meta charset="UTF-8">
                    <title>フォーマット済み会話 - 印刷用</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #343a40;
                            margin: 20px;
                        }
                        h1 {
                            color: #4a6fa5;
                            font-size: 1.5em;
                            border-bottom: 1px solid #ccc;
                            padding-bottom: 5px;
                            margin-bottom: 15px;
                        }
                        .conversation {
                            white-space: pre-wrap;
                            word-wrap: break-word;
                        }
                        /* Add more specific print styles if needed */
                        @media print {
                            body {
                                font-size: 11pt;
                                margin: 10mm;
                            }
                            h1 {
                                page-break-after: avoid;
                            }
                            .conversation p {
                                page-break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>フォーマット済み会話</h1>
                    <div class="conversation">
                        ${text.replace(/\n/g, '<br>')}
                    </div>
                    <script>
                        window.onload = function() {
                            try {
                                window.print();
                            } catch (e) {
                                console.error('Error calling window.print:', e);
                                alert('印刷の呼び出し中にエラーが発生しました。');
                            }
                            // Close window after a delay, allowing print dialog to appear
                            // Note: This might still be unreliable depending on the browser
                            setTimeout(function() {
                                // Check if the window is still open before trying to close
                                if (window && !window.closed) {
                                     // window.close(); // Temporarily disable auto-close for debugging
                                }
                            }, 1500); // Increased delay
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close(); // Ensure document writing is complete

        } catch (error) {
            logError('Print Error', '印刷ウィンドウの準備中にエラーが発生しました: ' + error.message);
            showNotification('印刷の準備中にエラーが発生しました', 'error');
            // Attempt to close the window if it was opened but an error occurred later
            if (printWindow && !printWindow.closed) {
                try {
                    printWindow.close();
                } catch (e) {
                    // Ignore errors during cleanup close
                }
            }
        }
    }
    
    // Get settings function
    function getSettings() {
        return {
            removeFillers: document.getElementById('remove-fillers').checked,
            addTimestamps: document.getElementById('add-timestamps').checked,
            timestampInterval: parseInt(document.getElementById('timestamp-interval').value),
            groupByTopic: document.getElementById('group-by-topic').checked,
            addTitles: document.getElementById('add-titles').checked,
            speakerFormat: document.getElementById('speaker-format').value,
            model: document.getElementById('model-select').value,
            // demoMode: document.getElementById('demo-mode').checked, // Removed demo mode
            apiKey: document.getElementById('api-key').value,
            temperature: parseFloat(document.getElementById('temperature').value),
            startTime: document.getElementById('start-time').value
        };
    }
    
    // Notification function
    window.showNotification = function(message, type = 'success') {
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
    };
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification.success {
            background-color: #28a745;
        }
        
        .notification.error {
            background-color: #dc3545;
        }
        
        .notification.warning {
            background-color: #ffc107;
            color: #343a40;
        }
        
        .notification.info {
            background-color: #17a2b8;
        }
    `;
    document.head.appendChild(style);
});
