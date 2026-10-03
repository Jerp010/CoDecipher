const ngrok = require('@ngrok/ngrok');

/**
 * Start the ngrok tunnel. Kept separate from config so the tunnel can be
 * enabled/disabled independently of app startup.
 *
 * Returns the public URL, or null when disabled/failed (reason logged).
 */
async function startNgrokTunnel(port, authtoken) {
  console.log('Creating ngrok tunnel...');
  try {
    const options = { addr: port };
    if (authtoken) {
      options.authtoken = authtoken;
    }
    const listener = await ngrok.forward(options);
    const url = listener.url();
    console.log(`ngrok tunnel available at ${url}`);
    return url;
  } catch (error) {
    console.warn(`ngrok tunnel failed: ${error.message}`);
    return null;
  }
}

module.exports = { startNgrokTunnel };
