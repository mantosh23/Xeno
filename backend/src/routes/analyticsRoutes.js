const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');

// GET /api/analytics/dashboard
router.get('/dashboard', ctrl.getDashboardData);

// POST /api/analytics/chat
router.post('/chat', ctrl.chatInsights);

module.exports = router;
