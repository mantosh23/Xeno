const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');

router.get('/', automationController.getAllAutomations);
router.post('/', automationController.createAutomation);
router.put('/:id/toggle', automationController.toggleAutomationStatus);
router.put('/:id', automationController.updateAutomation);
router.delete('/:id', automationController.deleteAutomation);

module.exports = router;
