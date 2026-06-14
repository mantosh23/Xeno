const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});


// Middleware
app.use(helmet());

// Dynamic CORS based on Environment
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*';
app.use(cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200
}));

app.use(compression()); // Compress all responses
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // HTTP request logger

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply Global Rate Limiter
app.use('/api/', globalLimiter);

// Import Routes
const customerRoutes = require('./src/routes/customerRoutes');
const campaignRoutes = require('./src/routes/campaignRoutes');
const strategyRoutes = require('./src/routes/strategyRoutes');
const channelRoutes = require('./src/routes/channelRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const automationRoutes = require('./src/routes/automationRoutes');
const { requireAuth } = require('./src/middleware/authMiddleware');

// Mount Routes
app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/campaigns', requireAuth, campaignRoutes);

// Apply strict rate limiting specifically to the AI endpoints
app.use('/api/strategy', requireAuth, strategyRoutes);

app.use('/api/channels', requireAuth, channelRoutes);
app.use('/api/webhook', webhookRoutes); // Webhooks typically handle their own secret validation
app.use('/api/analytics', requireAuth, analyticsRoutes);
app.use('/api/automations', requireAuth, automationRoutes);



// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Fashion CRM API is running smoothly' });
});

// Advanced Error Handler
app.use((err, req, res, next) => {
    // Log the error securely
    if (process.env.NODE_ENV !== 'test') {
        console.error(`[Error] ${err.message}`, err.stack);
    }
    
    // In production, hide the full stack trace
    const errorResponse = {
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    };
    
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
    }

    res.status(err.status || 500).json(errorResponse);
});

module.exports = app;
