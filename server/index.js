const http = require('http');
const express = require('express');
const path = require('path');

const { port, ngrokAuthtoken, readNgrokAuthtokenFromYml } = require('./config');
const { attachWebSocketServer } = require('./ws');
const { startNgrokTunnel } = require('./ngrok');

const app = express();
const server = http.createServer(app);

// Static frontend (public URLs unchanged: /, /menu.html, /solo.html, ...).
app.use(express.static(path.join(__dirname, '..', 'public')));

attachWebSocketServer(server);

server.listen(port, async () => {
  console.log(`CoDecipher server listening on http://localhost:${port}`);

  // Resolve authtoken: environment first, then the ngrok CLI config file.
  let authtoken = ngrokAuthtoken;
  if (!authtoken) {
    authtoken = await readNgrokAuthtokenFromYml();
  }

  await startNgrokTunnel(port, authtoken);
});
