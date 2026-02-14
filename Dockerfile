# Full Linux image (not Alpine) for Ollama compatibility
FROM node:22-bookworm-slim

# Install curl for health checks and Ollama
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy project files
COPY ./src ./src
COPY ./*.json ./
COPY ./.env ./
COPY ./start.sh ./

# Make startup script executable
RUN chmod +x start.sh

# Install Node dependencies
RUN npm install

# Build TypeScript
RUN npm run build

# Start both Ollama and the bot
CMD ["./start.sh"]
