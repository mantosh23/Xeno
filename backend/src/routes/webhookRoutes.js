const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// POST /api/webhook - Receive events from channel simulator
router.post('/', webhookController.handleEvent);

// POST /api/webhook/bulk - Receive batch events from channel simulator
router.post('/bulk', webhookController.handleBulkEvents);

module.exports = router;
