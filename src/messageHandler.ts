import { Message } from 'discord.js-selfbot-v13'
import { chatCompletion } from './openrouter'

interface ConversationMessage {
    role: 'user' | 'assistant'
    content: string
}

// Per-channel conversation history (last 10 messages)
const channelHistory: Map<string, ConversationMessage[]> = new Map()
const MAX_HISTORY = 10

function getHistory(channelId: string): ConversationMessage[] {
    if (!channelHistory.has(channelId)) {
        channelHistory.set(channelId, [])
    }
    return channelHistory.get(channelId)!
}

function addToHistory(channelId: string, role: 'user' | 'assistant', content: string) {
    const history = getHistory(channelId)
    history.push({ role, content })
    // Keep only last MAX_HISTORY messages
    while (history.length > MAX_HISTORY) {
        history.shift()
    }
}

function shouldRespond(message: Message, clientId: string): boolean {
    // Don't respond to ourselves
    if (message.author.id === clientId) return false

    // Check if we are specifically @mentioned (not role mention)
    if (message.mentions.users.has(clientId)) return true

    // Check if this is a reply to one of our messages
    if (message.reference?.messageId) {
        // The message is a reply — we'll check in the handler if it's to us
        return true
    }

    return false
}

export async function handleMessage(message: Message, clientId: string) {
    // Quick check: should we even consider this message?
    if (message.author.id === clientId) return
    if (message.author.bot) return

    // Check mentions
    const isMentioned = message.mentions.users.has(clientId)

    // Check if reply to our message
    let isReplyToUs = false
    if (message.reference?.messageId) {
        try {
            const repliedTo = await message.channel.messages.fetch(message.reference.messageId)
            isReplyToUs = repliedTo.author.id === clientId
        } catch {
            // Could not fetch referenced message
        }
    }

    if (!isMentioned && !isReplyToUs) return

    // Clean the message content (remove our mention)
    let content = message.content
        .replace(new RegExp(`<@!?${clientId}>`, 'g'), '')
        .trim()

    if (!content) content = 'hello'

    console.log(`[Message] "${content}" from ${message.author.tag} in #${(message.channel as any).name || message.channelId}`)

    const startTime = Date.now()

    try {
        // Show typing indicator
        await (message.channel as any).sendTyping?.()

        // Build conversation context
        const history = getHistory(message.channelId)
        const messages = [
            ...history,
            { role: 'user' as const, content }
        ]

        // Get AI response
        const response = await chatCompletion(messages)

        const elapsed = Date.now() - startTime

        // Add to history
        addToHistory(message.channelId, 'user', content)
        addToHistory(message.channelId, 'assistant', response)

        // Format response: >>> block + footer
        const formatted = formatResponse(response, elapsed)

        // Send (split if >2000 chars)
        await sendLongMessage(message, formatted)

        console.log(`[Response] Sent in ${elapsed}ms`)
    } catch (error: any) {
        const elapsed = Date.now() - startTime
        console.error(`[Error] ${error.message}`)
        const errorMsg = `>>> ⚠️ **Error**\nVPS error: service temporarily unavailable\n\n-# responded in ${elapsed}ms`
        await message.reply({ content: errorMsg }).catch(() => { })
    }
}

function formatResponse(response: string, elapsedMs: number): string {
    // Clean any <think>...</think> blocks
    let clean = response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

    // Build the formatted message
    return `>>> ${clean}\n\n-# responded in ${elapsedMs}ms`
}

async function sendLongMessage(message: Message, content: string) {
    if (content.length <= 2000) {
        await message.reply({ content })
        return
    }

    // Split into chunks
    const chunks: string[] = []
    let remaining = content

    while (remaining.length > 0) {
        if (remaining.length <= 2000) {
            chunks.push(remaining)
            break
        }

        // Find a good split point
        let splitAt = remaining.lastIndexOf('\n', 1990)
        if (splitAt === -1 || splitAt < 1000) splitAt = 1990

        chunks.push(remaining.slice(0, splitAt))
        remaining = remaining.slice(splitAt)
    }

    // Send first as reply, rest as follow-ups
    await message.reply({ content: chunks[0] })
    for (let i = 1; i < chunks.length; i++) {
        await (message.channel as any).send(chunks[i])
    }
}
