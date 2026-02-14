import { getEnvVar } from './utils/index.js'

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN') || getEnvVar('DISCORD_TOKEN'),
    ipAddress: getEnvVar('OLLAMA_IP', '152.53.186.59'), // your VPS IP
    portAddress: getEnvVar('OLLAMA_PORT', '3000'), // your port 3000
    defaultModel: getEnvVar('MODEL', 'llama3.2')
} as const // readonly keys

export default Keys