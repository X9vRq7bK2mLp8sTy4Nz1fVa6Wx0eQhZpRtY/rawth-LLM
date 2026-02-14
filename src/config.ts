export const CONFIG = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
    SYSTEM_PROMPT: process.env.SYSTEM_PROMPT || 'You are a helpful assistant. Keep responses concise and clear. Do not use markdown headers. Keep responses short unless asked for detail.',
} as const
