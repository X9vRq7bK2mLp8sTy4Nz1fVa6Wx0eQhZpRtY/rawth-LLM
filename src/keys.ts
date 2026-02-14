import { getEnvVar } from './utils/index.js'

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN') || getEnvVar('DISCORD_TOKEN'),
    ipAddress: getEnvVar('OLLAMA_IP', 'localhost'),
    portAddress: getEnvVar('OLLAMA_PORT', '11434'),
    defaultModel: getEnvVar('MODEL', 'smollm2:360m')
} as const // readonly keys

export default Keys