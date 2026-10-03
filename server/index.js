const http = require('http');
const express = require('express');
const path = require('path');

const { port, ngrokAuthtoken, ngrokEnabled } = require('./config');
const { attachWebSocketServer } = require('./ws');
const { startNgrokTunnel } = require('./ngrok');

const app = express();
const server = http.createServer(app);

// Static frontend (public URLs unchanged: /, /menu.html, /solo.html, ...).
app.use(express.static(path.join(__dirname, '..', 'public')));

attachWebSocketServer(server);

server.listen(port, async () => {
  console.log(`CoDecipher server listening on http://localhost:${port}`);

  if (!ngrokEnabled) {
    console.log('ngrok disabled (NGROK_ENABLED=false); server is local-only');
    return;
  }

  if (!ngrokAuthtoken) {
    console.log('ngrok not configured: set NGROK_AUTHTOKEN in .env to enable online multiplayer');
    console.log('See .env.example for details.');
    return;
  }

  await startNgrokTunnel(port, ngrokAuthtoken);
});
