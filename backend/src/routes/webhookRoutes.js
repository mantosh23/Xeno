const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// POST /api/webhook - Receive events from channel simulator
router.post('/', webhookController.handleEvent);

module.exports = router;
