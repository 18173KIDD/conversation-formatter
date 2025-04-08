// Export and Download Functions
document.addEventListener('DOMContentLoaded', function() {
    // Add additional export format options
    const outputActions = document.querySelector('.output-actions');
    
    // Add format selection dropdown
    const formatSelector = document.createElement('div');
    formatSelector.className = 'format-selector';
    formatSelector.innerHTML = `
        <label for="export-format">エクスポート形式:</label>
        <select id="export-format">
            <option value="txt">テキスト (.txt)</option>
            <option value="md">Markdown (.md)</option>
            <option value="html">HTML (.html)</option>
            <option value="json">JSON (.json)</option>
        </select>
    `;
    
    // Insert format selector before the action buttons
    outputActions.insertBefore(formatSelector, outputActions.firstChild);
    
    // Update download button handler
    const downloadBtn = document.getElementById('download-output');
    downloadBtn.addEventListener('click', () => {
        const outputText = document.getElementById('output-text').innerHTML;
        const format = document.getElementById('export-format').value;
        
        // Convert HTML to the selected format
        let content = '';
        let filename = '';
        let mimeType = '';
        
        switch (format) {
            case 'txt':
                content = htmlToText(outputText);
                filename = 'formatted_conversation.txt';
                mimeType = 'text/plain';
                break;
            case 'md':
                content = htmlToMarkdown(outputText);
                filename = 'formatted_conversation.md';
                mimeType = 'text/markdown';
                break;
            case 'html':
                content = htmlToFullHtml(outputText);
                filename = 'formatted_conversation.html';
                mimeType = 'text/html';
                break;
            case 'json':
                content = htmlToJson(outputText);
                filename = 'formatted_conversation.json';
                mimeType = 'application/json';
                break;
        }
        
        // Create and download the file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`${format.toUpperCase()} ファイルをダウンロードしました`);
    });
    
    // Add print button
    const printBtn = document.createElement('button');
    printBtn.id = 'print-output';
    printBtn.className = 'btn secondary';
    printBtn.innerHTML = '<i class="fas fa-print"></i> 印刷';
    
    // Add print button to output actions
    outputActions.appendChild(printBtn);
    
    // Print button handler
    printBtn.addEventListener('click', () => {
        const outputText = document.getElementById('output-text').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>会話フォーマッター - 印刷</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #343a40;
                        padding: 20px;
                    }
                    h3 {
                        margin-top: 20px;
                        margin-bottom: 10px;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #dee2e6;
                    }
                    strong {
                        font-weight: bold;
                    }
                    @media print {
                        @page {
                            margin: 1cm;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>フォーマット済み会話</h1>
                <div>${outputText}</div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Print after a short delay to ensure content is loaded
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    });
    
    // Convert HTML to plain text
    function htmlToText(html) {
        // Create a temporary element
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Replace HTML elements with text equivalents
        let text = temp.innerText;
        
        // Clean up extra whitespace
        text = text.replace(/\n\s*\n/g, '\n\n');
        
        return text;
    }
    
    // Convert HTML to Markdown
    function htmlToMarkdown(html) {
        // Create a temporary element
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Process the DOM to create Markdown
        let markdown = '';
        
        // Process each node
        Array.from(temp.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                markdown += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                switch (node.tagName.toLowerCase()) {
                    case 'br':
                        markdown += '\n';
                        break;
                    case 'strong':
                        markdown += `**${node.textContent}**`;
                        break;
                    case 'h3':
                        markdown += `\n## ${node.textContent}\n\n`;
                        break;
                    default:
                        markdown += node.textContent;
                }
            }
        });
        
        // Clean up extra whitespace
        markdown = markdown.replace(/\n\s*\n/g, '\n\n');
        
        return markdown;
    }
    
    // Convert HTML to full HTML document
    function htmlToFullHtml(html) {
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
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #4a6fa5;
        }
        h3 {
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #dee2e6;
            color: #4a6fa5;
        }
        strong {
            font-weight: bold;
            color: #4a6fa5;
        }
        .timestamp {
            color: #6c757d;
            font-style: italic;
            margin: 10px 0;
        }
        .speaker {
            font-weight: bold;
        }
        footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.8em;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <h1>フォーマット済み会話</h1>
    <div class="conversation-content">
        ${html}
    </div>
    <footer>
        <p>会話フォーマッターで生成されました</p>
    </footer>
</body>
</html>`;
    }
    
    // Convert HTML to JSON
    function htmlToJson(html) {
        // Create a temporary element
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Extract conversation data
        const conversation = {
            topics: [],
            timestamps: [],
            speakers: new Set(),
            messages: []
        };
        
        // Current topic and timestamp
        let currentTopic = null;
        let currentTimestamp = null;
        
        // Process each node
        Array.from(temp.childNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                switch (node.tagName.toLowerCase()) {
                    case 'h3':
                        currentTopic = node.textContent.trim();
                        conversation.topics.push(currentTopic);
                        break;
                    case 'strong':
                        currentTimestamp = node.textContent.trim();
                        conversation.timestamps.push(currentTimestamp);
                        break;
                    default:
                        // Check if this is a message line
                        const text = node.textContent.trim();
                        if (text && !node.tagName.toLowerCase().startsWith('h')) {
                            const speakerMatch = text.match(/^([A-Za-z0-9]+):\s*(.*)/);
                            if (speakerMatch) {
                                const speaker = speakerMatch[1];
                                const content = speakerMatch[2];
                                
                                conversation.speakers.add(speaker);
                                conversation.messages.push({
                                    speaker: speaker,
                                    content: content,
                                    topic: currentTopic,
                                    timestamp: currentTimestamp
                                });
                            }
                        }
                }
            }
        });
        
        // Convert Set to Array for JSON serialization
        const result = {
            topics: conversation.topics,
            timestamps: conversation.timestamps,
            speakers: Array.from(conversation.speakers),
            messages: conversation.messages,
            metadata: {
                generatedAt: new Date().toISOString(),
                messageCount: conversation.messages.length,
                topicCount: conversation.topics.length
            }
        };
        
        return JSON.stringify(result, null, 2);
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
