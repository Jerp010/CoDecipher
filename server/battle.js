const WebSocket = require('ws');

const { generateRoomId, registerDisconnectHandler } = require('./rooms');
const { loadSoloQuestion } = require('./questions');

const waitingBattlePlayer = { current: null };
const battleRooms = new Map(); // roomId -> { player1, player2, topicChooser, question, submissions }

function sendTo(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function otherPlayer(room, role) {
  return role === 'player1' ? room.player2 : room.player1;
}

/**
 * Pair the player with a waiting opponent (or make them the waiter),
 * assign roles and pick who chooses the topic.
 */
function handleBattleJoin(ws) {
  if (waitingBattlePlayer.current) {
    const battleRoomId = generateRoomId();
    const player1 = waitingBattlePlayer.current;
    const player2 = ws;

    player1.battleRole = 'player1';
    player1.battleRoomId = battleRoomId;
    player2.battleRole = 'player2';
    player2.battleRoomId = battleRoomId;

    battleRooms.set(battleRoomId, { player1, player2, submissions: {} });

    sendTo(player1, { type: 'battle_role_assignment', role: 'player1', status: 'paired' });
    sendTo(player2, { type: 'battle_role_assignment', role: 'player2', status: 'paired' });

    console.log(`Battle room ${battleRoomId}: Players paired`);

    // Randomly choose who picks the topic.
    const chooser = Math.random() < 0.5 ? 'player1' : 'player2';
    battleRooms.get(battleRoomId).topicChooser = chooser;

    setTimeout(() => {
      sendTo(player1, { type: 'battle_topic_selection', chooser });
      sendTo(player2, { type: 'battle_topic_selection', chooser });
    }, 1500);

    waitingBattlePlayer.current = null;
  } else {
    waitingBattlePlayer.current = ws;
    ws.battleRole = 'player1';
    sendTo(ws, { type: 'battle_role_assignment', role: 'player1', status: 'waiting' });
  }
}

/**
 * Load a random question from the chosen solo bank and start the race.
 * Falls back to a built-in question if the bank cannot be loaded.
 */
async function handleTopicSelection(ws, topic) {
  if (!ws.battleRoomId) return;
  const room = battleRooms.get(ws.battleRoomId);
  if (!room) return;

  room.topic = topic;

  const question = await loadSoloQuestion(topic);
  if (question) {
    room.question = question;
    sendTo(room.player1, { type: 'battle_start', question });
    sendTo(room.player2, { type: 'battle_start', question });
    return;
  }

  console.error(`Battle topic "${topic}" could not be loaded, using fallback question`);
  const fallbackQuestion = {
    question: 'Complete this JavaScript class constructor',
    code_snippet:
      "class Car {\n  ___(brand) {\n    this.___ = brand;\n  }\n  present() {\n    return 'I have a ' + this.___;\n  }\n}",
    answers: ['constructor', 'carname', 'carname'],
  };
  room.question = fallbackQuestion;
  sendTo(room.player1, { type: 'battle_start', question: fallbackQuestion });
  sendTo(room.player2, { type: 'battle_start', question: fallbackQuestion });
}

function handleBattleProgress(ws, data) {
  if (!ws.battleRoomId) return;
  const room = battleRooms.get(ws.battleRoomId);
  if (!room) return;

  sendTo(otherPlayer(room, ws.battleRole), {
    type: 'opponent_progress',
    progress: data.progress,
    filled: data.filled,
    total: data.total,
  });
}

function handleTypingUpdate(ws, data) {
  if (!ws.battleRoomId) return;
  const room = battleRooms.get(ws.battleRoomId);
  if (!room) return;

  sendTo(otherPlayer(room, ws.battleRole), {
    type: 'opponent_typing',
    index: data.index,
    value: data.value,
  });
}

function handleBattleSubmit(ws, data) {
  if (!ws.battleRoomId) return;
  const room = battleRooms.get(ws.battleRoomId);
  if (!room) return;

  room.submissions[ws.battleRole] = {
    time: data.time,
    correct: data.correct,
    answers: data.answers,
  };

  const { player1: p1Sub, player2: p2Sub } = room.submissions;
  if (!p1Sub || !p2Sub) return;

  let winner;
  if (!p1Sub.correct && !p2Sub.correct) winner = 'tie';
  else if (!p1Sub.correct) winner = 'player2';
  else if (!p2Sub.correct) winner = 'player1';
  else if (p1Sub.time < p2Sub.time) winner = 'player1';
  else if (p1Sub.time > p2Sub.time) winner = 'player2';
  else winner = 'tie';

  sendTo(room.player1, {
    type: 'battle_result',
    winner,
    yourTime: p1Sub.time,
    opponentTime: p2Sub.time,
  });
  sendTo(room.player2, {
    type: 'battle_result',
    winner,
    yourTime: p2Sub.time,
    opponentTime: p1Sub.time,
  });
}

registerDisconnectHandler((ws) => {
  if (waitingBattlePlayer.current === ws) {
    waitingBattlePlayer.current = null;
  }

  if (!ws.battleRoomId) return;
  const room = battleRooms.get(ws.battleRoomId);
  if (!room) return;

  sendTo(otherPlayer(room, ws.battleRole), { type: 'opponent_disconnected' });
  battleRooms.delete(ws.battleRoomId);
});

module.exports = {
  handleBattleJoin,
  handleTopicSelection,
  handleBattleProgress,
  handleTypingUpdate,
  handleBattleSubmit,
};
