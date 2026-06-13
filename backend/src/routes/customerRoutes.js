const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET /api/customers/stats - Fetch basic KPI stats
router.get('/stats', customerController.getCustomerStats);

// POST /api/customers/ai-filter - Parse natural language to filters
router.post('/ai-filter', customerController.parseAIFilter);

// GET /api/customers/export - Export customers as CSV
router.get('/export', customerController.exportCustomers);

// GET /api/customers - Fetch a list of customers
router.get('/', customerController.getAllCustomers);

// GET /api/customers/:id - Fetch a structured customer profile (Advanced CRM Skill)
router.get('/:id', customerController.getCustomerById);

module.exports = router;
