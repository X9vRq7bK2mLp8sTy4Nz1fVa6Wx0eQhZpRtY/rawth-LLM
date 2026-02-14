import { getEnvVar } from './utils/index.js'

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN') || getEnvVar('DISCORD_TOKEN'),
    ipAddress: getEnvVar('OLLAMA_IP', 'nk80css0gckgg0gg4s0g4cks.152.53.186.59.sslip.io'), // Your actual Ollama service
    portAddress: getEnvVar('OLLAMA_PORT', ''), // Port handled by sslip.io mapping
    defaultModel: getEnvVar('MODEL', 'llama3.2')
} as const // readonly keys

export default Keys