# CoDecipher — Architecture

This document explains how CoDecipher is structured, how each game mode flows through the system, and where the known limitations are. For setup and day-to-day commands, see the [README](README.md).

## 1. Overview

CoDecipher is a **single-process Node.js application** with:

- an **Express** HTTP server serving the static frontend from `public/`,
- a **`ws` WebSocket server** attached to the same HTTP server for all real-time gameplay,
- **in-memory game state** (rooms, submissions) that intentionally lives only for the process lifetime,
- **vanilla JS clients** — plain HTML pages with no build step, each page loading one client script.

There is no database, no authentication, and no horizontal scaling. The game state maps are module-level; restarting the server clears all rooms.

## 2. Module map

### Backend (`server/`, CommonJS)

| Module | Responsibility |
|--------|----------------|
| `index.js` | Entry point: builds the Express app, serves `public/`, attaches the WebSocket server, listens on `PORT`, optionally starts the ngrok tunnel. |
| `config.js` | Loads `.env` (dotenv) and exports `{ port, ngrokAuthtoken, ngrokEnabled }`. |
| `ws.js` | Owns the `WebSocketServer` and the single message router (switch on `data.type`). Dispatches to mode handlers; replies to `ping` with `pong`; logs and ignores unknown types. |
| `rooms.js` | `generateRoomId()` plus a **disconnect cleanup registry**: each mode module registers a `cleanup(ws)` callback, so the shared connection layer never reaches into mode-specific room maps. |
| `battle.js` | Battle mode: waiting queue, pairing, topic selection, progress/typing relay, submissions, winner logic. |
| `coop.js` | Co-op mode: waiting queue, pairing, category selection, progress relay, submissions, grading, timeout relay. |
| `questions.js` | Centralized bank loading + random question pick. Knows the two bank locations (see §5). |
| `ngrok.js` | Thin wrapper around `@ngrok/ngrok` `forward()`; only called when the tunnel is enabled and configured. |

### Frontend (`public/`)

| File | Role |
|------|------|
| `index.html` | Landing page (self-contained styles/scripts). |
| `menu.html` | Mode selection (self-contained). |
| `solo.html` + `solo-client.js` | Solo mode: fetches a topic bank itself, renders blanks, grades in the browser. |
| `multiplayer-battle.html` + `multiplayer-client-battle.js` | Battle mode client: pairing UI, topic pick, race, submission. |
| `multiplayer-coop.html` + `multiplayer-client-coop.js` | Co-op mode client: category pick, dual blank UI, timer, submission. |

### Data (`data/`, `public/questions/`, `scripts/`)

| Path | Role |
|------|------|
| `data/questions-coop/*.json` | Co-op banks. **Server-loaded only** — deliberately outside `public/` so answers are not statically downloadable. |
| `public/questions/*.json` | Solo banks. Fetched by the solo client in the browser, and read server-side by battle mode (shared banks; see §7 for the trade-off). |
| `scripts/validate-questions.js` | Guardrail: schema + mask/answer consistency for every bank; exits non-zero on failure. Runs in CI and as `npm run validate`. |

## 3. Runtime flow

```
browser ──HTTP──▶ Express ──▶ public/* (pages, client scripts, solo banks)
   │
   └──WebSocket──▶ server/ws.js router
                      ├──▶ server/battle.js ──▶ battleRooms (Map)
                      ├──▶ server/coop.js ────▶ coopRooms (Map)
                      └──▶ server/questions.js ──▶ reads bank JSON
                                ├── public/questions/<topic>.json   (battle)
                                └── data/questions-coop/<file>.json (co-op)
```

- Every WebSocket connection starts anonymous; the first `join_*` message places it in a mode's waiting queue.
- When a second player joins the same mode, a room id is generated, roles are assigned (`player1` = first waiter, `player2` = joiner), and both are notified.
- On disconnect (`close`), `ws.js` calls the `rooms.js` registry, which runs each mode's cleanup: clear the waiting slot if it was that socket, notify the partner, and delete the room.
- Grading happens **server-side for co-op** (server knows the answers) and **client-side for solo and battle** (clients hold the answers; see §7).

## 4. Game flows & WebSocket protocol

All messages are JSON with a `type` field. Unknown types are logged and ignored.

### 4.1 Battle mode

**Flow:** `join_battle` → paired (roles assigned) → 1.5 s later `battle_topic_selection` (random chooser) → chooser sends `topic_selected` → server loads a random question from `public/questions/<topic>.json` → both receive `battle_start` → both race; progress/typing is relayed live → each sends `battle_submit` → when both submitted, server computes `battle_result` (correct beats incorrect; then faster time wins; else tie).

| Client → server | Payload | Server → client | Payload |
|---|---|---|---|
| `join_battle` | — | `battle_role_assignment` | `{ role, status: "waiting"\|"paired" }` |
| `topic_selected` | `{ topic }` | `battle_topic_selection` | `{ chooser }` |
| `battle_progress` | `{ progress, filled, total }` | `battle_start` | `{ question }` |
| `typing_update` | `{ index, value }` | `opponent_progress` | `{ progress, filled, total }` |
| `battle_submit` | `{ time, correct, answers }` | `opponent_typing` | `{ index, value }` |
| `ping` | — | `battle_result` | `{ winner, yourTime, opponentTime }` |
| | | `opponent_disconnected` | — |
| | | `pong` | — |

Battle question shape (same as solo banks): `{ id, topic, question, code_snippet, answers[] }`. If a bank fails to load server-side, a built-in fallback question is used.

### 4.2 Co-op mode

**Flow:** `join_coop` → paired → player1 sends `coop_select_category` (`frontend_backend` maps to a random pick of `html_php`/`javascript_react`; `both_backends` maps to `backend_backend`) → server loads a random question from `data/questions-coop/<file>.json` → both receive `coop_game_start` → each player fills **their own** blanks simultaneously (partner's area is blurred) → each sends `coop_submit` → when both submitted, server grades all answers and sends `coop_results` → `coop_timeout` (client-driven) ends the round for both.

| Client → server | Payload | Server → client | Payload |
|---|---|---|---|
| `join_coop` | — | `coop_role_assignment` | `{ role, status: "waiting"\|"paired" }` |
| `coop_select_category` | `{ category, questionFile }` | `coop_category_selected` | `{ category }` |
| `coop_progress` | `{ progress, filled, total }` | `coop_game_start` | `{ question }` |
| `coop_submit` | `{ answers[] }` | `coop_partner_progress` | `{ progress, filled, total }` |
| `coop_timeout` | — | `coop_partner_submitted` | — |
| | | `coop_results` | `{ correctCount, totalBlanks }` |
| | | `coop_timeout` | — |
| | | `partner_disconnected` | — |

### 4.3 Removed legacy mode

The original `server.js` also implemented a generic "typing room" mode (`join` / `typing` / `update` / `player_disconnected`, with its own rooms map). **No frontend page ever used it** — its only client was the deleted `utils/client.js` — so it was removed during the server split. It remains recoverable from git history if a future mode needs it.

## 5. Data formats

### 5.1 Solo banks (`public/questions/*.json`)

```json
{
  "id": 4,
  "topic": "Loops",
  "question": "Print numbers 0 to 4 using a for-loop.",
  "code_snippet": "for ___ in range(5):\n    print(___)",
  "answers": ["i", "i"]
}
```

- `answers` are the expected values, **in the same left-to-right order as the `___` masks** in `code_snippet`.
- The solo client replaces each `___` with a text input and grades positionally (case- and quote-insensitive).
- Battle mode uses the same files and shape server-side.

### 5.2 Co-op banks (`data/questions-coop/*.json`)

Two question types, and **the answer field name depends on the type**:

**`frontend_backend`** — each player gets their own code block. Expected answers live in `player1.blanks` / `player2.blanks`:

```json
{
  "id": 1,
  "type": "frontend_backend",
  "category": "HTML + PHP",
  "description": "...",
  "player1": { "role": "Frontend (HTML Form)", "code": "<___ ...>", "blanks": ["form", "POST", "..."] },
  "player2": { "role": "Backend (PHP Processing)", "code": "<?php ... ?>", "blanks": ["POST", "..."] }
}
```

**`both_backends`** — both players edit the *same* `shared_code`. Expected answers live in `player1.answers` / `player2.answers`, and the code marks whose blank is whose with `P1_BLANK` / `P2_BLANK` tokens:

```json
{
  "id": 1,
  "type": "both_backends",
  "category": "Backend to Backend",
  "shared_code": "app.post('/api/login', ... req.P1_BLANK ... res.status(P2_BLANK) ...)",
  "player1": { "answers": ["body", "findOne", "compare", "sign"] },
  "player2": { "answers": ["404", "isValid", "JWT_SECRET", "24h"] }
}
```

- Client inputs are generated by replacing masks in order (`___` per player code block, or `P1_BLANK`/`P2_BLANK` occurrences in `shared_code`), so **answer array order must match mask order** — the same invariant as solo banks.
- Server grading (`server/coop.js`) reads `blanks` for `frontend_backend` and `answers` for `both_backends`, normalizing case and quotes before comparing.
- The validator (`scripts/validate-questions.js`) enforces: required fields, unique ids, mask-count = answer-count, and `P1_BLANK`/`P2_BLANK` token-count = answer-count.

## 6. Configuration

Defined in `server/config.js`, sourced from the process environment / `.env` (see `.env.example`):

| Variable | Default | Effect |
|----------|---------|--------|
| `PORT` | `3000` | HTTP + WS listen port. |
| `NGROK_AUTHTOKEN` | *(unset)* | Enables the ngrok tunnel at startup when set. |
| `NGROK_ENABLED` | `true` | `false` forces local-only mode even with a token. |

The tunnel is **opt-in**: no token → clean local start with a hint (this replaced an older design that always attempted a tunnel and sniffed `~/.ngrok2/ngrok.yml`).

## 7. Known issues & tech debt

Handover reality-check — things that work but are consciously not "production-grade":

1. **Solo answers are client-visible.** Solo banks (with answers) are served from `public/` because the solo client fetches and grades them in the browser. Battle reads the same files server-side. Moving them server-side would require duplicating banks or implementing server-side grading. The clean future fix is to grade solo answers over WebSocket.
2. **All page styling/JS is inline.** Each HTML page embeds its own `<style>`; shared CSS/JS is duplicated across pages. A future `assets/` split would deduplicate this (deliberately not done here to keep every public URL byte-identical).
3. **No persistence.** Rooms, scores, and in-progress games die on restart. Adding a store (Redis/SQLite) is the first step toward any production deployment.
4. **Single process, no scaling.** State lives in module-level `Map`s; multiple server instances would not share rooms. A Redis-backed room layer or sticky sessions would be needed first.
5. **No authentication or input hardening.** WS messages are trusted JSON; there are no rate limits, size caps beyond ws defaults, or identity checks. `coop_select_category` is accepted from `player1` only, but `coop_timeout` is trusted from either client.
6. **Client-driven timeout.** `coop_timeout` is sent by a client, not enforced by a server timer, so a tampering client can skip the time limit.
7. **Reconnect edge cases.** Clients retry connecting up to 5 times, but the server cannot re-attach a reconnecting socket to its old room (rooms are keyed by socket object). Mid-race disconnects end the room.
8. **`test` is a placeholder.** `npm test` currently runs the question validator. A real suite (e.g. `node:test`) should grow around the extracted modules — `server/coop.js` grading and `server/battle.js` winner logic are pure-ish and easy to test first.
9. **Removed legacy mode note.** The unused "typing room" WebSocket mode was removed in the reorganization (see §4.3); if you need it, recover it from git history rather than rediscovering it from the clients.
10. **Historical note — co-op grading.** During the 2026-10 reorganization, the co-op grading branches were audited and confirmed correct: `frontend_backend` banks store expected answers under `player*.blanks`, `both_backends` banks under `player*.answers`, and `server/coop.js` reads each accordingly. Do not "unify" these field names without migrating the bank JSON at the same time.

## 8. Handover notes

- **Run it:** `npm install && npm start` → http://localhost:3000. Online play: set `NGROK_AUTHTOKEN` in `.env`.
- **Check it:** `npm run validate` (banks) — CI additionally boots the server and curls all five pages.
- **Add a question bank:** drop the JSON in the right directory (§5), keep mask order = answer order, run `npm run validate`.
- **Add a new WS message type:** handle it in the `server/ws.js` router, implement the handler in the relevant mode module, and document it in §4 of this file.
- **Add a new game mode:** create `server/<mode>.js` (use `battle.js` as the template), register its message types in `ws.js`, register a disconnect cleanup in `rooms.js`, add its page + client under `public/`, and document the flow in §4.
