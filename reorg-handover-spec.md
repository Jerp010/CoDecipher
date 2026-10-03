# CoDecipher — Reorganization & Handover Spec

**Status:** Approved via interview (5 rounds of clarifying questions)
**Date:** 2026-10-03
**Scope:** Reorganize repository structure to professional conventions, split the server monolith into modules, remove dead code, add `.env`-based configuration, CI, a question-bank validator, and handover documentation (README rewrite + ARCHITECTURE.md). **No new features.**

---

## 1. Goal

Prepare the CoDecipher codebase (a multiplayer "fill-in-the-blank code" quiz game built for Hackathon Jam 2026 by team *Barney and Friends*) so it can be handed to a new team:

1. A clean, conventional folder structure with clear server/client/data separation.
2. A modular server instead of a single 550-line `server.js`.
3. All dead/prototype code removed (git history preserves tracked deletions).
4. Modern, documented configuration (`.env`), corrected package metadata, useful npm scripts.
5. Guardrails: CI workflow + question-bank validator.
6. Professional documentation: rewritten `README.md` and a new `ARCHITECTURE.md`.

---

## 2. Current State (verified inventory)

All 38 git-tracked files were inspected. Line counts from file reads.

| Path | Lines | Status / Problem |
|---|---|---|
| `server.js` | ~550 | Monolith: Express static serving **+** all WebSocket logic for 4 modes (see §2.1), room maps, question loading, scoring, ngrok startup, emoji logging. |
| `public/index.html` | 992 | Landing page. Inline CSS + JS (particle animation, page nav). |
| `public/menu.html` | 666 | Mode-selection page. Inline CSS + JS. |
| `public/solo.html` | ~850 | Solo mode page. Inline CSS. Loads `solo-client.js`. |
| `public/multiplayer-battle.html` | ~1244 | Battle mode page. Inline CSS. Loads `multiplayer-client-battle.js`. |
| `public/multiplayer-coop.html` | ~946 | Co-op mode page. Inline CSS. Loads `multiplayer-client-coop.js`. |
| `public/solo-client.js` | 299 | Solo game logic. Fetches `questions/{topic}.json` **client-side** (answers visible to player). |
| `public/multiplayer-client-battle.js` | 617 | Battle WS client (reconnect logic, state machine). |
| `public/multiplayer-client-coop.js` | 628 | Co-op WS client (reconnect logic, timer). |
| `public/LearningMode.jsx` | 256 | **Dead code.** Orphan React component; no page loads JSX. |
| `public/style.css` | — | **Dead code.** No `<link rel="stylesheet">` exists anywhere; all pages style inline. |
| `utils/client.js` | 298 | **Dead code.** Standalone WS client for a "typing room" mode no page uses. |
| `utils/start.js` | 48 | Startup wrapper; references `NGROK_SETUP.md` which **does not exist**; spawns `node server.js` via `execSync`. Superseded by new config design. |
| `mira_temp/` (11 files) | — | **Dead code.** React + framer-motion + Tailwind prototype (`Hero.jsx`, `SoloCoding.jsx`, …) with its own `package.json` (name `codecipher`, MIT). Not wired into anything; contains stray mid-file imports. |
| `public/questions/*.json` | 6 banks (e.g. python 142 lines) | Solo question banks: `c++.json`, `csharp.json`, `html_js.json`, `oop.json`, `python.json`, `sql.json`. ~10 questions each. **Answers served publicly** (solo grades in-browser). |
| `public/questions-coop/*.json` | 3 banks (e.g. backend_backend 77 lines) | Co-op banks: `backend_backend.json`, `html_php.json`, `javascript_react.json`. Types: `frontend_backend`, `both_backends`. **Server-loaded only** — safe to move off `public/`. |
| `package.json` | — | Problems: name `hackathon---multiplayer`; `main: index.js` (file doesn't exist); license ISC (inconsistent); no author; `test` is an echo stub; `nodemon` in devDeps but no `dev` script. |
| `README.md` | — | Good narrative but **structure diagram is wrong** (missing files, wrong paths, mentions `LearningMode.jsx`), references missing `NGROK_SETUP.md`, claims Node 14+ (Express 5 requires ≥18). |
| `.gitignore` | 1 | Only `node_modules`. Needs `.env`, `.kilo/`, `.freebuff/`, etc. |
| `.kilo/`, `.freebuff/`, `mira_temp/node_modules` (untracked) | — | AI-agent / tool workspace state. Untracked (deleting `.kilo/` loses it permanently). |
| `.gitattributes` | 1 | `* text=auto` (LF normalization). Keep. |

### 2.1 Server message-type inventory (from `server.js` switch)

- **Client → server:** `join`, `typing` (legacy), `join_battle`, `topic_selected`, `battle_progress`, `typing_update`, `battle_submit`, `join_coop`, `coop_select_category`, `coop_progress`, `coop_submit`, `coop_timeout`, `ping`.
- **Server → client:** `role_assignment`, `update`, `player_disconnected` (legacy), `battle_role_assignment`, `battle_topic_selection`, `battle_start`, `opponent_progress`, `opponent_typing`, `battle_result`, `coop_role_assignment`, `coop_category_selected`, `coop_game_start`, `coop_partner_progress`, `coop_partner_submitted`, `coop_results`, `coop_timeout`, `pong`.
- **The `join`/`typing`/`update` path is a 4th, unused "typing room" mode** — no HTML page sends those messages (verified: only 3 pages load client scripts, none sends `join`). Its only client was the unused `utils/client.js`.

### 2.2 Co-op scoring field layout — CORRECTED DURING IMPLEMENTATION

Initial analysis flagged `calculateCoopResults()` as buggy for reading `player1.blanks` on `frontend_backend` questions. **Implementation-time verification proved the code correct**: the two `frontend_backend` banks (`html_php.json`, `javascript_react.json`) store expected answers under `player1.blanks`/`player2.blanks`, and the `both_backends` bank (`backend_backend.json`) stores them under `player1.answers`/`player2.answers` — exactly matching the server's two branches. Blank-input order also matches in-memory replace order for every question checked. The scoring logic was therefore **left unchanged**; the "fix" named in decision D17 is withdrawn (applying it would have broken `frontend_backend` scoring).

---

## 3. Decisions (from interview)

| # | Topic | Decision |
|---|---|---|
| D1 | Refactor depth | **Split `server.js` into modules.** Reorg + move files + modular server. Behavior preserved except explicitly listed improvements. |
| D2 | Dead code | **Delete** `mira_temp/`, `public/LearningMode.jsx`, `public/style.css`, `utils/` entirely (all tracked → recoverable from git history). |
| D3 | Question banks | **Hybrid move** — server-loaded banks off `public/`. See §5.3 for the battle-bank refinement. |
| D4 | Behavior | **Free hand to polish** — small, documented improvements allowed (opt-in ngrok, professional logs, co-op scoring fix, config cleanup). |
| D5 | Module system | **Stay CommonJS** (`require`/`module.exports`). No ESM migration. |
| D6 | Configuration | **`.env` file** with committed `.env.example`. `dotenv`-style loading (add `dotenv` dependency). |
| D7 | Tooling | **npm scripts + corrected metadata**, and a **CI workflow**. *No* ESLint/Prettier, *no* test framework (user explicitly deselected both). |
| D8 | Docs | **`ARCHITECTURE.md`** + **full `README.md` rewrite**. No separate protocol doc or onboarding guide (protocol tables go in ARCHITECTURE.md). |
| D9 | Layout, public URLs, unused WS mode | **Delegated to implementer** — decisions in §5 with rationale, to be documented in ARCHITECTURE.md. |
| D10 | Git strategy | **Logical commits** — one commit per step (see §9). |
| D11 | Package identity | Name `hackathon---multiplayer` must go; **choose an entirely new name** (→ `codecipher`). Exact metadata delegated (§5.5). |
| D12 | Node version | **Node 20 LTS floor**: `"engines": {"node": ">=20"}`, CI on Node 20. |
| D13 | ngrok | **Opt-in**: tunnel only when `NGROK_AUTHTOKEN` is set (or explicitly enabled); clean local-only start otherwise. No more `~/.ngrok2/ngrok.yml` sniffing. |
| D14 | Data guardrail | **Question validator script run in CI.** |
| D15 | `.kilo/` (untracked) | **Leave in place + gitignore** (deleting would lose it permanently — not in git history). Same treatment for `.freebuff/`. |
| D16 | Log style | **Professional logs** — plain, timestamped; drop the emoji banner style. |
| D17 | Co-op scoring | Withdrawn on verification — logic already correct (see §2.2 correction). |
| D18 | LICENSE file | License field → MIT. Adding a root `LICENSE` file: confirm with user at implementation time if desired; not a blocker. |

---

## 4. Constraints & Non-Goals

- **Zero public URL changes.** Pages must remain at exactly: `/` (index), `/menu.html`, `/solo.html`, `/multiplayer-battle.html`, `/multiplayer-coop.html`. No client file is renamed or moved (only deletions of dead files).
- **WebSocket message protocol unchanged.** Message names, payload shapes, and flow stay identical for battle and co-op (the legacy unused mode is removed — see §5.4).
- **CommonJS only.** No build step, no bundler, no TypeScript.
- **No new frameworks or lint/test tooling** beyond `dotenv` and the validator script.
- Question bank **content** is untouched (only location of co-op banks moves).
- Solo mode stays client-graded (known limitation, documented — not fixed in this pass).
- Everything remains in-memory / single-process (rooms, scores not persisted — documented as tech debt, not fixed).

---

## 5. Design

### 5.1 Target structure (delegated decision D9 — chosen: `server/` + `data/` at root)

```
CoDecipher/
├── package.json               # name: codecipher, MIT, private, engines >=20
├── package-lock.json          # regenerated
├── README.md                  # full rewrite
├── ARCHITECTURE.md            # new
├── .env.example               # new: PORT, NGROK_AUTHTOKEN, NGROK_ENABLED
├── .gitignore                 # expanded
├── .gitattributes             # unchanged
├── .github/
│   └── workflows/
│       └── ci.yml             # new
├── server/                    # all backend code (CommonJS)
│   ├── index.js               # entry: config → express+http → static → ws → listen (+ optional ngrok)
│   ├── config.js              # dotenv load, env parsing, exports { port, ngrokAuthtoken, ngrokEnabled }
│   ├── ws.js                  # WebSocket.Server setup + message router (switch on data.type)
│   ├── rooms.js               # shared room helpers: generateRoomId, waiting-queue helpers, disconnect cleanup registry
│   ├── battle.js              # battle mode: join, topic selection, progress, submit, results
│   ├── coop.js                # co-op mode: join, category select, progress, submit, timeout, scoring (bug-fixed)
│   ├── questions.js           # bank loading + random question pick (server-side paths)
│   └── ngrok.js               # optional tunnel startup (opt-in)
├── data/
│   └── questions-coop/        # moved from public/questions-coop/ (server-loaded only)
│       ├── backend_backend.json
│       ├── html_php.json
│       └── javascript_react.json
├── scripts/
│   └── validate-questions.js  # new guardrail (§5.7)
└── public/                    # client assets — URLs unchanged
    ├── index.html
    ├── menu.html
    ├── solo.html
    ├── multiplayer-battle.html
    ├── multiplayer-coop.html
    ├── solo-client.js
    ├── multiplayer-client-battle.js
    ├── multiplayer-client-coop.js
    └── questions/             # solo banks stay here (client-fetched; see §5.3)
        ├── c++.json
        ├── csharp.json
        ├── html_js.json
        ├── oop.json
        ├── python.json
        └── sql.json
```

**Rationale (to record in ARCHITECTURE.md):** a root-level `server/` + `data/` split gives the clearest server/client/data separation for a no-build-step vanilla JS project, without the extra nesting of `src/` (which pays off only with a bundler). `public/` keeps only what the browser actually loads.

### 5.2 Server module breakdown

- **`server/index.js`** — thin entry point. Loads config, builds express app (`express.static(public)`), creates `http.Server`, attaches `WebSocket.Server`, registers mode handlers via `ws.js` router, starts listening, optionally starts ngrok. Professional startup logs: timestamped `listening on http://localhost:3000` etc.
- **`server/config.js`** — `require('dotenv').config()` then export `{ port, ngrokAuthtoken, ngrokEnabled }`. Rules:
  - `PORT` (default `3000`).
  - Tunnel runs **iff** `NGROK_AUTHTOKEN` is set **and** `NGROK_ENABLED !== 'false'`. Fresh clone with no `.env` → clean local-only start, one hint line pointing at `.env.example`.
  - **Remove** the old `~/.ngrok2/ngrok.yml` authtoken sniffing (and the Windows `USERPROFILE` fallback) — env/.env only.
- **`server/ws.js`** — owns the `wss` instance and the single message `switch`; dispatches to battle/coop handlers. Keeps `ping`→`pong` heartbeat. Unknown types: log + ignore (as today).
- **`server/rooms.js`** — `generateRoomId()`, waiting-player queue helpers, and a **disconnect cleanup registry**: today `handlePlayerDisconnect` reaches into all three room maps; after the split each mode module registers a `cleanup(ws)` callback so disconnect handling stays correct without cross-module reach-ins. Behavior identical.
- **`server/battle.js`** — battle room map + `handleBattleJoin`, `handleTopicSelection` (loads via `questions.js`), `handleBattleProgress`, `handleTypingUpdate`, `handleBattleSubmit` (incl. winner logic and the 1.5 s topic-selection `setTimeout`). Keep fallback question on load failure.
- **`server/coop.js`** — co-op room map + join/category/progress/submit/timeout handlers and `calculateCoopResults` **with the §2.2 bug fixed** (grade against the field the JSON actually uses — `player1.answers`/`player2.answers` — for both `frontend_backend` and `both_backends`; verify against both coop banks during implementation).
- **`server/questions.js`** — question loading paths centralized: solo banks remain at `public/questions/<topic>.json` (path exported for reuse), co-op banks at `data/questions-coop/<file>.json`.
- **`server/ngrok.js`** — wraps `@ngrok/ngrok` `forward()`; no-op when disabled; professional log line with the public URL when enabled.

### 5.3 Question bank placement (refinement of D3)

- **Co-op banks** → `data/questions-coop/`. Server-loaded only; removes answer exposure for co-op. ✅ (pure win)
- **Solo banks stay in `public/questions/`.** Battle and solo **share the same six files**: battle loads them server-side from `public/questions/`, solo fetches them client-side and grades in-browser. Moving "battle banks" to `data/` would force duplicating six files (bad) or breaking solo (worse). The client-visible answers for solo mode remain a **documented known issue** (future fix = server-side grading).
- Consequence: solo answers remain downloadable — documented in ARCHITECTURE.md → Known Issues.

### 5.4 Legacy unused multiplayer mode (delegated decision — chosen: remove)

Delete the `join`/`typing`/`update`/`player_disconnected` path and the `rooms` Map from the server (no page uses it; its only client `utils/client.js` is deleted per D2). Document the removal in ARCHITECTURE.md (with a note that git history preserves it) and mention it in the refactor commit message. Rationale: handing a new team protocol surface that has no frontend is misleading; ARCHITECTURE.md will note how to resurrect it if ever needed.

### 5.5 package.json (delegated decision — chosen metadata)

```json
{
  "name": "codecipher",
  "version": "1.0.0",
  "description": "CoDecipher — multiplayer fill-in-the-blank coding quiz game (Hackathon Jam 2026, Barney and Friends)",
  "main": "server/index.js",
  "private": true,
  "license": "MIT",
  "author": "Barney and Friends",
  "type": "commonjs",
  "engines": { "node": ">=20" },
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "validate": "node scripts/validate-questions.js",
    "test": "npm run validate"
  },
  "dependencies": { "express": "^5.2.1", "ws": "^8.19.0", "@ngrok/ngrok": "^1.7.0", "dotenv": "^16" },
  "devDependencies": { "nodemon": "^3.1.11" }
}
```

Notes:
- `"test": "npm run validate"` — pragmatic placeholder so `npm test` and CI have a meaningful default until the team adds real tests (user declined a test framework).
- Keep `repository` / `bugs` / `homepage` fields. `package-lock.json` regenerates on `npm install` after the rename.

### 5.6 CI workflow (`.github/workflows/ci.yml`)

- **Triggers:** `push` + `pull_request` on `main`.
- **Job (ubuntu-latest, Node 20, `cache: npm`):**
  1. `npm ci`
  2. `npm run validate` — question-bank guardrail
  3. **Smoke test:** start `node server/index.js` with `PORT=3999`, wait for listen, `curl -f http://localhost:3999/` (expect 200) and `curl -f http://localhost:3999/menu.html`; kill server. No ngrok (no token in CI → opt-in behavior exercised).
- No ESLint step (per D7).

### 5.7 Question validator (`scripts/validate-questions.js`)

Zero-dependency Node script; exits non-zero on any failure; prints a per-file summary. Checks every bank in `public/questions/` and `data/questions-coop/`:

- Valid JSON, non-empty array; unique `id`s.
- **Solo banks:** each question has `id`, `topic`, `question`, `code_snippet`, `answers`; number of `___` occurrences in `code_snippet` equals `answers.length`; no empty answers.
- **Co-op banks:** has `type` (`frontend_backend` | `both_backends`), `description`, `shared_code`, `player1`/`player2` objects with `answers` arrays; `P1_BLANK` / `P2_BLANK` token counts in `shared_code` are consistent with the declared per-player answer usage; `type`-specific field checks (this is exactly the check that would have caught bug §2.2).
- Wire into `npm run validate` and CI.

### 5.8 `.gitignore` additions

```
node_modules/
.env
.kilo/
.freebuff/
mira_temp/node_modules/   # (moot after mira_temp deletion; harmless)
```

### 5.9 README rewrite (full)

Structure: What it is (1-para pitch + 3 game modes) → Quickstart (`git clone`, `npm install`, `cp .env.example .env`, `npm start`, open `http://localhost:3000`) → Environment variables table (`PORT`, `NGROK_AUTHTOKEN`, `NGROK_ENABLED`) → Online multiplayer with ngrok (opt-in; where to get a token; note free-tier URLs change per run) → Project structure (the real tree from §5.1) → Adding questions (file locations, schema summary, "run `npm run validate`") → Tech stack → Contributing notes pointing to ARCHITECTURE.md → License (MIT). Fix all stale claims: Node ≥ 20, no `NGROK_SETUP.md` reference, accurate structure diagram, corrected ports/instructions. Keep the friendly tone but professional formatting.

### 5.10 ARCHITECTURE.md outline

1. **Overview** — what the app is; single-process Node server; vanilla JS frontend; in-memory rooms.
2. **Module map** — table of `server/*.js` responsibilities (§5.2) + `public/` client pages/scripts + `data/`.
3. **Runtime flow** — request → static; WS connection → router → mode handlers → room maps; disconnect cleanup registry.
4. **Game flows** — per-mode sequence descriptions (solo fetch-and-grade; battle: join → pair → topic vote → race → submit → winner; coop: join → pair → category → dual blanks → both submit → scoring), each with its client↔server message tables (the full protocol reference from §2.1 minus the removed legacy mode).
5. **Data formats** — solo bank schema; co-op bank schema (`frontend_backend` vs `both_backends`, `P1_BLANK`/`P2_BLANK` convention); where banks live and why solo's stay public.
6. **Configuration** — env vars, opt-in ngrok behavior.
7. **Known issues & tech debt** — solo answers client-visible; all page CSS/JS inline (duplication across 5 HTML files); no persistence (rooms/scores die on restart); single process / no scaling; no auth or input hardening on WS messages; co-op `coop_timeout` trusts the client; reconnect edge cases; removed legacy "typing room" mode note (recoverable from history); the co-op scoring bug that was fixed here (so the team knows why the code reads `answers`).
8. **Handover notes** — how to run, validate, and where to add question banks.

---

## 6. Edge Cases & Risks

| Risk | Mitigation |
|---|---|
| Battle reads solo's public banks server-side — path refactor must not break either consumer | Centralize in `server/questions.js`; smoke test battle flow manually after split |
| Relative client fetch `questions/${topic}.json` depends on `public/` layout | Solo banks untouched; zero URL/asset-path changes (constraint §4) |
| `.env` accidentally committed | Ignored from day one (§5.8); `.env.example` committed instead |
| Disconnect cleanup spans mode modules after split | Cleanup registry pattern (§5.2); manually test mid-game disconnect in both modes |
| `frontend_backend` scoring fix could regress `both_backends` | Fix reads the actual JSON fields; validator (§5.7) asserts field consistency for both types |
| Package rename churns `package-lock.json` | Regenerate once via `npm install`; commit alongside package.json |
| Deleting tracked files looks scary in review | Logical commits (§9) isolate the deletion commit; git history preserves everything |
| `.kilo/` untracked (deletion would be permanent) | Left in place, gitignored (D15) |
| CI smoke test flakiness (port waits) | Poll-with-retry loop on `curl` before asserting; fixed test port 3999 |

## 7. Manual Verification Plan (post-implementation)

1. `npm start` with no `.env` → boots cleanly on :3000, **no ngrok attempt**, professional logs.
2. With `NGROK_AUTHTOKEN` set → tunnel starts, URL logged.
3. `curl` each of the 5 page URLs → 200 (URLs unchanged).
4. Solo: pick topic, answer questions, score works (`questions/*.json` still fetched).
5. Battle: two browser tabs → pair → topic select → race → correct winner logic; mid-game tab close → opponent gets `opponent_disconnected`.
6. Co-op: two tabs → category → both submit → **scores correct now (bug fix)**; `coop_timeout` still propagates.
7. `npm run validate` passes on all 9 banks; CI green.
8. `grep` for references to deleted paths (`mira_temp`, `utils/`, `style.css`, `LearningMode`) → zero hits in tracked files.

## 8. Out of Scope (explicitly)

- Server-side grading for solo mode, user accounts/auth, persistence (DB), scaling, lint/format tooling, test framework, any UI/UX redesign, question content changes, ESM/TypeScript migration.

## 9. Commit Plan (logical commits, in order)

1. `chore: remove unused prototype and dead code` — delete `mira_temp/`, `public/LearningMode.jsx`, `public/style.css`, `utils/` (message notes git history preserves them).
2. `refactor(server): split server.js into server/ modules` — behavior parity; includes removing the unused legacy multiplayer mode (noted in message).
3. `refactor(data): move co-op question banks to data/ and add question validator` — new `scripts/validate-questions.js`, `npm run validate`.
4. `feat(config): .env support, opt-in ngrok, professional logging` — `dotenv`, `.env.example`, config module. (D17 withdrawn: co-op scoring verified correct, no fix needed.)
5. `chore: correct package metadata, npm scripts, engines, gitignore` — package.json/lock, `.gitignore`.
6. `ci: add GitHub Actions workflow (validate + server smoke test)`.
7. `docs: rewrite README and add ARCHITECTURE.md`.

*(Exact order of 5–7 may flex; docs last so they describe the final state.)*
