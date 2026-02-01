const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs").promises;
const ngrok = require("@ngrok/ngrok");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ---------- Game State ----------
let waitingPlayer = null;
const rooms = new Map(); // roomId -> { player1, player2 }

let waitingBattlePlayer = null;
const battleRooms = new Map(); // roomId -> { player1, player2, question, topicChooser, submissions }

let waitingCoopPlayer = null;
const coopRooms = new Map(); // roomId -> { player1, player2, category, question, answers, submitted }

let ngrokUrl = null;

function generateRoomId() {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ---------- WebSocket Handling ----------
wss.on("connection", (ws) => {
  console.log("New client connected");

  let roomId = null;
  let playerRole = null;

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data.type);

      switch (data.type) {
        // General Multiplayer
        case "join":
          handlePlayerJoin(ws);
          break;

        case "typing":
          handleTyping(ws, data);
          break;

        // Battle Mode
        case "join_battle":
          handleBattleJoin(ws);
          break;

        case "topic_selected":
          await handleTopicSelection(ws, data.topic);
          break;

        case "battle_progress":
          handleBattleProgress(ws, data);
          break;

        case "typing_update":
          handleTypingUpdate(ws, data);
          break;

        case "battle_submit":
          handleBattleSubmit(ws, data);
          break;

        // Co-op Mode
        case "join_coop":
          handleCoopJoin(ws);
          break;

        case "coop_select_category":
          await handleCoopSelectCategory(ws, data);
          break;

        case "coop_progress":
          handleCoopProgress(ws, data);
          break;

        case "coop_submit":
          handleCoopSubmit(ws, data);
          break;

        case "coop_timeout":
          handleCoopTimeout(ws);
          break;

        // Ping
        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    handlePlayerDisconnect(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // ---------- General Multiplayer Handlers ----------
  function handlePlayerJoin(ws) {
    if (waitingPlayer) {
      roomId = generateRoomId();
      playerRole = "player2";

      const player1 = waitingPlayer;
      const player2 = ws;

      rooms.set(roomId, { player1, player2 });

      player1.playerRole = "player1";
      player1.roomId = roomId;

      player2.playerRole = "player2";
      player2.roomId = roomId;

      // Notify players
      player1.send(
        JSON.stringify({
          type: "role_assignment",
          role: "player1",
          status: "paired",
          roomId,
        }),
      );
      player2.send(
        JSON.stringify({
          type: "role_assignment",
          role: "player2",
          status: "paired",
          roomId,
        }),
      );

      console.log(`Room ${roomId} created: Player 1 and Player 2 paired`);
      waitingPlayer = null;
    } else {
      waitingPlayer = ws;
      playerRole = "player1";
      ws.playerRole = "player1";

      ws.send(
        JSON.stringify({
          type: "role_assignment",
          role: "player1",
          status: "waiting",
        }),
      );
      console.log("Player 1 is waiting for Player 2");
    }
  }

  function handleTyping(ws, data) {
    if (!ws.roomId) return;

    const room = rooms.get(ws.roomId);
    if (!room) return;

    const otherPlayer =
      ws.playerRole === "player1" ? room.player2 : room.player1;
    if (otherPlayer && otherPlayer.readyState === WebSocket.OPEN) {
      otherPlayer.send(
        JSON.stringify({
          type: "update",
          player: data.player,
          text: data.text,
        }),
      );
    }
  }

  function handlePlayerDisconnect(ws) {
    // General multiplayer
    if (waitingPlayer === ws) waitingPlayer = null;

    if (ws.roomId) {
      const room = rooms.get(ws.roomId);
      if (room) {
        const otherPlayer =
          ws.playerRole === "player1" ? room.player2 : room.player1;
        if (otherPlayer && otherPlayer.readyState === WebSocket.OPEN) {
          otherPlayer.send(
            JSON.stringify({
              type: "player_disconnected",
              disconnectedPlayer: ws.playerRole,
            }),
          );
        }
        rooms.delete(ws.roomId);
      }
    }

    // Battle
    if (waitingBattlePlayer === ws) waitingBattlePlayer = null;

    if (ws.battleRoomId) {
      const battleRoom = battleRooms.get(ws.battleRoomId);
      if (battleRoom) {
        const otherPlayer =
          ws.battleRole === "player1" ? battleRoom.player2 : battleRoom.player1;
        if (otherPlayer && otherPlayer.readyState === WebSocket.OPEN) {
          otherPlayer.send(JSON.stringify({ type: "opponent_disconnected" }));
        }
        battleRooms.delete(ws.battleRoomId);
      }
    }

    // Co-op
    if (waitingCoopPlayer === ws) waitingCoopPlayer = null;

    if (ws.coopRoomId) {
      const coopRoom = coopRooms.get(ws.coopRoomId);
      if (coopRoom) {
        const partner =
          ws.coopRole === "player1" ? coopRoom.player2 : coopRoom.player1;
        if (partner && partner.readyState === WebSocket.OPEN) {
          partner.send(JSON.stringify({ type: "partner_disconnected" }));
        }
        coopRooms.delete(ws.coopRoomId);
      }
    }
  }

  // ---------- Battle Mode Handlers ----------
  function handleBattleJoin(ws) {
    if (waitingBattlePlayer) {
      const battleRoomId = generateRoomId();
      const player1 = waitingBattlePlayer;
      const player2 = ws;

      player1.battleRole = "player1";
      player1.battleRoomId = battleRoomId;
      player2.battleRole = "player2";
      player2.battleRoomId = battleRoomId;

      battleRooms.set(battleRoomId, { player1, player2, submissions: {} });

      player1.send(
        JSON.stringify({
          type: "battle_role_assignment",
          role: "player1",
          status: "paired",
        }),
      );
      player2.send(
        JSON.stringify({
          type: "battle_role_assignment",
          role: "player2",
          status: "paired",
        }),
      );

      console.log(`Battle room ${battleRoomId}: Players paired`);

      // Randomly choose who picks topic
      const chooser = Math.random() < 0.5 ? "player1" : "player2";
      battleRooms.get(battleRoomId).topicChooser = chooser;

      setTimeout(() => {
        player1.send(
          JSON.stringify({ type: "battle_topic_selection", chooser }),
        );
        player2.send(
          JSON.stringify({ type: "battle_topic_selection", chooser }),
        );
      }, 1500);

      waitingBattlePlayer = null;
    } else {
      waitingBattlePlayer = ws;
      ws.battleRole = "player1";
      ws.send(
        JSON.stringify({
          type: "battle_role_assignment",
          role: "player1",
          status: "waiting",
        }),
      );
    }
  }

  async function handleTopicSelection(ws, topic) {
    if (!ws.battleRoomId) return;
    const room = battleRooms.get(ws.battleRoomId);
    if (!room) return;

    room.topic = topic;

    try {
      const questionsPath = path.join(
        __dirname,
        "public",
        "questions",
        `${topic}.json`,
      );
      const questionsData = await fs.readFile(questionsPath, "utf8");
      const questions = JSON.parse(questionsData);
      const selectedQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      room.question = selectedQuestion;

      room.player1.send(
        JSON.stringify({ type: "battle_start", question: selectedQuestion }),
      );
      room.player2.send(
        JSON.stringify({ type: "battle_start", question: selectedQuestion }),
      );
    } catch (error) {
      console.error("Error loading question, using fallback:", error);
      const fallbackQuestion = {
        question: "Complete this JavaScript class constructor",
        code_snippet:
          "class Car {\n  ___(brand) {\n    this.___ = brand;\n  }\n  present() {\n    return 'I have a ' + this.___;\n  }\n}",
        answers: ["constructor", "carname", "carname"],
      };
      room.question = fallbackQuestion;
      room.player1.send(
        JSON.stringify({ type: "battle_start", question: fallbackQuestion }),
      );
      room.player2.send(
        JSON.stringify({ type: "battle_start", question: fallbackQuestion }),
      );
    }
  }

  function handleBattleProgress(ws, data) {
    if (!ws.battleRoomId) return;
    const room = battleRooms.get(ws.battleRoomId);
    if (!room) return;

    const otherPlayer =
      ws.battleRole === "player1" ? room.player2 : room.player1;
    if (otherPlayer && otherPlayer.readyState === WebSocket.OPEN) {
      otherPlayer.send(
        JSON.stringify({
          type: "opponent_progress",
          progress: data.progress,
          filled: data.filled,
          total: data.total,
        }),
      );
    }
  }

  function handleTypingUpdate(ws, data) {
    if (!ws.battleRoomId) return;
    const room = battleRooms.get(ws.battleRoomId);
    if (!room) return;

    const otherPlayer =
      ws.battleRole === "player1" ? room.player2 : room.player1;
    if (otherPlayer && otherPlayer.readyState === WebSocket.OPEN) {
      otherPlayer.send(
        JSON.stringify({
          type: "opponent_typing",
          index: data.index,
          value: data.value,
        }),
      );
    }
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

    if (room.submissions.player1 && room.submissions.player2) {
      const p1 = room.submissions.player1;
      const p2 = room.submissions.player2;
      let winner =
        !p1.correct && !p2.correct
          ? "tie"
          : !p1.correct
            ? "player2"
            : !p2.correct
              ? "player1"
              : p1.time < p2.time
                ? "player1"
                : p1.time > p2.time
                  ? "player2"
                  : "tie";

      room.player1.send(
        JSON.stringify({
          type: "battle_result",
          winner,
          yourTime: p1.time,
          opponentTime: p2.time,
        }),
      );
      room.player2.send(
        JSON.stringify({
          type: "battle_result",
          winner,
          yourTime: p2.time,
          opponentTime: p1.time,
        }),
      );
    }
  }

  // ---------- Co-op Handlers ----------
  function handleCoopJoin(ws) {
    if (waitingCoopPlayer) {
      const coopRoomId = generateRoomId();
      const player1 = waitingCoopPlayer;
      const player2 = ws;

      player1.coopRole = "player1";
      player1.coopRoomId = coopRoomId;
      player2.coopRole = "player2";
      player2.coopRoomId = coopRoomId;

      coopRooms.set(coopRoomId, {
        player1,
        player2,
        category: null,
        questionFile: null,
        player1Answers: [],
        player2Answers: [],
        player1Submitted: false,
        player2Submitted: false,
      });

      player1.send(
        JSON.stringify({
          type: "coop_role_assignment",
          role: "player1",
          status: "paired",
        }),
      );
      player2.send(
        JSON.stringify({
          type: "coop_role_assignment",
          role: "player2",
          status: "paired",
        }),
      );

      waitingCoopPlayer = null;
    } else {
      waitingCoopPlayer = ws;
      ws.coopRole = "player1";
      ws.send(
        JSON.stringify({
          type: "coop_role_assignment",
          role: "player1",
          status: "waiting",
        }),
      );
    }
  }

  async function loadCoopQuestion(questionFile) {
    try {
      const filePath = path.join(
        __dirname,
        "public",
        "questions-coop",
        `${questionFile}.json`,
      );
      const data = await fs.readFile(filePath, "utf8");
      const questions = JSON.parse(data);
      return questions[Math.floor(Math.random() * questions.length)];
    } catch (error) {
      console.error("Error loading co-op question:", error);
      return null;
    }
  }

  async function handleCoopSelectCategory(ws, data) {
    if (!ws.coopRoomId || ws.coopRole !== "player1") return;
    const room = coopRooms.get(ws.coopRoomId);
    if (!room) return;

    room.category = data.category;
    room.questionFile = data.questionFile;

    room.player1.send(
      JSON.stringify({
        type: "coop_category_selected",
        category: data.category,
      }),
    );
    room.player2.send(
      JSON.stringify({
        type: "coop_category_selected",
        category: data.category,
      }),
    );

    const question = await loadCoopQuestion(data.questionFile);
    if (question) {
      room.question = question;
      room.player1.send(JSON.stringify({ type: "coop_game_start", question }));
      room.player2.send(JSON.stringify({ type: "coop_game_start", question }));
    }
  }

  function handleCoopProgress(ws, data) {
    if (!ws.coopRoomId) return;
    const room = coopRooms.get(ws.coopRoomId);
    if (!room) return;

    const partner = ws.coopRole === "player1" ? room.player2 : room.player1;
    if (partner && partner.readyState === WebSocket.OPEN) {
      partner.send(
        JSON.stringify({
          type: "coop_partner_progress",
          progress: data.progress,
          filled: data.filled,
          total: data.total,
        }),
      );
    }
  }

  function handleCoopSubmit(ws, data) {
    if (!ws.coopRoomId) return;
    const room = coopRooms.get(ws.coopRoomId);
    if (!room) return;

    if (ws.coopRole === "player1") {
      room.player1Answers = data.answers;
      room.player1Submitted = true;
    } else {
      room.player2Answers = data.answers;
      room.player2Submitted = true;
    }

    const partner = ws.coopRole === "player1" ? room.player2 : room.player1;
    if (partner && partner.readyState === WebSocket.OPEN)
      partner.send(JSON.stringify({ type: "coop_partner_submitted" }));

    if (room.player1Submitted && room.player2Submitted)
      calculateCoopResults(ws.coopRoomId);
  }

  function calculateCoopResults(roomId) {
    const room = coopRooms.get(roomId);
    if (!room || !room.question) return;

    const question = room.question;
    let totalCorrect = 0;
    let totalBlanks = 0;

    if (question.type === "frontend_backend") {
      const p1Correct = room.player1Answers.filter(
        (a, i) =>
          a.toLowerCase().replace(/['"]/g, "") ===
          question.player1.blanks[i].toLowerCase().replace(/['"]/g, ""),
      ).length;
      const p2Correct = room.player2Answers.filter(
        (a, i) =>
          a.toLowerCase().replace(/['"]/g, "") ===
          question.player2.blanks[i].toLowerCase().replace(/['"]/g, ""),
      ).length;
      totalCorrect = p1Correct + p2Correct;
      totalBlanks =
        question.player1.blanks.length + question.player2.blanks.length;
    } else if (question.type === "both_backends") {
      const p1Correct = room.player1Answers.filter(
        (a, i) =>
          a.toLowerCase().replace(/['"]/g, "") ===
          question.player1.answers[i].toLowerCase().replace(/['"]/g, ""),
      ).length;
      const p2Correct = room.player2Answers.filter(
        (a, i) =>
          a.toLowerCase().replace(/['"]/g, "") ===
          question.player2.answers[i].toLowerCase().replace(/['"]/g, ""),
      ).length;
      totalCorrect = p1Correct + p2Correct;
      totalBlanks =
        question.player1.answers.length + question.player2.answers.length;
    }

    const results = {
      type: "coop_results",
      correctCount: totalCorrect,
      totalBlanks,
    };
    room.player1.send(JSON.stringify(results));
    room.player2.send(JSON.stringify(results));
  }

  function handleCoopTimeout(ws) {
    if (!ws.coopRoomId) return;
    const room = coopRooms.get(ws.coopRoomId);
    if (!room) return;
    room.player1.send(JSON.stringify({ type: "coop_timeout" }));
    room.player2.send(JSON.stringify({ type: "coop_timeout" }));
  }
});

// ---------- Server Startup ----------
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log("\n🚀 Hackathon Server Started!");
  console.log(`📍 Local URL: http://localhost:${PORT}`);

  try {
    console.log("\n🌐 Creating ngrok tunnel...");
    const listener = await ngrok.forward({
      addr: PORT,
      authtoken_from_env: true,
    });
    ngrokUrl = listener.url();
    console.log("✅ Ngrok tunnel created:", ngrokUrl);
  } catch (error) {
    console.log("⚠️ Ngrok tunnel failed:", error.message);
  }
});
