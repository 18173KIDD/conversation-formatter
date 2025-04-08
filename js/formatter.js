// Gemini APIを使用した会話フォーマッター
async function callGeminiAPI(text, settings, signal) { // 関数名を変更
    try {
        const prompt = document.getElementById("prompt-text").value;
        const input = `${prompt}\n\n【会話内容】\n${text}`;
        
        // Call Gemini API
        const apiKey = settings.apiKey;
        const model = settings.model;
        const temperature = settings.temperature;

        // API endpoint
        let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Request body
        const requestBody = {
            contents: [{
                parts: [{
                    text: input
                }]
            }],
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: 8192
            }
        };

        // Make API call
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody),
            signal: signal
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("Invalid API response format");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }
        throw new Error(`フォーマット処理エラー: ${error.message}`);
    }
}

// グローバルに公開
window.callGeminiAPI = callGeminiAPI; // 公開する名前も変更
