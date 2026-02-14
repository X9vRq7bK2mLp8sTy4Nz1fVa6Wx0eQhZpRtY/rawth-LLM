import { CONFIG } from './config'

interface Message {
    role: 'system' | 'user' | 'assistant'
    content: string
}

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string
        }
    }>
}

export async function chatCompletion(messages: Message[]): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/rawth-selfbot',
            'X-Title': 'Rawth Selfbot',
        },
        body: JSON.stringify({
            model: CONFIG.OPENROUTER_MODEL,
            messages: [
                { role: 'system', content: CONFIG.SYSTEM_PROMPT },
                ...messages
            ],
            max_tokens: 1500,
            reasoning: { enabled: true },
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error(`[API] Error (${response.status}): ${errorText}`)
        throw new Error(`VPS error: service temporarily unavailable (${response.status})`)
    }

    const data = await response.json() as OpenRouterResponse

    if (!data.choices || data.choices.length === 0) {
        throw new Error('VPS error: no response generated')
    }

    return data.choices[0].message.content
}
