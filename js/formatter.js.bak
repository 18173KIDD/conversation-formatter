// Call Gemini API
async function callGeminiAPI(prompt, settings) {
    try {
        const apiKey = settings.apiKey;
        const model = settings.model;
        const temperature = settings.temperature;

        // API endpoint - adjust based on model version
        let endpoint;
        switch (model) {
            case 'gemini-2.5-pro-exp-03-25':
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=' + apiKey;
                break;
            case 'gemini-2.5-pro':
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=' + apiKey;
                break;
            case 'gemini-2.0-flash':
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
                break;
            case 'gemini-2.0-pro':
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=' + apiKey;
                break;
            case 'gemini-1.5-flash':
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
                break;
            default:
                // Default to experimental 2.5 Pro if model not recognized
                console.warn(`Unrecognized model: ${model}. Defaulting to gemini-2.5-pro-exp-03-25.`);
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=' + apiKey;
        }

        // Request body
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: 8192,
                topK: 40,
                topP: 0.95
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        // Make the API call
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Handle API errors with more detail
        if (!response.ok) {
            let errorMessage = '';
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = `エラーコード: ${errorData.error.code}, メッセージ: ${errorData.error.message}`;
                    if (errorData.error.details) {
                        errorMessage += `, 詳細: ${JSON.stringify(errorData.error.details)}`;
                    }
                } else {
                    errorMessage = `ステータスコード: ${response.status}, ${response.statusText}`;
                }
            } catch (e) {
                errorMessage = `ステータスコード: ${response.status}, ${response.statusText}`;
            }
            throw new Error('Gemini API エラー: ' + errorMessage);
        }

        const data = await response.json();

        // Validate and extract the generated text with better error handling
        if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
            // Check for promptFeedback if candidates are missing
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                 throw new Error(`プロンプトがブロックされました: ${data.promptFeedback.blockReason}`);
            }
            throw new Error('API応答に候補が含まれていません');
        }

        const firstCandidate = data.candidates[0];

        // Check for content filtering or other finish reasons
        if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
             if (firstCandidate.finishReason === 'SAFETY') {
                 const safetyRatings = firstCandidate.safetyRatings ? JSON.stringify(firstCandidate.safetyRatings) : '詳細不明';
                 throw new Error(`コンテンツフィルタリングにより生成が停止されました。理由: ${firstCandidate.finishReason}, 安全性評価: ${safetyRatings}`);
             } else {
                 throw new Error(`生成が予期せず終了しました。理由: ${firstCandidate.finishReason}`);
             }
        }

        if (!firstCandidate.content || !firstCandidate.content.parts || !Array.isArray(firstCandidate.content.parts) || firstCandidate.content.parts.length === 0 || !firstCandidate.content.parts[0].text) {
            throw new Error('API応答の形式が不正です: テキストコンテンツが見つかりません');
        }

        return firstCandidate.content.parts[0].text;

    } catch (error) {
        console.error('Gemini API error:', error);
        // Add more context to the error message
        const errorMessage = error.message.includes('Gemini API エラー') || error.message.includes('プロンプトがブロックされました') || error.message.includes('コンテンツフィルタリング') || error.message.includes('生成が予期せず終了しました')
            ? error.message
            : 'Gemini API の呼び出しに失敗しました: ' + error.message;
        throw new Error(errorMessage);
    }
}
