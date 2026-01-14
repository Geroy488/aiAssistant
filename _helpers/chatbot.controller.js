const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = 
    'You are a helpful and knowledgeable instructor. ' +
    'Provide clear, concise, and structured answers. Use markdown formatting extensively.';

async function sendMessage(req, res) {
    try {
        const { message, conversationHistory } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                success: false,
                error: 'Message is required and must be a string' 
            });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env file'
            });
        }

        // Get the generative model (using the exact model you specified)
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash-preview-09-2025',
            systemInstruction: systemInstruction
        });

        // Build conversation history
        let history = [];
        if (conversationHistory && Array.isArray(conversationHistory)) {
            history = conversationHistory.slice(-10); // Last 10 messages for context
        }

        // Add current user message
        history.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Start chat with history
        const chat = model.startChat({
            history: history.slice(0, -1), // All except the current message
            generationConfig: {
                maxOutputTokens: 2048,
            },
        });

        // Send the current message
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            response: text,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // Handle specific Gemini API errors
        if (error.message && error.message.includes('API key not valid')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key configuration'
            });
        }

        if (error.message && error.message.includes('quota')) {
            return res.status(429).json({
                success: false,
                error: 'API quota exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to get response from AI',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}

module.exports = {
    sendMessage
};