// WebSocket connection
let ws;
let myRole = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// DOM elements
const player1Text = document.getElementById('player1Text');
const player2Text = document.getElementById('player2Text');
const roleStatus = document.getElementById('roleStatus');
const connectionStatus = document.getElementById('connectionStatus');
const player1Section = document.getElementById('player1Section');
const player2Section = document.getElementById('player2Section');
const player1Typing = document.getElementById('player1Typing');
const player2Typing = document.getElementById('player2Typing');
const connectionOverlay = document.getElementById('connectionOverlay');
const overlayMessage = document.getElementById('overlayMessage');

// Typing indicators timeout
let typingTimeout1, typingTimeout2;

// Initialize WebSocket connection
function initWebSocket() {
  // Detect WebSocket URL (localhost or ngrok/public URL)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}`;
  
  console.log('Connecting to WebSocket:', wsUrl);
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    isConnected = true;
    reconnectAttempts = 0;
    updateConnectionStatus('Connected', 'paired');
    
    // Send join request
    ws.send(JSON.stringify({ type: 'join' }));
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      
      handleMessage(data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    isConnected = false;
    updateConnectionStatus('Disconnected', 'disconnected');
    
    // Attempt to reconnect
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
      setTimeout(initWebSocket, 2000);
    } else {
      console.error('Max reconnection attempts reached');
      showOverlay('Connection lost. Please refresh the page.');
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Handle incoming WebSocket messages
function handleMessage(data) {
  switch (data.type) {
    case 'role_assignment':
      handleRoleAssignment(data);
      break;
    
    case 'update':
      handleTextUpdate(data);
      break;
    
    case 'player_disconnected':
      handlePlayerDisconnect(data);
      break;
    
    case 'pong':
      // Heartbeat response
      break;
    
    default:
      console.log('Unknown message type:', data.type);
  }
}

// Handle role assignment
function handleRoleAssignment(data) {
  myRole = data.role;
  console.log('Assigned role:', myRole);
  
  // Update role status
  roleStatus.textContent = `You are ${myRole === 'player1' ? 'Player 1' : 'Player 2'}`;
  roleStatus.className = 'status paired';
  
  // Configure editable areas based on role
  if (myRole === 'player1') {
    setupPlayer1();
  } else {
    setupPlayer2();
  }
  
  // Handle waiting/paired status
  if (data.status === 'waiting') {
    showOverlay('Waiting for Player 2 to join...');
  } else if (data.status === 'paired') {
    hideOverlay();
    updateConnectionStatus('Paired with opponent', 'paired');
  }
}

// Setup for Player 1
function setupPlayer1() {
  console.log('Setting up Player 1');
  
  // Player 1 can edit their own textarea
  player1Text.readOnly = false;
  player1Text.classList.remove('readonly');
  player1Section.classList.add('active');
  
  // Player 2's textarea is readonly for Player 1
  player2Text.readOnly = true;
  player2Text.classList.add('readonly');
  player2Section.classList.remove('active');
  
  // Prevent any interaction with Player 2's textarea
  preventInteraction(player2Text);
  
  // Add input listener for Player 1
  player1Text.addEventListener('input', () => {
    sendTyping('player1', player1Text.value);
    showTypingIndicator('player1');
  });
}

// Setup for Player 2
function setupPlayer2() {
  console.log('Setting up Player 2');
  
  // Player 2 can edit their own textarea
  player2Text.readOnly = false;
  player2Text.classList.remove('readonly');
  player2Section.classList.add('active');
  
  // Player 1's textarea is readonly for Player 2
  player1Text.readOnly = true;
  player1Text.classList.add('readonly');
  player1Section.classList.remove('active');
  
  // Prevent any interaction with Player 1's textarea
  preventInteraction(player1Text);
  
  // Add input listener for Player 2
  player2Text.addEventListener('input', () => {
    sendTyping('player2', player2Text.value);
    showTypingIndicator('player2');
  });
}

// Prevent all interaction with a textarea
function preventInteraction(textarea) {
  // Prevent focus
  textarea.addEventListener('mousedown', (e) => {
    e.preventDefault();
    return false;
  });
  
  textarea.addEventListener('focus', (e) => {
    e.preventDefault();
    textarea.blur();
    return false;
  });
  
  // Prevent selection
  textarea.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Prevent keyboard input
  textarea.addEventListener('keydown', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Make it visually unselectable
  textarea.style.userSelect = 'none';
  textarea.style.cursor = 'not-allowed';
}

// Send typing update to server
function sendTyping(player, text) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'typing',
      player: player,
      text: text
    }));
    console.log(`Sent typing update for ${player}:`, text.substring(0, 50));
  }
}

// Handle text update from other player
function handleTextUpdate(data) {
  console.log(`Received update from ${data.player}:`, data.text.substring(0, 50));
  
  if (data.player === 'player1' && myRole === 'player2') {
    // Update Player 1's textarea for Player 2
    player1Text.value = data.text;
    showTypingIndicator('player1');
  } else if (data.player === 'player2' && myRole === 'player1') {
    // Update Player 2's textarea for Player 1
    player2Text.value = data.text;
    showTypingIndicator('player2');
  }
}

// Show typing indicator
function showTypingIndicator(player) {
  if (player === 'player1') {
    player1Typing.classList.add('active');
    clearTimeout(typingTimeout1);
    typingTimeout1 = setTimeout(() => {
      player1Typing.classList.remove('active');
    }, 1000);
  } else {
    player2Typing.classList.add('active');
    clearTimeout(typingTimeout2);
    typingTimeout2 = setTimeout(() => {
      player2Typing.classList.remove('active');
    }, 1000);
  }
}

// Handle player disconnect
function handlePlayerDisconnect(data) {
  console.log('Player disconnected:', data.disconnectedPlayer);
  updateConnectionStatus('Opponent disconnected', 'disconnected');
  showOverlay('Your opponent has disconnected. Waiting for reconnection...');
  
  // Disable editing while opponent is disconnected
  if (myRole === 'player1') {
    player1Text.readOnly = true;
  } else {
    player2Text.readOnly = true;
  }
}

// Update connection status display
function updateConnectionStatus(message, statusClass) {
  connectionStatus.textContent = message;
  connectionStatus.className = `status ${statusClass}`;
}

// Show connection overlay
function showOverlay(message) {
  overlayMessage.textContent = message;
  connectionOverlay.style.display = 'flex';
}

// Hide connection overlay
function hideOverlay() {
  connectionOverlay.style.display = 'none';
}

// Heartbeat to keep connection alive
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000); // Every 30 seconds

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, initializing WebSocket...');
  initWebSocket();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && (!ws || ws.readyState !== WebSocket.OPEN)) {
    console.log('Page visible, reconnecting...');
    initWebSocket();
  }
});