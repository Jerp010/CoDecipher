/**
 * Environment configuration.
 *
 * Loads .env from the project root (if present) and exposes the settings
 * the server needs. See .env.example for the available variables.
 */
require('dotenv').config({ quiet: true });

const port = Number(process.env.PORT) || 3000;

// ngrok tunnel authtoken (https://dashboard.ngrok.com/get-started/your-authtoken)
const ngrokAuthtoken = process.env.NGROK_AUTHTOKEN || null;

// Opt-in tunnel: set NGROK_ENABLED=false to force local-only mode even when
// an authtoken is present. Default (unset) is enabled when a token exists.
const ngrokEnabled = process.env.NGROK_ENABLED !== 'false';

module.exports = { port, ngrokAuthtoken, ngrokEnabled };
