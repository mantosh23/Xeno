/**
 * @function sendMessages
 * @description Simulates the asynchronous dispatch of messages to an audience across a specific channel. It accepts the job, returns 202, and then simulates delivery and engagement events using a webhook.
 * @param {import('express').Request} req - The Express request object containing `campaignId`, `channel`, `audienceIds`, and `content`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response acknowledging the job dispatch.
 */
exports.sendMessages = async (req, res) => {
    try {
        const { campaignId, channel, audienceIds = [], content } = req.body;
        
        if (!campaignId || !channel) {
            return res.status(400).json({ success: false, error: 'campaignId and channel are required' });
        }

        // Return 202 Accepted immediately
        res.status(202).json({ success: true, message: 'Message dispatch job accepted. Delivery simulation started.' });
        
        // Asynchronously process the dispatch
        setImmediate(async () => {
            const webhookUrl = `http://localhost:${process.env.PORT || 3001}/api/webhook`;
            console.log(`[Simulator] Starting simulation for campaign ${campaignId} to ${audienceIds.length} users`);
            
            // Emulate an external service callback
            const emitWebhook = async (event, userId) => {
                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event, campaignId, userId, channel, timestamp: new Date() })
                    });
                } catch (e) {
                    console.error(`[Simulator Error] Failed to hit webhook: ${e.message}`);
                }
            };

            for (const userId of audienceIds) {
                // 1. Delivered event (after 1-2s)
                setTimeout(() => {
                    emitWebhook('delivered', userId);
                }, 1000 + Math.random() * 1000);
                
                // 2. Opened event (50% chance, after 3-5s)
                if (Math.random() > 0.5) {
                    setTimeout(() => {
                        emitWebhook('opened', userId);
                        
                        // 3. Clicked event (30% chance if opened, after 6-8s)
                        if (Math.random() > 0.7) {
                            setTimeout(() => {
                                emitWebhook('clicked', userId);
                                
                                // 4. Converted event (10% chance if clicked, after 10-12s)
                                if (Math.random() > 0.9) {
                                    setTimeout(() => {
                                        emitWebhook('converted', userId);
                                    }, 10000 + Math.random() * 2000);
                                }
                            }, 6000 + Math.random() * 2000);
                        }
                    }, 3000 + Math.random() * 2000);
                }
            }
        });
    } catch (e) {
        if (!res.headersSent) res.status(500).json({ success: false, error: e.message });
    }
};
