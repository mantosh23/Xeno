const supabase = require('../config/supabase');

/**
 * @function handleEvent
 * @description Ingests real-time webhook events (delivered, opened, clicked, converted) and logs them into the database.
 * @param {import('express').Request} req - The Express request object containing `event`, `campaignId`, `userId`, `channel`, and `timestamp`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response acknowledging successful event logging.
 */
exports.handleEvent = async (req, res) => {
    try {
        const { event, campaignId, userId, channel, timestamp } = req.body;
        
        console.log(`🔔 [Webhook] Event received: '${event}' for User ${userId} via ${channel} on Campaign ${campaignId}`);

        // Insert into engagements table
        await supabase.from('engagements').insert({ campaign_id: campaignId, user_id: userId, event_type: event, channel, event_time: timestamp });

        res.status(200).json({ success: true, message: 'Event logged successfully' });
    } catch (e) {
        console.error('[Webhook Error]', e.message);
        res.status(500).json({ success: false, error: e.message });
    }
};
