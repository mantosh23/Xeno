-- Create the campaign_ai_sessions table for maintaining Gemini AI context
CREATE TABLE IF NOT EXISTS public.campaign_ai_sessions (
    session_id UUID PRIMARY KEY,
    context JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: The API automatically handles creation and updates of this table.
