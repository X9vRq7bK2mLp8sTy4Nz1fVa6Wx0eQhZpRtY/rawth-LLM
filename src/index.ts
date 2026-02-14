import { Client } from 'discord.js-selfbot-v13'
import { CONFIG } from './config'
import { handleMessage } from './messageHandler'

const client = new Client()

client.on('ready', () => {
    console.log(`[Ready] Logged in as ${client.user?.tag}`)
    console.log(`[Config] Model: ${CONFIG.OPENROUTER_MODEL}`)
    console.log(`[Config] API Key: ${CONFIG.OPENROUTER_API_KEY ? '✓ Set' : '✗ Missing!'}`)
})

client.on('messageCreate', async (message) => {
    try {
        await handleMessage(message, client.user!.id)
    } catch (error: any) {
        console.error(`[Fatal] ${error.message}`)
    }
})

// Login
if (!CONFIG.DISCORD_TOKEN) {
    console.error('[Error] No Discord token provided!')
    process.exit(1)
}

if (!CONFIG.OPENROUTER_API_KEY) {
    console.warn('[Warning] No OpenRouter API key set! AI responses will fail.')
}

client.login(CONFIG.DISCORD_TOKEN)
