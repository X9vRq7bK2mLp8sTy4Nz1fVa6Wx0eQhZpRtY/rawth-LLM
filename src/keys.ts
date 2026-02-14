import { getEnvVar } from './utils/index.js'

export const Keys = {
    clientToken: getEnvVar('CLIENT_TOKEN') || getEnvVar('DISCORD_TOKEN'),
    ipAddress: getEnvVar('OLLAMA_IP', 'akg8o0g8go0kc4kc4ocgos40.152.53.186.59.sslip.io'), // your Coolify domain
    portAddress: getEnvVar('OLLAMA_PORT', ''), // no default port as per request
    defaultModel: getEnvVar('MODEL', 'llama3.2')
} as const // readonly keys

export default Keys