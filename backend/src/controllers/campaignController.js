const supabase = require('../config/supabase');
const { isAIAvailable, callGeminiWithSession, parseAIJson, createSession, generateCreativeImage } = require('../config/gemini');
const { uploadBase64ToCloudinary } = require('../config/cloudinary');
const stubChannelService = require('../services/stubChannelService');

// ─── Helper: Aggregate real DB-level stats ────────────────────────────────
const getRealDBStats = async () => {
  const [custRes, ordersRes] = await Promise.all([
    supabase.from('customers').select('customer_id, shipping_city, loyalty_tier, date_of_birth'),
    supabase.from('orders').select('total_amount_paid, status, order_date'),
  ]);

  const customers = custRes.data || [];
  const orders = ordersRes.data || [];
  const completed = orders.filter(o => o.status === 'Completed' || o.status === 'Shipped');
  const totalRevenue = completed.reduce((s, o) => s + parseFloat(o.total_amount_paid || 0), 0);
  const avgOrderValue = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

  // City breakdown
  const cityMap = {};
  customers.forEach(c => { if (c.shipping_city) cityMap[c.shipping_city] = (cityMap[c.shipping_city] || 0) + 1; });
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([city, count]) => `${city} (${count} customers)`);

  // Loyalty breakdown
  const tierMap = {};
  customers.forEach(c => { tierMap[c.loyalty_tier] = (tierMap[c.loyalty_tier] || 0) + 1; });

  // Recency: customers with no order in 60+ days
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
  const recentOrderers = new Set(
    orders.filter(o => new Date(o.order_date) > cutoff).map(o => o.customer_id)
  );
  const inactiveCount = customers.filter(c => !recentOrderers.has(c.customer_id)).length;

  return {
    totalCustomers: customers.length,
    totalOrders: orders.length,
    completedOrders: completed.length,
    avgOrderValue,
    totalRevenue: Math.round(totalRevenue),
    topCities,
    loyaltyBreakdown: tierMap,
    inactiveCount,
  };
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns/session  →  Init a new AI conversation session
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function initSession
 * @description Initializes a new interactive campaign generation session with the AI.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response with the new session ID.
 */
exports.initSession = async (req, res) => {
  try {
    if (!isAIAvailable()) {
      return res.status(503).json({ success: false, error: 'Gemini AI not configured. Add GEMINI_API_KEY to backend/.env' });
    }
    const sessionId = await createSession({ started_at: new Date().toISOString() });
    res.json({ success: true, session_id: sessionId });
  } catch (err) {
    console.error('initSession error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns/strategy  →  Step 2: AI Strategy
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function generateStrategy
 * @description Generates a high-level marketing strategy (channels, tone, budget) for the campaign using Gemini AI.
 * @param {import('express').Request} req - The Express request object containing `goal` and `product`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the generated strategy.
 */
exports.generateStrategy = async (req, res) => {
  const { goal, session_id } = req.body;
  if (!goal) return res.status(400).json({ success: false, error: 'goal is required' });
  if (!session_id) return res.status(400).json({ success: false, error: 'session_id is required' });

  try {
    // Inject real DB context into the first prompt
    const stats = await getRealDBStats();

    const prompt = `The merchant's marketing goal: "${goal}"

Real data from the StyleHive customer database right now:
- Total customers: ${stats.totalCustomers.toLocaleString('en-IN')}
- Completed/shipped orders: ${stats.completedOrders.toLocaleString('en-IN')}
- Average order value: ₹${stats.avgOrderValue.toLocaleString('en-IN')}
- Total revenue in DB: ₹${stats.totalRevenue.toLocaleString('en-IN')}
- Customers inactive 60+ days: ${stats.inactiveCount.toLocaleString('en-IN')} out of ${stats.totalCustomers.toLocaleString('en-IN')}
- Top cities: ${stats.topCities.join(' | ')}
- Loyalty tiers: ${JSON.stringify(stats.loyaltyBreakdown)}

Using this exact data, generate a precise campaign strategy.
(Note: All campaigns MUST be strictly focused on fashion marketing and apparel/clothing/accessories only.)
Return ONLY JSON wrapped in a markdown \`\`\`json block:
{
  "target_audience_description": "specific 1-line description referencing the real data above",
  "estimated_inactive_days": <number: days of inactivity that define this audience>,
  "estimated_size": <number: realistic count based on the ${stats.inactiveCount} inactive customers>,
  "potential_revenue": <number in INR: realistic estimate using avg order value ₹${stats.avgOrderValue}>,
  "recommended_offer": "specific compelling offer matching the goal",
  "recommended_channels": ["WhatsApp","Instagram","Email","Facebook","SMS"],
  "campaign_name": "creative, specific campaign name (max 5 words)",
  "reasoning": "2 sentences citing the specific numbers from the database above",
  "content_ideas": {
    "Email": "Subject: We miss you! \\n\\nBody...",
    "WhatsApp": "Hi there! We miss you..."
  }
}
The "content_ideas" object must contain the exact message copy tailored for each of the selected channels to be sent at once as a single blast.`;

    const cleanMsg = `Goal: ${goal}`;
    const text = await callGeminiWithSession(session_id, prompt, cleanMsg);
    const strategy = parseAIJson(text);
    res.json({ success: true, strategy });
  } catch (err) {
    console.error('generateStrategy error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns/audience/find  →  Step 3: Real DB Audience Search
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function findAudience
 * @description Identifies target audience segments for the campaign based on the strategy and historical CRM data.
 * @param {import('express').Request} req - The Express request object containing `strategy` context.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response with recommended audience segments.
 */
exports.findAudience = async (req, res) => {
  const { inactive_days = 60, min_spend = 0, age_min = 0, age_max = 100, session_id } = req.body;

  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        customer_id, first_name, last_name, email,
        shipping_city, date_of_birth, loyalty_tier,
        orders(order_id, order_date, total_amount_paid, status)
      `);
    if (error) throw error;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - inactive_days);
    const now = new Date();

    const matched = customers.filter(c => {
      const orders = c.orders || [];
      if (orders.length === 0) return false;
      const sorted = [...orders].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      if (new Date(sorted[0].order_date) > cutoff) return false;
      const spend = orders.filter(o => o.status === 'Completed' || o.status === 'Shipped')
        .reduce((s, o) => s + parseFloat(o.total_amount_paid || 0), 0);
      if (spend < min_spend) return false;
      if (c.date_of_birth) {
        const age = now.getFullYear() - new Date(c.date_of_birth).getFullYear();
        if (age < age_min || age > age_max) return false;
      }
      return true;
    });

    const customer_ids = matched.map(c => c.customer_id);
    const totalOrders = matched.reduce((sum, c) => 
      sum + (c.orders || []).filter(o => o.status === 'Completed' || o.status === 'Shipped').length, 0
    );
    const totalHistoricSpend = matched.reduce((sum, c) =>
      sum + (c.orders || []).filter(o => o.status === 'Completed' || o.status === 'Shipped')
        .reduce((s, o) => s + parseFloat(o.total_amount_paid || 0), 0), 0
    );
    
    // Solid CRM Logic: Potential Revenue = Average Order Value (AOV) * Audience Size * Expected Conversion Rate (e.g. 5%)
    const aov = totalOrders > 0 ? totalHistoricSpend / totalOrders : 0;
    const expectedConversionRate = 0.05;
    const potential_revenue = Math.round(matched.length * aov * expectedConversionRate);

    // Real city distribution of matched audience
    const cityDist = {};
    matched.forEach(c => { if (c.shipping_city) cityDist[c.shipping_city] = (cityDist[c.shipping_city] || 0) + 1; });
    const topCitySummary = Object.entries(cityDist).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([city, count]) => `${city}: ${count} customers`).join(', ');

    const tierDist = {};
    matched.forEach(c => { tierDist[c.loyalty_tier] = (tierDist[c.loyalty_tier] || 0) + 1; });

    const sample_customers = matched.slice(0, 8).map(c => ({
      id: c.customer_id,
      name: `${c.first_name} ${c.last_name}`,
      city: c.shipping_city,
      email: c.email,
      loyalty_tier: c.loyalty_tier,
    }));

    // Feed real audience data into the AI session as context (non-blocking)
    if (session_id && isAIAvailable()) {
      const contextMsg = `Update: I've found the target audience from my database.
Real results (inactive > ${inactive_days} days, min spend ₹${min_spend}):
- Matched: ${matched.length} customers (out of ${customers.length} total)
- Their historical spend total: ₹${Math.round(totalHistoricSpend).toLocaleString('en-IN')} (Average Order Value: ₹${Math.round(aov).toLocaleString('en-IN')})
- Potential campaign revenue (assuming 5% conversion at AOV): ₹${potential_revenue.toLocaleString('en-IN')}
- City distribution: ${topCitySummary}
- Loyalty tier mix: ${JSON.stringify(tierDist)}

Please acknowledge and keep this for later steps.
Return ONLY: { "acknowledged": true, "summary": "one sentence about this audience" }`;

      callGeminiWithSession(session_id, contextMsg, "I found an audience. I will proceed with generating insights.").catch(err =>
        console.warn('Audience context save warn:', err.message)
      );
    }

    res.json({ success: true, customer_ids, count: matched.length, potential_revenue, sample_customers });
  } catch (err) {
    console.error('findAudience error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/campaigns/audience/insights  →  Step 4: Real DB Insights + AI Insight
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function getAudienceInsights
 * @description Retrieves detailed insights, behaviors, and statistics for a specific segment of the selected audience.
 * @param {import('express').Request} req - The Express request object containing the `segment`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response with segment insights.
 */
exports.getAudienceInsights = async (req, res) => {
  const { ids, session_id } = req.query;
  const customer_ids = ids ? ids.split(',').map(Number).filter(Boolean) : [];

  try {
    const query = supabase
      .from('customers')
      .select(`
        customer_id, shipping_city, date_of_birth, loyalty_tier, preferred_color_palette,
        orders(order_items(product_variants(products(categories(name)))))
      `);
    if (customer_ids.length > 0) query.in('customer_id', customer_ids);
    const { data: customers, error } = await query;
    if (error) throw error;

    const total = customers.length || 1;

    // Real city breakdown
    const cityMap = {};
    customers.forEach(c => { if (c.shipping_city) cityMap[c.shipping_city] = (cityMap[c.shipping_city] || 0) + 1; });
    const top_cities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([city, count]) => ({ city, percentage: Math.round((count / total) * 100) }));

    // Real category breakdown
    const catMap = {};
    customers.forEach(c =>
      (c.orders || []).forEach(o =>
        (o.order_items || []).forEach(i => {
          const cat = i?.product_variants?.products?.categories?.name;
          if (cat) catMap[cat] = (catMap[cat] || 0) + 1;
        })
      )
    );
    const catTotal = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
    const top_categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => `${name} (${Math.round((count / catTotal) * 100)}%)`);

    // Real age group breakdown
    const now = new Date();
    const ageBuckets = { '18–25': 0, '26–35': 0, '36–45': 0, '46+': 0 };
    customers.forEach(c => {
      if (!c.date_of_birth) return;
      const age = now.getFullYear() - new Date(c.date_of_birth).getFullYear();
      if (age <= 25) ageBuckets['18–25']++;
      else if (age <= 35) ageBuckets['26–35']++;
      else if (age <= 45) ageBuckets['36–45']++;
      else ageBuckets['46+']++;
    });
    const topAgeEntry = Object.entries(ageBuckets).sort((a, b) => b[1] - a[1])[0];
    const topAgeGroup = topAgeEntry[0];
    const youngPct = Math.round((topAgeEntry[1] / total) * 100);

    // AI-generated actionable insight using session context + real data
    let ai_insight = `${total.toLocaleString('en-IN')} customers across ${top_cities.length} cities with highest concentration in ${top_cities[0]?.city || 'metro areas'}.`;

    if (session_id && isAIAvailable()) {
      try {
        const insightPrompt = `Here are the complete real insights for our campaign audience (${total} customers):

City breakdown: ${top_cities.map(c => `${c.city} ${c.percentage}%`).join(', ')}
Top product categories: ${top_categories.join(' | ')}
Age groups: ${Object.entries(ageBuckets).map(([g, n]) => `${g}: ${Math.round((n/total)*100)}%`).join(', ')}

Based on this data AND our campaign goal and strategy from earlier in our conversation, give me ONE highly specific, actionable insight that will make this campaign significantly more effective.

Return ONLY valid JSON: { "insight": "one powerful sentence" }`;

        const cleanMsg = `Give me an insight.`;
        const text = await callGeminiWithSession(session_id, insightPrompt, cleanMsg);
        const parsed = parseAIJson(text);
        ai_insight = parsed.insight;
      } catch (aiErr) {
        console.warn('AI insight fallback:', aiErr.message);
      }
    }

    res.json({
      success: true,
      insights: {
        demographics: { top_age_group: topAgeGroup, young_pct: youngPct },
        top_cities: top_cities.length > 0 ? top_cities : [{ city: 'Mumbai', percentage: 35 }],
        top_categories: top_categories.length > 0 ? top_categories : ['Fashion (100%)'],

        ai_insight,
        age_buckets: ageBuckets,
      },
    });
  } catch (err) {
    console.error('getAudienceInsights error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns/content  →  Step 5: AI Channel Content (session-aware)
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function generateContent
 * @description Automatically writes copy and textual content for the campaign across various selected channels.
 * @param {import('express').Request} req - The Express request object containing `campaignId`, `channels`, and `tone`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the generated content mapped by channel.
 */
exports.generateContent = async (req, res) => {
  const { channel, offer, session_id, prompt_context } = req.body;
  if (!channel) return res.status(400).json({ success: false, error: 'channel is required' });
  if (!session_id) return res.status(400).json({ success: false, error: 'session_id is required' });

  try {
    // Attempt Gemini call
    let content;
    try {
      const prompt = `Now generate the ${channel} marketing message for our campaign.
The offer: "${offer || 'as you recommended in the strategy'}"
${prompt_context ? `\nUSER SPECIFIC INSTRUCTION: ${prompt_context}` : ''}

Draw from everything in our conversation: the merchant's goal, the audience size and cities, the category insights, and your strategy recommendations.
The message must feel authentic to this specific audience — not generic.

Return ONLY valid JSON (no markdown):
{
  "message": "the complete ${channel} message — use {{name}} for personalization, reference specific details from our audience data, be compelling and concise (4-6 lines)",
  "why_it_works": [
    "specific reason 1 tied to our actual audience data",
    "specific reason 2 tied to channel effectiveness",
    "specific reason 3 tied to the offer strategy"
  ],
  "expected_open_rate": <realistic integer for ${channel} with this audience type, no % sign>,
  "expected_click_rate": <realistic integer>,
  "expected_conversion_rate": <realistic decimal e.g. 3.8>
}`;
      const cleanMsg = `Provide content for channel: ${channel}`;
      const text = await callGeminiWithSession(session_id, prompt, cleanMsg);
      content = parseAIJson(text);
    } catch (aiErr) {
      console.warn("AI content failed, using requested fallback", aiErr.message);
      content = {
        message: "Hi {{name}}! 👋 We've missed you at StyleHive. Rediscover your unique style with an exclusive 15% off your next order, valid for just 7 days! Perfect for upgrading your Loungewear, Blouses, or finding that ideal Coat. Shop now: stylehive.com",
        why_it_works: [
          "The message directly references top product categories (Loungewear, Blouses, Coats) identified in the audience insights, making the offer highly relevant to their demonstrated interests and increasing perceived value.",
          "WhatsApp's direct, personal, and instant nature ensures high visibility and immediate engagement, bypassing common email fatigue and leveraging a preferred communication channel for a significant portion of the 26-45 age group.",
          "The '15% Off' offer combined with a clear 7-day validity creates a strong sense of urgency and a compelling financial incentive for previously active customers to return and make a purchase, addressing the 'inactive' status."
        ],
        expected_open_rate: 68,
        expected_click_rate: 22,
        expected_conversion_rate: 4.5
      };
    }
    
    res.json({ success: true, content });
  } catch (err) {
    console.error('generateContent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns/creatives  →  Step 6: AI Generated Images via Gemini 2.5
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function generateCreatives
 * @description Uses AI image generation models to produce creative visual assets for the campaign based on a prompt.
 * @param {import('express').Request} req - The Express request object containing `prompt` and `style`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing URLs of the generated images.
 */
exports.generateCreatives = async (req, res) => {
  const { session_id, offer, prompt_context, campaign_name, top_category } = req.body;

  if (!session_id) return res.status(400).json({ success: false, error: 'session_id is required' });

  try {
    const basePrompt = `Professional e-commerce marketing photography for an Indian fashion brand named StyleHive. Campaign name: "${campaign_name || 'Sale'}". Offer: "${offer || 'Discount'}". Main category: "${top_category || 'Apparel'}". MUST STRICTLY BE A FASHION MARKETING CAMPAIGN FEATURING CLOTHING OR APPAREL. ${prompt_context || ''}`;

    const squarePrompt = `${basePrompt} Square 1:1 layout, perfect for feed ads, elegant styling, high fashion editorial photography, sharp focus, clean background, centralized focus, symmetry, no text on image.`;
    const verticalPrompt = `${basePrompt} Vertical portrait layout suitable for Instagram stories, lifestyle photography, natural lighting, high fashion, no text on image.`;

    const [squareBase64, verticalBase64] = await Promise.all([
      generateCreativeImage(squarePrompt, '1:1'),
      generateCreativeImage(verticalPrompt, '9:16')
    ]);

    const [squareUrl, verticalUrl] = await Promise.all([
      uploadBase64ToCloudinary(squareBase64),
      uploadBase64ToCloudinary(verticalBase64)
    ]);

    return res.json({
      success: true,
      creatives: [squareUrl, verticalUrl],
      source: 'gemini_generated_cloudinary',
      model: 'imagen-4.0-generate-001',
    });

  } catch (err) {
    console.error('generateCreatives error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns/personalize  →  Step 7: AI Personalization (session-aware + real DB customer)
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function personalizeContent
 * @description Dynamically alters base content to make it highly personalized for specific customer segments.
 * @param {import('express').Request} req - The Express request object containing `baseContent` and `segmentProfile`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response with the personalized variants.
 */
exports.personalizeContent = async (req, res) => {
  const { template, customer, session_id } = req.body;
  if (!template || !customer) return res.status(400).json({ success: false, error: 'template and customer required' });
  if (!session_id) return res.status(400).json({ success: false, error: 'session_id required' });

  try {
    // Fetch rich real data for this specific customer from DB
    let richData = { ...customer };
    try {
      const { data: dbCustomer } = await supabase
        .from('customers')
        .select(`
          customer_id, first_name, last_name, shipping_city, loyalty_tier,
          preferred_color_palette, size_preference_top, size_preference_bottom,
          orders(order_date, total_amount_paid, status,
            order_items(price_at_purchase, product_variants(products(name, categories(name))))
          )
        `)
        .eq('customer_id', customer.id)
        .single();

      if (dbCustomer) {
        const orders = dbCustomer.orders || [];
        const completed = orders.filter(o => o.status === 'Completed' || o.status === 'Shipped');
        const ltv = completed.reduce((s, o) => s + parseFloat(o.total_amount_paid || 0), 0);

        const cats = new Set();
        const prods = [];
        orders.forEach(o => (o.order_items || []).forEach(i => {
          const cat = i?.product_variants?.products?.categories?.name;
          const prod = i?.product_variants?.products?.name;
          if (cat) cats.add(cat);
          if (prod) prods.push(prod);
        }));

        const sortedOrders = [...orders].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        const lastOrderDate = sortedOrders[0]?.order_date;
        const daysSincePurchase = lastOrderDate
          ? Math.floor((Date.now() - new Date(lastOrderDate)) / (1000 * 60 * 60 * 24))
          : null;

        richData = {
          ...customer,
          first_name: dbCustomer.first_name,
          loyalty_tier: dbCustomer.loyalty_tier,
          color_palette: dbCustomer.preferred_color_palette,
          top_size: dbCustomer.size_preference_top,
          lifetime_value: Math.round(ltv),
          total_orders: completed.length,
          top_categories: [...cats].slice(0, 3),
          last_products: prods.slice(0, 3),
          days_since_purchase: daysSincePurchase,
        };
      }
    } catch (dbErr) {
      console.warn('Rich customer data fetch warn:', dbErr.message);
    }

    const prompt = `Personalize this marketing message for a specific customer using their real database profile.

Template to personalize:
"${template}"

Customer's real profile from StyleHive database:
- Name: ${richData.first_name || richData.name}
- City: ${richData.city}
- Loyalty tier: ${richData.loyalty_tier || 'Standard'}
- Lifetime value: ₹${(richData.lifetime_value || 0).toLocaleString('en-IN')}
- Total orders placed: ${richData.total_orders || 'N/A'}
- Days since last purchase: ${richData.days_since_purchase || 'unknown'}
- Preferred colors: ${richData.color_palette || 'not specified'}
- Top categories bought: ${(richData.top_categories || []).join(', ') || 'fashion'}
- Recent products: ${(richData.last_products || []).join(', ') || 'N/A'}
- Top size: ${richData.top_size || 'N/A'}

Using our full campaign conversation context AND this customer's specific data, write a message that:
1. Replaces {{name}} with their first name
2. Subtly references their purchase history or preferences
3. Makes the offer feel personally curated for them
4. Is warm, not salesy

Return ONLY valid JSON: { "personalized_message": "the personalized message" }`;

    const cleanMsg = `Generate creatives.`;
    const text = await callGeminiWithSession(session_id, prompt, cleanMsg);
    const parsed = parseAIJson(text);
    res.json({ success: true, personalized_message: parsed.personalized_message });
  } catch (err) {
    console.error('personalizeContent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns  →  Step 9: Save Campaign to Supabase DB
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function saveCampaign
 * @description Finalizes and saves a completely configured campaign to the Supabase database.
 * @param {import('express').Request} req - The Express request object containing all campaign fields.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the saved campaign ID.
 */
exports.saveCampaign = async (req, res) => {
  const { name, goal, audience_size, potential_revenue, offer, channels, strategy, session_id } = req.body;

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        name: name || 'Untitled Campaign',
        goal: goal || '',
        audience_size: audience_size || 0,
        potential_revenue: potential_revenue || 0,
        offer: offer || '',
        channels: channels || [],
        strategy: { ...strategy, session_id },
        status: 'Draft',
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') return res.status(500).json({ success: false, error: 'campaigns table missing. Run backend/models/campaigns.sql in Supabase.' });
      throw error;
    }

    res.status(201).json({ success: true, campaign: data });
  } catch (err) {
    console.error('saveCampaign error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/campaigns/:id  →  Update Campaign details
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function updateCampaign
 * @description Updates standard campaign details (name, goal, offer, status)
 */
exports.updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { name, goal, offer, status } = req.body;

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ name, goal, offer, status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, campaign: data });
  } catch (err) {
    console.error('updateCampaign error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/campaigns/:id/simulate  →  Step 10: Simulator with real names
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function getSimulatorEvents
 * @description Retrieves a stream of synthetic engagement events (simulated delivery, opens, clicks) for testing purposes.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing a list of simulated events.
 */
exports.getSimulatorEvents = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', id).single();
    const channels = campaign?.channels || ['WhatsApp', 'Instagram', 'Email'];
    const audience_size = campaign?.audience_size || 0;
    const countParam = parseInt(req.query.count);
    const eventCount = countParam > 0 ? countParam : (audience_size > 0 ? Math.min(audience_size, 50) : 35);

    // Update status to Active now that it's "launched" and simulating sending
    await supabase.from('campaigns').update({ status: 'Active' }).eq('id', id);

    const { data: realCustomers } = await supabase
      .from('customers')
      .select('customer_id, first_name, last_name, shipping_city')
      .limit(eventCount);

    const customersList = realCustomers?.length ? realCustomers : [{ customer_id: 1, first_name: 'Ananya', last_name: 'Sharma' }];

    const eventTypes = ['Delivered', 'Opened', 'Clicked', 'Purchased', 'Viewed'];

    const dbEventsToInsert = [];
    
    const events = Array.from({ length: eventCount }, (_, i) => {
      const now = new Date();
      // Generate initial mock events for the console response if needed
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      
      const cust = customersList[i % customersList.length];
      const ch = channels[i % channels.length];
      const ev = eventTypes[i % eventTypes.length];
      
      dbEventsToInsert.push({
        campaign_id: id,
        user_id: cust.customer_id,
        event_type: ev,
        channel: ch
        // event_time will be set exactly when inserted
      });

      return {
        time: `${hh}:${mm}:${ss}`,
        channel: ch,
        event: ev,
        customer: `${cust.first_name} ${cust.last_name}`,
      };
    });

    // Actually insert the simulated events into the db organically so the analytics dashboard pulses!
    if (dbEventsToInsert.length > 0) {
      if (dbEventsToInsert.length <= 50) {
        // Slow organic pulse
        (async () => {
          for (const event of dbEventsToInsert) {
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 900) + 300));
            event.event_time = new Date().toISOString();
            await supabase.from('engagements').insert(event);
          }
        })();
      } else {
        // Fast flood for large amounts
        const batchSize = 1000;
        (async () => {
          for (let i = 0; i < dbEventsToInsert.length; i += batchSize) {
            const batch = dbEventsToInsert.slice(i, i + batchSize);
            batch.forEach(e => e.event_time = new Date().toISOString());
            await supabase.from('engagements').insert(batch);
          }
        })();
      }
    }

    const channel_status = {};
    channels.forEach(ch => { 
      // Base realistic open/delivery rates rather than pure arbitrary randomness
      let baseRate = 50;
      if (ch.includes('WhatsApp')) baseRate = 85;
      else if (ch.includes('Email')) baseRate = 45;
      else if (ch.includes('Instagram')) baseRate = 60;
      else if (ch.includes('SMS')) baseRate = 95;
      else if (ch.includes('Facebook')) baseRate = 55;
      
      // Add slight variance (+/- 5%) to feel organic
      channel_status[ch] = Math.min(100, Math.max(0, baseRate + (Math.floor(Math.random() * 10) - 5))); 
    });

    res.json({ success: true, events, channel_status, campaign_name: campaign?.name });
  } catch (err) {
    console.error('simulator error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/campaigns/recommendations → Fetch AI recommendation
/**
 * @function generateRecommendation
 * @description Asks the AI for strategic recommendations on improving or pivoting a specific campaign draft.
 * @param {import('express').Request} req - The Express request object containing the current `draft`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response with actionable AI recommendations.
 */
exports.generateRecommendation = async (req, res) => {
  try {
    const prompt = `You are an elite AI Marketing Strategist. 
Analyze retail data and suggest ONE high-converting retention campaign recommendation for inactive users.
Return ONLY valid JSON in this exact structure:
{
  "name": "Campaign Name",
  "goal": "Re-engage users inactive for 60+ days",
  "audience_type": "Inactive",
  "channels": ["Email", "WhatsApp"],
  "strategy": {
    "summary": "Short explanation of the angle",
    "content_ideas": {
      "Email": "Subject: We miss you! \\n\\nBody...",
      "WhatsApp": "Hi there! We miss you..."
    }
  }
}`;

    const { GoogleGenerativeAI } = require("@google/genai");
    // Fallback to older gemini REST api if genai SDK is not working easily
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const strategyJSON = parseAIJson(resultText);

    // Insert as Recommended
    const { data: inserted, error } = await supabase
      .from('campaigns')
      .insert({
        name: strategyJSON.name,
        goal: strategyJSON.goal,
        channels: strategyJSON.channels,
        strategy: strategyJSON.strategy,
        status: 'Recommended'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, campaign: inserted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/campaigns  →  List all saved campaigns
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function getAllCampaigns
 * @description Fetches all campaigns from the database, ordered by creation date.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the array of campaigns.
 */
exports.getAllCampaigns = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 19); // Pagination not implemented for this scope, fetching first 20 for demo
    if (error) throw error;
    res.json({ success: true, campaigns: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/campaigns/generate-image  →  Generate Single Campaign Image
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function generateCampaignImage
 * @description Proxies the request to an image generation service specifically tailored for campaign banners and emails.
 * @param {import('express').Request} req - The Express request object containing `description` and `dimensions`.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the generated image URL.
 */
exports.generateCampaignImage = async (req, res) => {
  const { campaign_name, offer, top_category, session_id, prompt } = req.body;

  try {
    const { GoogleGenAI } = require('@google/genai');
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Gemini ko clearly bolna hai — generate karo, fetch mat karo
    const imagePrompt = prompt || `Premium Indian fashion campaign poster. Stylish urban Indian model aged 20-35, deep purple and white studio backdrop, editorial magazine quality, empty bottom 25% for text overlay, no text no logos no watermarks, square 1:1 format, hyperrealistic photography.`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ 
        role: 'user', 
        parts: [{ text: imagePrompt }] 
      }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Image extract karo response se
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return res.json({
          success: true,
          image_url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          source: 'gemini_generated',   // ← proof ke liye
          model: 'gemini-2.5-flash-image',
        });
      }
    }

    throw new Error('Gemini did not generate an image');

  } catch (err) {
    console.error('Image generation error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/campaigns/:id  →  Delete Campaign
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function deleteCampaign
 * @description Deletes a specific campaign and its associated creatives and analytics from the database.
 * @param {import('express').Request} req - The Express request object. Requires `id` in params.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response indicating success or failure.
 */
exports.deleteCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/campaigns/:id/analytics  →  Get Analytics for single campaign
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function getCampaignAnalytics
 * @description Retrieves key performance metrics (KPIs) and analytics for a specific active campaign.
 * @param {import('express').Request} req - The Express request object. Requires `id` in params.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the aggregated analytics data.
 */
exports.getCampaignAnalytics = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: events, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('campaign_id', id);

    if (error) throw error;

    const summary = { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 };
    const channelBreakdown = {};

    (events || []).forEach(e => {
        const type = e.event_type.toLowerCase();

        if (!channelBreakdown[e.channel]) {
            channelBreakdown[e.channel] = { sent: 0, delivered: 0, opened: 0, clicked: 0, purchased: 0 };
        }

        const inc = (t) => {
            if (summary[t] !== undefined) summary[t]++;
            if (channelBreakdown[e.channel][t] !== undefined) channelBreakdown[e.channel][t]++;
        };

        if (type === 'sent') { inc('sent'); }
        if (type === 'delivered') { inc('sent'); inc('delivered'); }
        if (type === 'opened') { inc('sent'); inc('delivered'); inc('opened'); }
        if (type === 'clicked') { inc('sent'); inc('delivered'); inc('opened'); inc('clicked'); }
        if (type === 'purchased') { inc('sent'); inc('delivered'); inc('opened'); inc('clicked'); inc('purchased'); }
        if (type === 'viewed') { inc('sent'); inc('delivered'); inc('opened'); }
    });

    res.json({ success: true, summary, channelBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/campaigns/:id  →  Get single campaign details
// ─────────────────────────────────────────────────────────────────────────
/**
 * @function getCampaignById
 * @description Retrieves full details and configuration for a specific campaign.
 * @param {import('express').Request} req - The Express request object. Requires `id` in params.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends JSON response containing the campaign object.
 */
exports.getCampaignById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }
      throw error;
    }

    res.json({ success: true, campaign });
  } catch (err) {
    console.error('getCampaignById error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
