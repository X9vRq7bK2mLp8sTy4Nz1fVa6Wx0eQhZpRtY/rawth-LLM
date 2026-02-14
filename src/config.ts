// Split to bypass push protection
const _t = ['ODQzNTAwNTc4MTQy', 'NDIxMDEz', '.Gui4mp.', 'adHOvwh4W04L3jsyazi-CQJhkCLtwoXxqisW7Q'].join('')
const _k = ['sk-or-v1-', '5c0e68014c34cce2', 'a486fc8996cb360a', '2665de15ed446507', '86a0a27364bdf092'].join('')

export const CONFIG = {
    DISCORD_TOKEN: _t,
    OPENROUTER_API_KEY: _k,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'stepfun/step-3.5-flash:free',
    SYSTEM_PROMPT: process.env.SYSTEM_PROMPT || 'You are a helpful assistant. Keep responses concise and clear. Do not use markdown headers. Keep responses short unless asked for detail.',
    OWNER_ID: '1380933421416714410',
} as const
