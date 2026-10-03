# CoDecipher — Unmask the Code

**CoDecipher** is a real-time multiplayer coding game: players fill in masked blanks (`___`) inside code snippets and race or team up to master programming concepts. Built for Hackathon Jam 2026 by *Barney and Friends*.

## Game modes

| Mode | What happens |
|------|--------------|
| **Solo** | Practice at your own pace: pick a topic, answer 10 fill-in-the-blank questions, track your score. |
| **Battle** | Two players race head-to-head on the same question; fastest fully-correct submission wins the round. |
| **Co-op** | Two players work on the same challenge simultaneously — each fills their own half (e.g. frontend + backend), and combined answers are scored. |

**Topics:** C++, C#, Python, SQL, HTML/JS, OOP (solo) · HTML/PHP, JavaScript/React, Backend (co-op).

## Quickstart

Prerequisites: **Node.js ≥ 20** and npm.

```bash
git clone https://github.com/mimirasol/CoDecipher.git
cd CoDecipher
npm install
cp .env.example .env   # optional - see Environment variables below
npm start
```

Open **http://localhost:3000** — that's the whole local setup.

Common commands:

| Command | What it does |
|---------|--------------|
| `npm start` | Start the server on `PORT` (default 3000). |
| `npm run dev` | Same, with automatic restart on file changes (nodemon). |
| `npm run validate` | Validate all question banks (schema + mask/answer consistency). |
| `npm test` | Runs the validator (placeholder until a test suite is added). |

## Environment variables

Configuration comes from the process environment or a `.env` file in the project root (see `.env.example`). Everything is optional.

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | HTTP + WebSocket port. |
| `NGROK_AUTHTOKEN` | *(unset)* | ngrok authtoken. When set, an online-play tunnel is created at startup. |
| `NGROK_ENABLED` | `true` | Set to `false` to force local-only mode even when a token is present. |

**ngrok is opt-in.** Without a token the server simply runs locally and prints a hint — no errors.

## Online multiplayer with ngrok

1. Sign up at [ngrok.com](https://dashboard.ngrok.com/signup) (free).
2. Copy your authtoken from the [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken).
3. Put it in your `.env`:
   ```
   NGROK_AUTHTOKEN=your_token_here
   ```
4. `npm start` — the console prints a public `https://...ngrok...` URL. Share it; friends open it and pick a multiplayer mode.

Notes: free-tier ngrok URLs change every run, and the tunnel exists only while the server runs.

## Project structure

```
CoDecipher/
├── server/                 # Node backend (Express + ws), CommonJS
│   ├── index.js            # Entry point: config → static → WebSocket → listen
│   ├── config.js           # .env loading + env var parsing
│   ├── ws.js               # WebSocket server + message router
│   ├── rooms.js            # Room-id generation + disconnect cleanup registry
│   ├── battle.js           # Battle mode handlers
│   ├── coop.js             # Co-op mode handlers (incl. scoring)
│   ├── questions.js        # Question-bank loading (battle + co-op)
│   └── ngrok.js            # Optional tunnel startup
├── data/
│   └── questions-coop/     # Co-op question banks (server-loaded, not public)
├── public/                 # Everything the browser loads (URLs unchanged)
│   ├── index.html          # Landing page
│   ├── menu.html           # Mode selection
│   ├── solo.html           # Solo mode page
│   ├── multiplayer-battle.html
│   ├── multiplayer-coop.html
│   ├── solo-client.js      # Solo mode client logic
│   ├── multiplayer-client-battle.js
│   ├── multiplayer-client-coop.js
│   └── questions/          # Solo question banks (fetched by the browser)
├── scripts/
│   └── validate-questions.js  # CI guardrail for question banks
├── .github/workflows/ci.yml   # Validate + boot smoke test
├── ARCHITECTURE.md         # How everything fits together - read this next
└── .env.example            # Template for local configuration
```

## Adding questions

- **Solo topics** live in `public/questions/<topic>.json` (also reused by battle mode).
- **Co-op banks** live in `data/questions-coop/<file>.json` (server-loaded only, so their answers are not publicly downloadable).

Each solo question looks like:

```json
{
  "id": 1,
  "topic": "Loops",
  "question": "Print numbers 0 to 4 using a for-loop.",
  "code_snippet": "for ___ in ___(___):\n    print(___)",
  "answers": ["i", "range", "5", "i"]
}
```

The number of `___` masks **must equal** the number of answers (mask order = answer order). Co-op banks have their own per-player schema — see [ARCHITECTURE.md](ARCHITECTURE.md#data-formats).

After editing any bank, run `npm run validate` — CI runs the same check on every pull request.

## Tech stack

- **Backend:** Node.js (CommonJS), Express 5, `ws` (WebSocket)
- **Frontend:** vanilla HTML/CSS/JS, no build step
- **Tunneling:** `@ngrok/ngrok` (opt-in)
- **Config:** `dotenv`

## Contributing

Start with [ARCHITECTURE.md](ARCHITECTURE.md) for the module map, WebSocket protocol reference, and known limitations. Keep the WebSocket message protocol backward-compatible, and run `npm run validate` before submitting question changes.

## License

[MIT](LICENSE) — originally built by *Barney and Friends* for Hackathon Jam 2026.
