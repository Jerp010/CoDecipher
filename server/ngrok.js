const ngrok = require('@ngrok/ngrok');

/**
 * Start the ngrok tunnel. Only called when a tunnel is explicitly enabled
 * and configured (see server/config.js).
 *
 * Returns the public URL, or null when the tunnel fails (reason logged).
 */
async function startNgrokTunnel(port, authtoken) {
  console.log('Creating ngrok tunnel...');
  try {
    const listener = await ngrok.forward({ addr: port, authtoken });
    const url = listener.url();
    console.log(`ngrok tunnel available at ${url}`);
    return url;
  } catch (error) {
    console.warn(`ngrok tunnel failed: ${error.message}`);
    return null;
  }
}

module.exports = { startNgrokTunnel };
