const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize');
const chatbotService = require('./chatbot.service');
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');

// Send message to chatbot
router.post('/message', authorize(), sendMessageSchema, sendMessage);

// Get chat history
router.get('/history', authorize(), getChatHistory);

// Clear chat history
router.delete('/history', authorize(), clearHistory);

module.exports = router;

function sendMessageSchema(req, res, next) {
    const schema = Joi.object({
        message: Joi.string().required().max(2000),
        conversationId: Joi.string().optional()
    });
    validateRequest(req, next, schema);
}

async function sendMessage(req, res, next) {
    try {
        const { message, conversationId } = req.body;
        const AccountId = req.user.AccountId;

        const response = await chatbotService.sendMessage({
            AccountId,
            message,
            conversationId
        });

        res.json(response);
    } catch (error) {
        next(error);
    }
}

async function getChatHistory(req, res, next) {
    try {
        const AccountId = req.user.AccountId;
        const limit = parseInt(req.query.limit) || 50;
        
        const history = await chatbotService.getChatHistory(AccountId, limit);
        res.json(history);
    } catch (error) {
        next(error);
    }
}

async function clearHistory(req, res, next) {
    try {
        const AccountId = req.user.AccountId;
        await chatbotService.clearHistory(AccountId);
        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        next(error);
    }
}