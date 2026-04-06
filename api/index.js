/**
 * Vercel serverless entry: forwards all /api/* traffic to the Express app.
 * Rewrites are defined in vercel.json (source /api/(.*) → destination /api).
 */
module.exports = require('../backend/server.js');
