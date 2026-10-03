const WebSocket = require('ws');

const { generateRoomId, registerDisconnectHandler } = require('./rooms');
const { loadCoopQuestion } = require('./questions');

const waitingCoopPlayer = { current: null };
const coopRooms = new Map(); // roomId -> { player1, player2, category, questionFile, question, answers, submitted }

function sendTo(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function partnerOf(room, role) {
  return role === 'player1' ? room.player2 : room.player1;
}

// Grading normalizes case and quotes, as in the original implementation.
function normalize(value) {
  return String(value).toLowerCase().replace(/['"]/g, '');
}

/**
 * Pair the player with a waiting partner (or make them the waiter).
 */
function handleCoopJoin(ws) {
  if (waitingCoopPlayer.current) {
    const coopRoomId = generateRoomId();
    const player1 = waitingCoopPlayer.current;
    const player2 = ws;

    player1.coopRole = 'player1';
    player1.coopRoomId = coopRoomId;
    player2.coopRole = 'player2';
    player2.coopRoomId = coopRoomId;

    coopRooms.set(coopRoomId, {
      player1,
      player2,
      category: null,
      questionFile: null,
      question: null,
      player1Answers: [],
      player2Answers: [],
      player1Submitted: false,
      player2Submitted: false,
    });

    sendTo(player1, { type: 'coop_role_assignment', role: 'player1', status: 'paired' });
    sendTo(player2, { type: 'coop_role_assignment', role: 'player2', status: 'paired' });

    waitingCoopPlayer.current = null;
  } else {
    waitingCoopPlayer.current = ws;
    ws.coopRole = 'player1';
    sendTo(ws, { type: 'coop_role_assignment', role: 'player1', status: 'waiting' });
  }
}

/**
 * Player 1 picks a category + question file; both players receive the
 * category, then a randomly loaded question starts the round.
 */
async function handleCoopSelectCategory(ws, data) {
  if (!ws.coopRoomId || ws.coopRole !== 'player1') return;
  const room = coopRooms.get(ws.coopRoomId);
  if (!room) return;

  room.category = data.category;
  room.questionFile = data.questionFile;

  sendTo(room.player1, { type: 'coop_category_selected', category: data.category });
  sendTo(room.player2, { type: 'coop_category_selected', category: data.category });

  const question = await loadCoopQuestion(data.questionFile);
  if (question) {
    room.question = question;
    sendTo(room.player1, { type: 'coop_game_start', question });
    sendTo(room.player2, { type: 'coop_game_start', question });
  }
}

function handleCoopProgress(ws, data) {
  if (!ws.coopRoomId) return;
  const room = coopRooms.get(ws.coopRoomId);
  if (!room) return;

  sendTo(partnerOf(room, ws.coopRole), {
    type: 'coop_partner_progress',
    progress: data.progress,
    filled: data.filled,
    total: data.total,
  });
}

function handleCoopSubmit(ws, data) {
  if (!ws.coopRoomId) return;
  const room = coopRooms.get(ws.coopRoomId);
  if (!room) return;

  if (ws.coopRole === 'player1') {
    room.player1Answers = data.answers;
    room.player1Submitted = true;
  } else {
    room.player2Answers = data.answers;
    room.player2Submitted = true;
  }

  sendTo(partnerOf(room, ws.coopRole), { type: 'coop_partner_submitted' });

  if (room.player1Submitted && room.player2Submitted) {
    calculateCoopResults(ws.coopRoomId);
  }
}

/**
 * Grade both players' answers.
 *
 * Field layout is question-type specific (this mirrors the original
 * implementation and matches the question banks):
 * - "frontend_backend": expected answers live in player{1,2}.blanks
 *   (see html_php.json, javascript_react.json).
 * - "both_backends": expected answers live in player{1,2}.answers
 *   (see backend_backend.json).
 */
function countCorrect(answers, expected) {
  return answers.filter(
    (answer, i) => answer !== undefined && normalize(answer) === normalize(expected[i]),
  ).length;
}

function calculateCoopResults(roomId) {
  const room = coopRooms.get(roomId);
  if (!room || !room.question) return;

  const question = room.question;
  let totalCorrect = 0;
  let totalBlanks = 0;

  if (question.type === 'frontend_backend') {
    totalCorrect =
      countCorrect(room.player1Answers, question.player1.blanks) +
      countCorrect(room.player2Answers, question.player2.blanks);
    totalBlanks = question.player1.blanks.length + question.player2.blanks.length;
  } else if (question.type === 'both_backends') {
    totalCorrect =
      countCorrect(room.player1Answers, question.player1.answers) +
      countCorrect(room.player2Answers, question.player2.answers);
    totalBlanks = question.player1.answers.length + question.player2.answers.length;
  }

  const results = { type: 'coop_results', correctCount: totalCorrect, totalBlanks };
  sendTo(room.player1, results);
  sendTo(room.player2, results);
}

function handleCoopTimeout(ws) {
  if (!ws.coopRoomId) return;
  const room = coopRooms.get(ws.coopRoomId);
  if (!room) return;
  sendTo(room.player1, { type: 'coop_timeout' });
  sendTo(room.player2, { type: 'coop_timeout' });
}

registerDisconnectHandler((ws) => {
  if (waitingCoopPlayer.current === ws) {
    waitingCoopPlayer.current = null;
  }

  if (!ws.coopRoomId) return;
  const room = coopRooms.get(ws.coopRoomId);
  if (!room) return;

  sendTo(partnerOf(room, ws.coopRole), { type: 'partner_disconnected' });
  coopRooms.delete(ws.coopRoomId);
});

module.exports = {
  handleCoopJoin,
  handleCoopSelectCategory,
  handleCoopProgress,
  handleCoopSubmit,
  handleCoopTimeout,
};
