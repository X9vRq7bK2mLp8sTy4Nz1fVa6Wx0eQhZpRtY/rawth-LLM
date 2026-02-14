import { createServer } from 'http'
import('./client.js')

// Minimal health check server for Coolify (Port 3000)
createServer((req, res) => {
    res.writeHead(200)
    res.end('Bot is running.')
}).listen(3000)