const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');

// --- Configuration ---
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "INSERT_UR_BOT_TOKEN_HERE"; // Hardcoded/Env fallback
const MONGO_URI = process.env.MONGO_URI;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://ollama:11434";
const MODEL_NAME = "qwen2.5-coder:0.5b";

// --- Database Schema (Simplified match to existing schema to log chats) ---
const MessageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    createdAt: { type: Date, default: Date.now },
    chatId: { type: String, required: true, index: true },
});

const ChatSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    chatId: { type: String, unique: true, sparse: true }, // Added missing path
    title: { type: String, default: 'New Chat' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    messages: [MessageSchema],
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

// --- Discord Client ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

// --- Helper: Call Ollama ---
async function generateAIResponse(prompt) {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [{ role: 'user', content: prompt }],
                stream: false,
            }),
        });

        if (!response.ok) {
            console.error("Ollama Error:", await response.text());
            return "I'm having trouble thinking right now. (Ollama API Error)";
        }

        const data = await response.json();
        return data.message?.content || "No response content.";
    } catch (error) {
        console.error("AI Generation Failed:", error);
        return "Sorry, I can't reach my brain. (Connection Error)";
    }
}

// --- Helper: Save to Mongo ---
async function saveConversation(userId, prompt, response) {
    if (!MONGO_URI) return;
    try {
        // Use a static chat ID for the user's DMs/Thread to keep history linear per user
        // Or just log it. For now, creating a "Discord History" chat per user.
        const chatId = `discord-${userId}`;

        await Chat.findOneAndUpdate(
            { chatId, userId: `discord-${userId}` },
            {
                $setOnInsert: { title: 'Discord Conversation', createdAt: new Date() },
                $set: { updatedAt: new Date() },
                $push: {
                    messages: {
                        $each: [
                            { role: 'user', content: prompt, chatId },
                            { role: 'assistant', content: response, chatId }
                        ]
                    }
                }
            },
            { upsert: true, new: true }
        );
    } catch (e) {
        console.error("DB Save Error:", e);
    }
}

client.on('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Using Model: ${MODEL_NAME}`);
    if (MONGO_URI) {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    }
});

client.on('messageCreate', async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    const isDM = !message.guild;
    const isMentioned = client.user && message.mentions.has(client.user);

    // Trigger if DM or Mentioned
    if (isDM || isMentioned) {
        // Remove mention from content to clean up prompt
        let prompt = message.content;
        if (isMentioned) {
            prompt = prompt.replace(/<@!?[0-9]+>/, '').trim();
        }

        if (!prompt) return; // Don't respond to empty mentions

        await message.channel.sendTyping();

        const response = await generateAIResponse(prompt);
        await saveConversation(message.author.id, prompt, response);

        // Format with block quotes as requested
        const formattedResponse = `>>> ${response}`;

        // Split if too long for Discord (2000 chars limit)
        // Simple chunking
        const chunks = formattedResponse.match(/[\s\S]{1,1900}/g) || [formattedResponse];

        for (const chunk of chunks) {
            await message.reply(chunk);
        }
    }
});

client.login(DISCORD_TOKEN);
