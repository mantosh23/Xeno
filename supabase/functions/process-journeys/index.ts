import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error("GEMINI_API_KEY missing")

    // Provide a recommendation prompt
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
    "steps": [
      { "day": 1, "channel": "Email", "description": "We miss you" }
    ]
  }
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      }
    )

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text
    const strategyJSON = JSON.parse(resultText)

    // Insert as "Recommended" into campaigns table
    const { data: inserted, error } = await supabaseClient
      .from('campaigns')
      .insert({
        name: strategyJSON.name,
        goal: strategyJSON.goal,
        audience_type: strategyJSON.audience_type,
        channels: strategyJSON.channels,
        strategy: strategyJSON.strategy,
        status: 'Recommended'
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, campaign: inserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
