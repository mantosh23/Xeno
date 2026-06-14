const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campaignController');

// Step 1 – Init AI session (called on campaign flow mount)
router.post('/session', ctrl.initSession);

// Step 2 – AI Strategy
router.post('/strategy', ctrl.generateStrategy);

// Step 3 – Find real audience from DB
router.post('/audience/find', ctrl.findAudience);

// Step 4 – Audience insights from DB
router.get('/audience/insights', ctrl.getAudienceInsights);

// POST /api/campaigns/content - Generate content strategy
router.post('/content', ctrl.generateContent);

// POST /api/campaigns/creatives - Generate Imagen 3 creatives
router.post('/creatives', ctrl.generateCreatives);

// POST /api/campaigns/generate-image - Generate single campaign image
router.post('/generate-image', ctrl.generateCampaignImage);

// POST /api/campaigns/personalize - Personalize content for a specific user
router.post('/personalize', ctrl.personalizeContent);

// Step 9 – Save campaign to DB
router.post('/', ctrl.saveCampaign);

// GET AI Recommendation (Fallback for Edge Function)
router.get('/recommendations', ctrl.generateRecommendation);

// Step 10 – Channel simulator
router.get('/:id/simulate', ctrl.getSimulatorEvents);

// Bonus – list all campaigns
router.get('/', ctrl.getAllCampaigns);

// Delete campaign
router.delete('/:id', ctrl.deleteCampaign);

// Get campaign specific analytics
router.get('/:id/analytics', ctrl.getCampaignAnalytics);

// Get single campaign
router.get('/:id', ctrl.getCampaignById);

// Update campaign
router.put('/:id', ctrl.updateCampaign);

module.exports = router;
