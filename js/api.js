// API Integration for Conversation Formatter
document.addEventListener('DOMContentLoaded', function() {
    // Mock API call for demo mode
    window.formatConversation = async function(text, settings, signal) {
        try {
            // Check if signal is aborted
            if (signal && signal.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            // If demo mode or no API key, use mock processing
            if (settings.demoMode || !settings.apiKey) {
                return await mockProcessing(text, settings, signal);
            }

            // Otherwise, call Gemini API (defined in formatter.js)
            return await window.callGeminiAPI(text, settings, signal);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error; // Re-throw abort errors
            }
            logError('API Error', error.message);
            throw new Error('APIの呼び出しに失敗しました: ' + error.message);
        }
    };

    // Mock processing function
    async function mockProcessing(text, settings, signal) {
        // Create a prompt based on settings
        const prompt = createPrompt(text, settings);

        // Simulate API delay
        await simulateDelay(2000, signal);

        // Check if signal is aborted
        if (signal && signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        // Simple mock formatting
        let result = '# 会話の開始\n\n';
        result += '00:00頃～\n\n';

        // Split text into lines
        const lines = text.split('\n');
        let currentSpeaker = '';

        for (let i = 0; i < lines.length; i++) {
            // Check for abort every 10 lines
            if (i % 10 === 0 && signal && signal.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            const line = lines[i].trim();
            if (!line) continue;

            // Simple speaker detection
            if (line.includes(':')) {
                const parts = line.split(':', 2);
                currentSpeaker = parts[0].trim();
                const text = parts[1].trim();

                // Apply filler word removal if enabled
                let processedText = text;
                if (settings.removeFillers) {
                    processedText = removeFillersFromText(processedText);
                }

                result += `${currentSpeaker}: ${processedText}\n\n`;
            } else {
                // If no speaker detected, use the last known speaker
                let processedText = line;
                if (settings.removeFillers) {
                    processedText = removeFillersFromText(processedText);
                }

                if (currentSpeaker) {
                    result += `${currentSpeaker}: ${processedText}\n\n`;
                } else {
                    result += `${processedText}\n\n`;
                }
            }

            // Add timestamp every 10 lines if enabled
            if (settings.addTimestamps && i > 0 && i % 10 === 0) {
                const minutes = Math.floor(i / 10) * settings.timestampInterval;
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                result += `\n# 話題の続き\n\n`;
                result += `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}頃～\n\n`;
            }
        }

        return result;
    }

    // Create prompt based on settings
    function createPrompt(text, settings) {
        let prompt = document.getElementById('prompt-text').value;

        // Add settings-specific instructions
        if (!settings.removeFillers) {
            prompt = prompt.replace('- 「えー」「あー」などのフィラーワードは削除してください', '- フィラーワードは保持してください');
        }

        if (!settings.addTimestamps) {
            prompt = prompt.replace(/- 大まかに(\d+)分おきの時間表示.+\n/, '');
        } else {
            prompt = prompt.replace(/(\d+)分おき/, `${settings.timestampInterval}分おき`);
        }

        if (!settings.groupByTopic) {
            prompt = prompt.replace('- 話題の自然な流れを優先し、関連する内容はひとまとまりにしてください\n', '');
            prompt = prompt.replace('- 話題が変わったと判断できる箇所で区切りを入れてください\n', '');
        }

        if (!settings.addTitles) {
            prompt = prompt.replace('- 各トピックには内容を端的に表すタイトルをつけてください\n', '');
        }

        // Add the conversation text
        prompt += '\n\n【会話】\n' + text;

        return prompt;
    }


    // Helper function to simulate delay
    async function simulateDelay(ms, signal) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, ms);

            // If signal exists, add abort listener
            if (signal) {
                signal.addEventListener('abort', () => {
                    clearTimeout(timeout);
                    reject(new DOMException('Aborted', 'AbortError'));
                });
            }
        });
    }

    // Helper function to remove filler words
    function removeFillersFromText(text) {
        const fillerWords = [
            'えー', 'えーと', 'あー', 'あのー', 'その', 'まあ', 'ま', 'うーん',
            'なんか', 'ちょっと', 'あの', 'そのー', 'ええと', 'うん', 'あのね',
            'ていうか', 'というか', 'っていうか', 'じゃあ', 'だから', 'で', 'でも'
        ];

        let result = text;
        fillerWords.forEach(word => {
            // Improved regex to handle word boundaries and potential punctuation
            const regex = new RegExp(`(^|\s)${word}(\s|\.|,|!|\?|$)`, 'gi');
            result = result.replace(regex, '$1$2'); // Keep surrounding whitespace/punctuation
        });

        // Trim extra whitespace that might result
        result = result.replace(/\s{2,}/g, ' ').trim();

        return result;
    }
});
