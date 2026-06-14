// Load environment variables at the very beginning
require('dotenv').config();

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

const app = require('./app');
const automationEngine = require('./src/services/automationEngine');

// The port we will listen on
const PORT = process.env.PORT || 3000;

/**
 * @function startServer
 * @description Bootstraps the Express application, validates critical environment variables, starts the background automation queue (pg-boss), and sets up graceful shutdown handlers for the Node process.
 * @returns {Promise<void>}
 */
const startServer = async () => {
    try {
        // Quick check for Supabase environment variables
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.warn("⚠️  Warning: SUPABASE_URL or SUPABASE_ANON_KEY is missing from .env file.");
        } else {
            console.log("✅ Supabase credentials loaded.");
        }

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });

        // Start background tasks
        await automationEngine.startEngine();

        // Graceful shutdown
        const gracefulShutdown = () => {
            console.log('Received shutdown signal. Closing HTTP server gracefully...');
            automationEngine.stopEngine();
            server.close(() => {
                console.log('HTTP server closed. Exiting process.');
                process.exit(0);
            });
            
            // Force shutdown if it takes too long (e.g. 10 seconds)
            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1); // Exit if something goes completely wrong
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    // Let the graceful shutdown logic handle server closure if it exists, otherwise exit
    process.exit(1);
});

startServer();
