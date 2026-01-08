const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('_helpers/db');
const crypto = require('crypto');

// Generate UUID without external package
function uuidv4() {
    return crypto.randomUUID();
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
    sendMessage,
    getChatHistory,
    clearHistory
};

async function sendMessage({ AccountId, message, conversationId }) {
    try {
        // Create or retrieve conversation ID
        const convId = conversationId || uuidv4();

        // Get recent chat history for context
        const recentHistory = await db.ChatMessage.findAll({
            where: { 
                AccountId,
                conversationId: convId
            },
            order: [['timestamp', 'DESC']],
            limit: 10
        });

        // Build conversation context
        const conversationHistory = recentHistory
            .reverse()
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message}`)
            .join('\n');

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Create prompt with context
        const prompt = conversationHistory 
            ? `Previous conversation:\n${conversationHistory}\n\nUser: ${message}\n\nAssistant:`
            : `User: ${message}\n\nAssistant:`;

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const botReply = response.text();

        // Save user message
        await db.ChatMessage.create({
            AccountId,
            conversationId: convId,
            role: 'user',
            message,
            timestamp: new Date()
        });

        // Save bot response
        await db.ChatMessage.create({
            AccountId,
            conversationId: convId,
            role: 'assistant',
            message: botReply,
            timestamp: new Date()
        });

        // Clean up old messages (keep last 100 per user)
        await cleanupOldMessages(AccountId);

        return {
            conversationId: convId,
            message: botReply,
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Chatbot error:', error);
        throw new Error('Failed to process message. Please try again.');
    }
}

async function getChatHistory(AccountId, limit = 50) {
    const messages = await db.ChatMessage.findAll({
        where: { AccountId },
        order: [['timestamp', 'DESC']],
        limit
    });

    return messages.reverse();
}

async function clearHistory(AccountId) {
    await db.ChatMessage.destroy({
        where: { AccountId }
    });
}

async function cleanupOldMessages(AccountId) {
    const messageCount = await db.ChatMessage.count({ where: { AccountId } });
    
    if (messageCount > 100) {
        const messagesToDelete = await db.ChatMessage.findAll({
            where: { AccountId },
            order: [['timestamp', 'ASC']],
            limit: messageCount - 100
        });

        const idsToDelete = messagesToDelete.map(msg => msg.chatMessageId);
        
        await db.ChatMessage.destroy({
            where: {
                chatMessageId: idsToDelete
            }
        });
    }
}