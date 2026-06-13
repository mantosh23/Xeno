const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

// POST /api/channels/send - Dispatch messages and simulate delivery
router.post('/send', channelController.sendMessages);

module.exports = router;
