-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the edge function to run every hour
SELECT cron.schedule(
  'invoke-process-journeys-hourly',
  '0 * * * *',
  $$
    SELECT net.http_post(
        url:='https://zzqnsrqfrkfkgzvifsjp.supabase.co/functions/v1/process-journeys',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body:='{}'::jsonb
    )
  $$
);
