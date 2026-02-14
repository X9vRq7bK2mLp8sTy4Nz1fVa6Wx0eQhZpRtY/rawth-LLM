#!/bin/sh

# Start Ollama server in the background
echo "[start.sh] Starting Ollama server..."
ollama serve &

# Wait for Ollama to be ready
echo "[start.sh] Waiting for Ollama to be ready..."
until curl -s http://localhost:11434/ > /dev/null 2>&1; do
    sleep 1
done
echo "[start.sh] Ollama is ready!"

# Pull the model (skips if already present)
echo "[start.sh] Pulling phi4-mini model..."
ollama pull phi4-mini
echo "[start.sh] Model ready!"

# Start the Discord bot
echo "[start.sh] Starting Discord bot..."
npm run prod
