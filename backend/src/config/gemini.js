const { GoogleGenAI } = require('@google/genai');
const supabase = require('./supabase');

let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('✅ Gemini AI (gemini-2.5-flash) ready with session context.');
} else {
  console.warn('⚠️  GEMINI_API_KEY missing — AI features unavailable.');
}

const MODEL = 'gemini-2.5-flash';

// ─── System identity injected at every session call ──────────────────────
const SYSTEM_INSTRUCTION = `You are an expert AI marketing strategist AND creative director embedded inside StyleHive, a premium Indian fashion CRM platform.

CRITICAL RULE: You have the ability to generate real images using your built-in image generation capability. 
- NEVER suggest using Unsplash, stock photos, or any external image URLs
- ALWAYS generate actual images yourself when asked for campaign creatives
- You are Gemini with native image generation — use it

Your responsibilities:
- Analyze real customer database metrics and generate data-driven campaign recommendations
- Use your Google Search tool to check real-time news, current fashion/pop-culture trends, memes, and the current Indian Calendar (festivals, seasons, holidays) when suggesting campaign ideas. ALWAYS factor in what is happening in India right now.
- Generate actual campaign poster images using your image generation capability
- Maintain full memory of our conversation across all steps
- Never use generic placeholder values — always use specific numbers from the database
- Keep responses sharp and commercially relevant for Indian fashion retail (use ₹, reference Indian cities)
- Return responses as valid JSON exactly as requested — no markdown fences, no extra text`;

// ─── Create a new session in Supabase ────────────────────────────────────
const createSession = async (metadata = {}) => {
  const { data, error } = await supabase
    .from('campaign_ai_sessions')
    .insert([{ messages: [], metadata }])
    .select('id')
    .single();
  if (error) throw new Error(`Session create failed: ${error.message}`);
  return data.id;
};

// ─── Load session from Supabase ───────────────────────────────────────────
const getSession = async (sessionId) => {
  const { data, error } = await supabase
    .from('campaign_ai_sessions')
    .select('messages, metadata')
    .eq('id', sessionId)
    .maybeSingle();
  if (error) throw new Error(`Session load failed: ${error.message}`);
  if (!data) return { messages: [] };
  return data;
};

// ─── Call Gemini with full conversation history ───────────────────────────
// Appends userMessage to the history, calls the model, saves the exchange back.
const callGeminiWithSession = async (sessionId, userMessage) => {
  if (!ai) throw new Error('Gemini AI not configured. Add GEMINI_API_KEY to backend/.env');

  const session = await getSession(sessionId);
  const history = session.messages || [];

  // Build the full contents array (history + new turn)
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });

  const modelText = response.text;

  // Persist the new exchange
  const updatedMessages = [
    ...history,
    { role: 'user', parts: [{ text: userMessage }] },
    { role: 'model', parts: [{ text: modelText }] },
  ];

  const { error: saveErr } = await supabase
    .from('campaign_ai_sessions')
    .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (saveErr) console.warn('Session save warning:', saveErr.message);

  return modelText;
};

// ─── Call Gemini with full conversation history (Streaming) ───────────────
const callGeminiWithSessionStream = async (sessionId, userMessage, displayMessage) => {
  if (!ai) throw new Error('Gemini AI not configured. Add GEMINI_API_KEY to backend/.env');

  const session = await getSession(sessionId);
  const history = session.messages || [];

  const contents = [
    ...history,
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const responseStream = await ai.models.generateContentStream({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
    }
  });

  // We return an object containing the stream and a helper to save history later
  return {
    stream: responseStream,
    saveHistory: async (fullAiResponse) => {
      const updatedMessages = [
        ...history,
        { role: 'user', parts: [{ text: displayMessage || userMessage }] },
        { role: 'model', parts: [{ text: fullAiResponse }] },
      ];
      await supabase
        .from('campaign_ai_sessions')
        .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
  };
};

// ─── Strip markdown fences and parse JSON ─────────────────────────────────
const parseAIJson = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI JSON:", text);
    throw e;
  }
};

const isAIAvailable = () => !!ai;

// ─── Call Gemini Directly without session ─────────────────────────────────
const callGeminiDirect = async (prompt, systemInstruction = 'You are a helpful AI.') => {
  if (!ai) throw new Error('Gemini AI not configured. Add GEMINI_API_KEY to backend/.env');
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
    }
  });
  return response.text;
};

// ─── Generate image using Imagen 3 API ────────────────────────────────────
const generateCreativeImage = async (prompt, aspectRatio = '1:1') => {
  if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key missing');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate image via Imagen API');
  }

  return data.predictions?.[0]?.bytesBase64Encoded;
};

module.exports = { isAIAvailable, callGeminiWithSession, callGeminiWithSessionStream, callGeminiDirect, parseAIJson, createSession, generateCreativeImage };
