const crypto = require('crypto');

/**
 * Generate a unique room id, e.g. "room_1696348800000_ab12cd34e".
 */
function generateRoomId() {
  return `room_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
}

/**
 * Registry of per-mode disconnect handlers.
 *
 * Each mode module (battle, coop) registers a cleanup callback so the
 * shared connection layer (server/ws.js) can notify connection state
 * without reaching into mode-specific room maps.
 */
const disconnectHandlers = new Set();

function registerDisconnectHandler(handler) {
  disconnectHandlers.add(handler);
}

function handleDisconnect(ws) {
  for (const handler of disconnectHandlers) {
    handler(ws);
  }
}

module.exports = { generateRoomId, registerDisconnectHandler, handleDisconnect };
