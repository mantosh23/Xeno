const supabase = require('../config/supabase');

/**
 * @function requireAuth
 * @description Express middleware to enforce Supabase JWT authentication. 
 * Extracts the Bearer token, validates it against Supabase, and injects the user into req.user.
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];

        // Validate token using Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth Error:', error?.message);
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        }

        // Attach user to request for downstream controllers
        req.user = user;
        
        next();
    } catch (err) {
        console.error('Unexpected Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};

module.exports = {
    requireAuth
};
