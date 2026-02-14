import { getEnvVar } from './utils/index.js'

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN') || getEnvVar('DISCORD_TOKEN'),
    ipAddress: getEnvVar('OLLAMA_IP', 'ollama'), // Internal Docker name
    portAddress: getEnvVar('OLLAMA_PORT', '11434'), // Internal Ollama port
    defaultModel: getEnvVar('MODEL', 'llama3.2')
} as const // readonly keys

export default Keys