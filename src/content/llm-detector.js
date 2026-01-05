/**
 * LLM Provider Detection Module
 * Part of Security Scanner v1.2.0
 * Copyright (c) 2026 Lynda M Birss
 * 
 * Detects LLM/AI providers being used on web pages
 * Assesses trust level and data usage policies
 */

const LLM_PROVIDERS = {
    anthropic: {
        name: 'Anthropic (Claude)',
        patterns: [
            /api\.anthropic\.com/i,
            /claude\.ai/i,
            /\bclaude\b/i
        ],
        trustLevel: 'trusted',
        trustColor: '#22c55e',
        trustIcon: '🟢',
        dataPolicy: 'Does not train on user data',
        recommendations: 'Trusted provider with strong privacy practices'
    },
    
    openai: {
        name: 'OpenAI (ChatGPT)',
        patterns: [
            /api\.openai\.com/i,
            /openai\.com/i,
            /chatgpt/i,
            /gpt-[34]/i
        ],
        trustLevel: 'known',
        trustColor: '#ea580c',
        trustIcon: '🟠',
        dataPolicy: 'May use data for training unless opted out',
        recommendations: 'Verify privacy settings before sharing sensitive data'
    },
    
    google: {
        name: 'Google AI (Gemini/PaLM)',
        patterns: [
            /generativelanguage\.googleapis\.com/i,
            /bard\.google\.com/i,
            /gemini/i,
            /palm\.googleapis/i
        ],
        trustLevel: 'known',
        trustColor: '#ea580c',
        trustIcon: '🟠',
        dataPolicy: 'Data usage governed by Google privacy policy',
        recommendations: 'Review privacy settings before use'
    },
    
    cohere: {
        name: 'Cohere AI',
        patterns: [
            /api\.cohere\.ai/i,
            /cohere\.ai/i
        ],
        trustLevel: 'known',
        trustColor: '#ea580c',
        trustIcon: '🟠',
        dataPolicy: 'See cohere.ai privacy policy',
        recommendations: 'Enterprise AI provider'
    },
    
    huggingface: {
        name: 'Hugging Face',
        patterns: [
            /huggingface\.co/i,
            /hf\.co/i,
            /huggingface/i
        ],
        trustLevel: 'known',
        trustColor: '#ea580c',
        trustIcon: '🟠',
        dataPolicy: 'Open source models - check specific model license',
        recommendations: 'AI research platform - model privacy varies'
    },
    
    unknown: {
        name: 'Unknown AI Provider',
        patterns: [
            /\bchat\b/i,
            /\bai\b/i,
            /\bassistant\b/i,
            /chatbot/i,
            /\bllm\b/i
        ],
        trustLevel: 'unknown',
        trustColor: '#dc2626',
        trustIcon: '🔴',
        dataPolicy: 'Cannot verify - data usage unknown',
        recommendations: 'Avoid sharing sensitive information'
    }
};

/**
 * Detect LLM usage on current page
 * Returns null if no AI detected, otherwise returns provider info
 */
function detectLLMProvider() {
    // Check page source for AI API patterns
    const pageSource = document.documentElement.outerHTML;
    const pageText = document.body ? document.body.innerText : '';
    const scripts = Array.from(document.scripts).map(s => s.src).join(' ');
    
    // Combine all text to search
    const searchText = (pageSource + pageText + scripts).toLowerCase();
    
    // Check each KNOWN provider only (skip 'unknown' to avoid false positives)
    for (const [key, provider] of Object.entries(LLM_PROVIDERS)) {
        // Skip 'unknown' entirely - too many false positives
        if (key === 'unknown') continue;
        
        for (const pattern of provider.patterns) {
            if (pattern.test(searchText)) {
                return {
                    detected: true,
                    provider: provider.name,
                    trustLevel: provider.trustLevel,
                    trustColor: provider.trustColor,
                    trustIcon: provider.trustIcon,
                    dataPolicy: provider.dataPolicy,
                    recommendations: provider.recommendations
                };
            }
        }
    }
    
    // No KNOWN AI provider detected
    return null;
}
