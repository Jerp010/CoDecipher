const { WebSocketServer } = require('ws');

const battle = require('./battle');
const coop = require('./coop');
const { handleDisconnect } = require('./rooms');

/**
 * Attach the WebSocket server to the HTTP server and route incoming
 * messages to the per-mode handlers.
 */
function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch (error) {
        console.error('Invalid JSON from client:', error.message);
        return;
      }

      try {
        await routeMessage(ws, data);
      } catch (error) {
        console.error(`Error processing message "${data.type}":`, error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

async function routeMessage(ws, data) {
  switch (data.type) {
    // Battle mode
    case 'join_battle':
      battle.handleBattleJoin(ws);
      break;
    case 'topic_selected':
      await battle.handleTopicSelection(ws, data.topic);
      break;
    case 'battle_progress':
      battle.handleBattleProgress(ws, data);
      break;
    case 'typing_update':
      battle.handleTypingUpdate(ws, data);
      break;
    case 'battle_submit':
      battle.handleBattleSubmit(ws, data);
      break;

    // Co-op mode
    case 'join_coop':
      coop.handleCoopJoin(ws);
      break;
    case 'coop_select_category':
      await coop.handleCoopSelectCategory(ws, data);
      break;
    case 'coop_progress':
      coop.handleCoopProgress(ws, data);
      break;
    case 'coop_submit':
      coop.handleCoopSubmit(ws, data);
      break;
    case 'coop_timeout':
      coop.handleCoopTimeout(ws);
      break;

    // Heartbeat
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      console.log(`Unknown message type: ${data.type}`);
  }
}

module.exports = { attachWebSocketServer };
