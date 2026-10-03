const path = require('path');
const fs = require('fs').promises;

const port = Number(process.env.PORT) || 3000;

// Authtoken from the environment (see .env support added in the config commit).
const ngrokAuthtoken = process.env.NGROK_AUTHTOKEN || null;

// Legacy fallback location of the ngrok CLI config (parity with the original
// server.js startup; removed once .env-based config lands).
const NGROK_YML_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.ngrok2',
  'ngrok.yml',
);

async function readNgrokAuthtokenFromYml() {
  try {
    const config = await fs.readFile(NGROK_YML_PATH, 'utf8');
    const match = config.match(/authtoken:\s*(\S+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

module.exports = { port, ngrokAuthtoken, readNgrokAuthtokenFromYml };
