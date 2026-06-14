const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');

const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, 
    message: { success: false, error: 'AI generation limit reached. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/strategy - Generate AI marketing strategy
router.post('/', aiLimiter, strategyController.generateStrategy);

// GET /api/strategy/sessions - Get list of past sessions
router.get('/sessions', strategyController.getSessions);

// GET /api/strategy/sessions/:id - Get specific session details
router.get('/sessions/:id', strategyController.getSessionById);

// DELETE /api/strategy/sessions/:id - Delete a specific session
router.delete('/sessions/:id', strategyController.deleteSession);

module.exports = router;
