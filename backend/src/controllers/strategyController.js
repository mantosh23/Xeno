const supabase = require('../config/supabase');
const { isAIAvailable, callGeminiWithSessionStream, parseAIJson, createSession, generateCreativeImage } = require('../config/gemini');
const { uploadBase64ToCloudinary } = require('../config/cloudinary');

/**
 * @function generateStrategy
 * @description Generates a marketing strategy using the Gemini AI model based on business goals and target audience. It stores the generated session in the database.
 * @param {import('express').Request} req - The Express request object containing `goal`, `targetAudience`, and `tone`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the generated strategy.
 */
exports.generateStrategy = async (req, res) => {
    try {
        const { query, sessionId: clientSessionId, displayMessage } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        if (!isAIAvailable()) {
            return res.status(503).json({ success: false, error: 'AI unavailable' });
        }

        const sessionId = clientSessionId || await createSession({ context: 'strategy-planner' });
        
        const prompt = `You are a data-driven marketing AI inside StyleHive CRM. The user is asking you something: "${query}"

Respond with a helpful, conversational reply.
If the user asks to build/find an audience, create posters/creatives, write message copy, or design an automation workflow, output a JSON block inside markdown codeblocks (e.g., \`\`\`json { ... } \`\`\`) in your response. You can include multiple actions in one JSON if the user asks for them together.
CRITICAL: The JSON must be strictly valid. Do not use unescaped newlines in strings. Do not include comments (//) inside the JSON.

CRITICAL RULE FOR CREATIVES: When a user asks for an image/poster, you MUST FIRST ask them follow-up questions about their preferences (e.g., style, color palette, mood, specific subjects) UNLESS they already provided these details. 
If you are asking a follow-up question, DO NOT output the JSON block for "creatives" yet. Only output the "creatives" JSON block AFTER the user has replied with their preferences.

JSON format:
{
  "audience": { // Only if audience requested
    "inactive_days": 60,
    "min_spend": 5000,
    "city": "Mumbai",
    "loyalty_tier": "Gold",
    "steps": [{ "day": 1, "channel": "WhatsApp", "condition": "all" }]
  },
  "creatives": { // Only if image/poster generation requested
    "campaign_name": "Name",
    "offer": "Discount",
    "creative_prompt": "Detailed prompt for the image, including vibe, colors, subject"
  },
  "content": { // Only if copy generation requested
    "channel": "WhatsApp",
    "message_copy": "The full copy of the message with placeholders like {{name}}"
  },
  "preview": { // Only if the user asks to preview or launch the final campaign
    "campaign_name": "Name",
    "channels": ["WhatsApp", "Instagram"]
  },
  "insight": { // Only if the user asks for strategic insights or data analysis
    "message": "The actionable insight sentence"
  },
  "automation": {
    "title": "Abandoned Cart Reminder",
    "description": "Waits 2 hours after cart abandonment before sending reminders.",
    "triggers": "Cart Abandoned",
    "actions": "Wait 2 hrs -> Multi-channel Ping",
    "channels": ["WhatsApp", "SMS", "Email"],
    "copies": {
      "WhatsApp": "Hey {{name}}, we noticed you left some amazing items in your cart. Grab them now before they sell out!",
      "SMS": "Hi {{name}}, your cart is waiting for you! Click here to complete checkout: {{link}}",
      "Email": "Subject: Don't miss out on your items!\\n\\nHey {{name}},\\n\\nWe saved your cart for you..."
    }
  }
}`;

        // Setup Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const { stream, saveHistory } = await callGeminiWithSessionStream(sessionId, prompt, displayMessage || query);
        
        // Initial connection message to establish session
        res.write(`data: ${JSON.stringify({ sessionId })}\n\n`);

        let fullAiResponse = '';

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            fullAiResponse += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        // We will save history at the end after generating images

        // After stream is complete, check for JSON filters
        let filters = null;
        try {
            filters = parseAIJson(fullAiResponse);
        } catch (e) {
            // No valid JSON block
        }

        // If no filters were extracted, we're done
        if (!filters) {
            await saveHistory(fullAiResponse);
            res.write(`data: [DONE]\n\n`);
            return res.end();
        }

        let metaData = {};

        const audienceFilters = filters.audience || (filters.min_spend || filters.inactive_days || filters.city || filters.loyalty_tier || filters.steps ? filters : null);

        if (audienceFilters) {
            // Fetch all customers with their completed orders
            const { data: customers, error } = await supabase
                .from('customers')
                .select('customer_id, shipping_city, loyalty_tier, orders(total_amount_paid, status, order_date)');

            if (error) throw error;

            // Apply filters in memory
            const now = new Date();
            const filteredCustomers = customers.filter(c => {
                const completedOrders = (c.orders || []).filter(o => o.status === 'Completed' || o.status === 'Shipped');
                
                if (audienceFilters.city && c.shipping_city !== audienceFilters.city) return false;
                if (audienceFilters.loyalty_tier && c.loyalty_tier !== audienceFilters.loyalty_tier) return false;
                
                const totalSpend = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount_paid || 0), 0);
                if (audienceFilters.min_spend && totalSpend < audienceFilters.min_spend) return false;
                
                if (audienceFilters.inactive_days) {
                    if (completedOrders.length === 0) return true; // Never ordered = inactive
                    const sorted = [...completedOrders].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
                    const lastOrderDate = new Date(sorted[0].order_date);
                    const daysSince = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24));
                    if (daysSince < audienceFilters.inactive_days) return false;
                }
                
                return true;
            });

            const audienceSize = filteredCustomers.length;
            let totalRevenuePool = 0;
            filteredCustomers.forEach(c => {
                const completedOrders = (c.orders || []).filter(o => o.status === 'Completed' || o.status === 'Shipped');
                const totalSpend = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount_paid || 0), 0);
                const avgSpend = completedOrders.length > 0 ? totalSpend / completedOrders.length : 850;
                totalRevenuePool += avgSpend;
            });
            const estimatedRevenue = Math.floor(totalRevenuePool * 0.15); // 15% expected conversion

            const strategyResult = {
                audienceSize,
                estimatedRevenue,
                primaryChannel: audienceFilters.steps ? audienceFilters.steps[0]?.channel : 'WhatsApp',
                steps: audienceFilters.steps || [{ day: 1, channel: 'WhatsApp', condition: 'all' }],
                filters: audienceFilters
            };

            res.write(`data: ${JSON.stringify({ result: strategyResult })}\n\n`);
        }

        if (filters.creatives) {
           // Notify frontend that image generation has started
           res.write(`data: ${JSON.stringify({ isGeneratingImages: true })}\n\n`);

           const bannerPrompt = `Professional e-commerce marketing photography for an Indian fashion brand. Campaign: "${filters.creatives.campaign_name}". Offer: "${filters.creatives.offer}". ${filters.creatives.creative_prompt}. Wide landscape banner layout, elegant styling, high fashion editorial photography, sharp focus, clean background, no text on image.`;
           const verticalPrompt = `Professional e-commerce marketing photography for an Indian fashion brand. Campaign: "${filters.creatives.campaign_name}". Offer: "${filters.creatives.offer}". ${filters.creatives.creative_prompt}. Vertical portrait layout suitable for Instagram stories, lifestyle photography, natural lighting, high fashion, no text on image.`;
           
           try {
               const [bannerBase64, verticalBase64] = await Promise.all([
                  generateCreativeImage(bannerPrompt, '16:9'),
                  generateCreativeImage(verticalPrompt, '9:16')
               ]);
               const [bannerUrl, verticalUrl] = await Promise.all([
                  uploadBase64ToCloudinary(bannerBase64),
                  uploadBase64ToCloudinary(verticalBase64)
               ]);
               metaData.creativeResult = [bannerUrl, verticalUrl];
               res.write(`data: ${JSON.stringify({ creativeResult: [bannerUrl, verticalUrl] })}\n\n`);
           } catch(err) {
               res.write(`data: ${JSON.stringify({ error: 'Failed to generate images: ' + err.message })}\n\n`);
           }
        }

        if (filters.content) {
            metaData.contentResult = filters.content;
            res.write(`data: ${JSON.stringify({ contentResult: filters.content })}\n\n`);
        }

        if (filters.preview) {
            metaData.previewResult = filters.preview;
            res.write(`data: ${JSON.stringify({ previewResult: filters.preview })}\n\n`);
        }

        if (filters.automation) {
            metaData.automationResult = filters.automation;
            res.write(`data: ${JSON.stringify({ automationResult: filters.automation })}\n\n`);
        }

        if (filters.insight) {
            metaData.insightResult = filters.insight;
            res.write(`data: ${JSON.stringify({ insightResult: filters.insight })}\n\n`);
        } else if (filters.insight === undefined && filters.message) {
            // fallback if it just returns { "insight": "..." }
            metaData.insightResult = { message: filters.message || filters.insight };
            res.write(`data: ${JSON.stringify({ insightResult: metaData.insightResult })}\n\n`);
        }

        // Save complete response to Supabase session memory, appending metadata
        if (Object.keys(metaData).length > 0) {
            fullAiResponse += `\n\n<!-- META: ${JSON.stringify(metaData)} -->`;
        }
        await saveHistory(fullAiResponse);

        res.write(`data: [DONE]\n\n`);
        res.end();

    } catch (err) {
        console.error('generateStrategy stream error:', err);
        // Only attempt to send error JSON if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Server error generating strategy stream' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Server error during stream' })}\n\n`);
            res.end();
        }
    }
};

/**
 * @function getSessions
 * @description Retrieves all previously saved strategy generation sessions from the database.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing an array of sessions.
 */
exports.getSessions = async (req, res) => {
    try {
        const { data: sessions, error } = await supabase
            .from('campaign_ai_sessions')
            .select('id, messages, created_at, updated_at')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Map list to frontend format, grabbing the first user message as the title
        const list = sessions
            .filter(session => session.messages && session.messages.length > 0)
            .map(session => {
            const firstMsg = session.messages?.find(m => m.role === 'user');
            let title = 'New Strategy Chat';
            if (firstMsg && firstMsg.parts?.[0]?.text) {
                let text = firstMsg.parts[0].text;
                // Strip the long system prompt if it exists from historical data
                const match = text.match(/based on this request: "(.*?)". Format the output/);
                if (match && match[1]) {
                    text = match[1];
                }
                title = text.substring(0, 40);
                if (text.length > 40) title += '...';
            }

            return {
                id: session.id,
                title,
                updated_at: session.updated_at
            };
        });

        res.json({ success: true, sessions: list });
    } catch (err) {
        console.error('getSessions error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
    }
};

/**
 * @function getSessionById
 * @description Retrieves a specific strategy session by its ID, including detailed recommendations and insights.
 * @param {import('express').Request} req - The Express request object. Requires `id` in params.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the session data.
 */
exports.getSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: session, error } = await supabase
            .from('campaign_ai_sessions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Map Gemini message format to Frontend format
        // Gemini: { role: 'user'|'model', parts: [{ text }] }
        // Frontend: { role: 'user'|'ai', text, data? }
        const mappedMessages = [];

        for (const msg of (session.messages || [])) {
            let text = msg.parts?.[0]?.text || '';
            const role = msg.role === 'model' ? 'ai' : 'user';
            
            // Clean up historical user messages that contain the prompt
            if (role === 'user') {
                const match = text.match(/based on this request: "(.*?)". Format the output/);
                if (match && match[1]) {
                    text = match[1];
                }
            }
            
            let data = null;
            let displayAiText = text;

            // If it's AI, check if there's embedded JSON to build the data payload
            if (role === 'ai') {
                const metaMatch = text.match(/<!-- META: (.*?) -->/);
                let meta = {};
                if (metaMatch) {
                    try {
                        meta = JSON.parse(metaMatch[1]);
                    } catch(e) {}
                }

                try {
                    const filters = parseAIJson(text);
                    if (filters) {
                        displayAiText = text.replace(/<!-- META: .*? -->/, '').replace(/```json[\s\S]*```/g, '').replace(/```json[\s\S]*/g, '').trim();
                        // For historical chats, we mock the audience size slightly or recalculate.
                        data = {
                            audienceSize: 0, 
                            estimatedRevenue: 0,
                            primaryChannel: filters.steps ? filters.steps[0]?.channel : 'WhatsApp',
                            steps: filters.steps || [{ day: 1, channel: 'WhatsApp', condition: 'all' }],
                            filters
                        };
                    }
                } catch (e) {
                    // No valid JSON block
                }

                mappedMessages.push({
                    role,
                    text: displayAiText,
                    data,
                    creativeResult: meta.creativeResult,
                    contentResult: meta.contentResult,
                    previewResult: meta.previewResult,
                    insightResult: meta.insightResult,
                    automationResult: meta.automationResult
                });
            } else {
                mappedMessages.push({
                    role,
                    text: displayAiText,
                    data
                });
            }
        }

        res.json({ success: true, messages: mappedMessages });

    } catch (err) {
        console.error('getSessionById error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch session details' });
    }
};

/**
 * @function deleteSession
 * @description Deletes a specific strategy session from the database by its ID.
 * @param {import('express').Request} req - The Express request object. Requires `id` in params.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response confirming deletion.
 */
exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('campaign_ai_sessions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (err) {
        console.error('deleteSession error:', err);
        res.status(500).json({ success: false, error: 'Failed to delete session' });
    }
};
