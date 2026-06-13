const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');

// POST /api/strategy - Generate AI marketing strategy
router.post('/', strategyController.generateStrategy);

// GET /api/strategy/sessions - Get list of past sessions
router.get('/sessions', strategyController.getSessions);

// GET /api/strategy/sessions/:id - Get specific session details
router.get('/sessions/:id', strategyController.getSessionById);

// DELETE /api/strategy/sessions/:id - Delete a specific session
router.delete('/sessions/:id', strategyController.deleteSession);

module.exports = router;
