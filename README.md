# CoDecipher - Unmask the Code

**CoDecipher** is an interactive multiplayer coding game where players decipher masked code segments, fill in the blanks, and compete to master programming concepts. Built for the Hackathon Jam 2026 by Barney and Friends.

## 🎮 Game Overview

CoDecipher is a real-time coding challenge game where players must fill in masked blanks within code snippets. The game features multiple gameplay modes:

- **Solo Mode** - Practice your coding skills at your own pace
- **Battle Mode** - Compete head-to-head against another player
- **Co-op Mode** - Team up with another player to solve challenges together

### Supported Topics

The game includes questions across multiple programming topics:

| Category | Description |
|----------|-------------|
| C++ | C++ programming fundamentals |
| C# | C# and .NET concepts |
| Python | Python programming |
| SQL | Database and SQL queries |
| HTML/JS | Web development (HTML, JavaScript) |
| OOP | Object-Oriented Programming concepts |
| HTML/PHP | Server-side web development |
| JavaScript/React | React.js framework |
| Backend | Backend development concepts |

## 🚀 How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mimirasol/CoDecipher.git
   cd CoDecipher
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the server:

```bash
npm start
# or
node server.js
```

The server will start on **http://localhost:3000**

Open your browser and navigate to:
```
http://localhost:3000
```

### Running with ngrok (For Online Multiplayer)

The server automatically creates an ngrok tunnel when started, allowing you to play with friends online:

#### Option 1: Using ngrok CLI (Recommended)

1. Sign up at [ngrok.com](https://dashboard.ngrok.com/signup)
2. Get your authtoken from the [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Configure ngrok (run in Command Prompt or PowerShell):
   ```cmd
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
4. Start the server:
   ```bash
   npm start
   ```

#### Option 2: Using Environment Variable (Windows)

1. Set the environment variable in Command Prompt:
   ```cmd
   set NGROK_AUTHTOKEN=YOUR_AUTH_TOKEN
   ```
   Or in PowerShell:
   ```powershell
   $env:NGROK_AUTHTOKEN="YOUR_AUTH_TOKEN"
   ```
2. Start the server:
   ```bash
   npm start
   ```

#### Expected Output

The server will display the ngrok URL in the console:
```
🚀 Hackathon Server Started!
📍 Local URL: http://localhost:3000

🌐 Creating ngrok tunnel...
✅ Ngrok tunnel created: https://your-ngrok-url.ngrok.io
```

Share the ngrok URL with your friends to play together!

## 📁 Project Structure

```
CoDecipher/
├── server.js              # Main server (Express + WebSocket)
├── package.json           # Dependencies
├── public/
│   ├── index.html         # Landing page
│   ├── menu.html          # Game mode selection
│   ├── solo.html          # Solo mode game
│   ├── multiplayer-battle.html    # Battle mode
│   ├── multiplayer-coop.html      # Co-op mode
│   ├── solo-client.js     # Solo mode client
│   ├── multiplayer-client-battle.js   # Battle client
│   ├── multiplayer-client-coop.js     # Co-op client
│   ├── questions/         # Solo questions
│   └── questions-coop/   # Co-op questions
└── utils/
    ├── client.js          # Shared utilities
    └── start.js           # Startup utilities
```

## 🔧 Technology Stack

- **Backend**: Node.js, Express.js
- **Real-time**: WebSocket (ws)
- **Tunneling**: ngrok
- **Frontend**: HTML, CSS, JavaScript

## 🎯 How to Play

### Solo Mode
1. Select a topic category
2. Answer coding questions by filling in the blanks
3. Complete as many questions as you can

### Battle Mode
1. Two players compete in real-time
2. Players take turns selecting topics
3. First to answer correctly wins the round
4. Most correct answers wins the match

### Co-op Mode
1. Two players work together
2. Both players must fill in their blanks correctly
3. Complete challenges before time runs out

## 📝 License

ISC License

---

Built with ❤️ for Hackathon Jam 2026
