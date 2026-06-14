// This service mocks an external messaging channel provider (e.g. Twilio, SendGrid)
// It exposes a dispatch API which receives a payload of what to send,
// and asynchronously posts callbacks to our CRM webhook API with delivery outcomes.

exports.dispatchCampaign = async (campaignId, dbEventsToInsert) => {
    console.log(`[StubChannelService] Received request to dispatch ${dbEventsToInsert.length} messages for campaign ${campaignId}.`);
    
    // Simulating external network / provider processing time...
    
    if (dbEventsToInsert.length <= 50) {
        // Slow organic pulse: send events individually to the webhook
        (async () => {
            const port = process.env.PORT || 3001;
            for (const event of dbEventsToInsert) {
                // Wait 300ms to 1200ms between each event to feel organic
                await new Promise(r => setTimeout(r, Math.floor(Math.random() * 900) + 300));
                
                event.event_time = new Date().toISOString();
                try {
                    await fetch(`http://127.0.0.1:${port}/api/webhook/bulk`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ events: [event] })
                    });
                } catch (e) {
                    console.warn('[StubChannelService] Failed to post webhook event:', e.message);
                }
            }
        })();
    } else {
        // Fast flood for large amounts: post in batches to the webhook
        const port = process.env.PORT || 3001;
        const now = new Date();
        const batchSize = 1000;
        
        for (let i = 0; i < dbEventsToInsert.length; i += batchSize) {
            const batch = dbEventsToInsert.slice(i, i + batchSize).map((e, index) => {
                let daysAgo = 0;
                if (index % 3 !== 0) daysAgo = Math.floor(Math.random() * 7);
                const pastDate = new Date(now);
                pastDate.setDate(now.getDate() - daysAgo);
                pastDate.setHours(now.getHours() - Math.floor(Math.random() * 24));
                e.event_time = pastDate.toISOString();
                return e;
            });
            
            try {
                const res = await fetch(`http://127.0.0.1:${port}/api/webhook/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: batch })
                });
                if (!res.ok) {
                    console.warn('[StubChannelService] Bulk webhook rejected with status:', res.status);
                }
            } catch (e) {
                console.warn('[StubChannelService] Bulk webhook post failed:', e.message);
            }
        }
        console.log(`[StubChannelService] Completed asynchronous callback loop for ${dbEventsToInsert.length} events.`);
    }
};
