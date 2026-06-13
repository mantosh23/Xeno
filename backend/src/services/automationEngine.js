const { PgBoss } = require('pg-boss');
const supabase = require('../config/supabase');

let boss = null;
let engineTask = null; // We'll keep a small poller to schedule jobs for active automations

// This is our worker function that will actually "process" the queue job
const processSendMessageJob = async (job) => {
    const { automation } = job.data;
    
    console.log(`\n==============================================`);
    console.log(`⚡ [pg-boss] WORKER EXECUTING AUTOMATION: ${automation.title}`);
    console.log(`==============================================`);
    console.log(`Job ID: ${job.id}`);
    console.log(`Trigger: ${automation.triggers}`);
    console.log(`Action Flow: ${automation.actions}`);
    console.log(`\n📨 SENDING MESSAGE:`);
    console.log(`"${automation.message_copy || 'No message copy provided'}"`);
    console.log(`==============================================\n`);

    // Increment the stats_sent counter
    const newStatsSent = (automation.stats_sent || 0) + 1;
    
    await supabase
        .from('automations')
        .update({ stats_sent: newStatsSent })
        .eq('id', automation.id);
        
    return { success: true, message: "Simulated message sent" };
};

// This poller finds active automations and queues them up in pg-boss
const queueActiveAutomations = async () => {
    if (!boss) return;
    
    try {
        const { data: automations, error } = await supabase
            .from('automations')
            .select('*')
            .eq('status', 'active');

        if (error || !automations || automations.length === 0) return;

        // Schedule them in the queue. 
        // In a real app, you would use unique job keys or delays. Here we just push them to the queue immediately.
        for (const automation of automations) {
            // Using a unique key (e.g. automation id + current hour) so we don't spam the queue
            const jobId = await boss.send('send-message', { automation }, { 
                singletonKey: `auto_${automation.id}_${new Date().getHours()}_${new Date().getMinutes()}`,
                retryLimit: 3, 
                retryDelay: 60 
            });
            if (jobId) {
                console.log(`[pg-boss] Queued job ${jobId} for automation: ${automation.title}`);
            }
        }
    } catch (e) {
        console.error('[pg-boss] Error queuing automations:', e);
    }
};

const startEngine = async () => {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl || dbUrl.includes('[YOUR-PASSWORD]')) {
        console.warn('⚠️ [pg-boss] DATABASE_URL is missing or invalid in .env. Skipping queue initialization.');
        return;
    }

    console.log('⚙️ Starting pg-boss background queuing engine...');
    
    try {
        boss = new PgBoss(dbUrl);
        
        boss.on('error', error => console.error('[pg-boss] Error:', error));
        
        await boss.start();
        console.log('✅ [pg-boss] Connection established and schema ready.');

        // Ensure the queue exists before working on it
        await boss.createQueue('send-message');

        // Register our worker to consume 'send-message' jobs
        await boss.work('send-message', processSendMessageJob);
        
        // Start a small setInterval to simulate "Cron" behavior which queues jobs
        engineTask = setInterval(queueActiveAutomations, 60000); // Poll every minute
        
    } catch (err) {
        console.error('❌ [pg-boss] Failed to start:', err);
    }
};

const stopEngine = async () => {
    if (engineTask) {
        clearInterval(engineTask);
    }
    if (boss) {
        console.log('🛑 Stopping pg-boss gracefully...');
        await boss.stop();
    }
};

module.exports = {
    startEngine,
    stopEngine
};
