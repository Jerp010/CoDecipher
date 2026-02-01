// WebSocket connection
let ws;
let myRole = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Game State
let gameState = 'waiting'; // waiting, selecting, playing, finished
let selectedCategory = null;
let categoryType = null; // 'frontend_backend' or 'both_backends'

// Timer
let timeLimit = 300; // 5 minutes in seconds
let timeRemaining = timeLimit;
let timerInterval = null;
let startTime = null;

// Answers tracking - BOTH PLAYERS WORK SIMULTANEOUSLY
let myAnswers = [];
let myBlanks = 0;
let partnerProgress = 0;
let currentQuestion = null;
let bothSubmitted = false;

// DOM Elements
const waitingOverlay = document.getElementById('waitingOverlay');
const categoryOverlay = document.getElementById('categoryOverlay');
const resultsOverlay = document.getElementById('resultsOverlay');
const statusIndicator = document.getElementById('statusIndicator');
const timer = document.getElementById('timer');
const timerText = document.getElementById('timerText');
const startCoopBtn = document.getElementById('startCoopBtn');

const player1Card = document.getElementById('player1Card');
const player2Card = document.getElementById('player2Card');
const player1Name = document.getElementById('player1Name');
const player2Name = document.getElementById('player2Name');
const player1Badge = document.getElementById('player1Badge');
const player2Badge = document.getElementById('player2Badge');
const player1TaskLabel = document.getElementById('player1TaskLabel');
const player2TaskLabel = document.getElementById('player2TaskLabel');
const player1TaskDesc = document.getElementById('player1TaskDesc');
const player2TaskDesc = document.getElementById('player2TaskDesc');
const player1Code = document.getElementById('player1Code');
const player2Code = document.getElementById('player2Code');
const player1SubmitBtn = document.getElementById('player1SubmitBtn');
const player2SubmitBtn = document.getElementById('player2SubmitBtn');

// Progress bar elements
const player1ProgressText = document.getElementById('player1Progress');
const player2ProgressText = document.getElementById('player2Progress');
const player1ProgressBar = document.getElementById('player1ProgressBar');
const player2ProgressBar = document.getElementById('player2ProgressBar');

// Initialize WebSocket
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}`;
  
  console.log('Connecting to WebSocket:', wsUrl);
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    isConnected = true;
    reconnectAttempts = 0;
    statusIndicator.textContent = 'Connected';
    statusIndicator.className = 'status-item paired';
    
    // Join co-op mode
    ws.send(JSON.stringify({ type: 'join_coop' }));
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
    
    if (gameState === 'playing' && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
      setTimeout(initWebSocket, 2000);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Handle WebSocket Messages
function handleMessage(data) {
  switch (data.type) {
    case 'coop_role_assignment':
      handleRoleAssignment(data);
      break;
    case 'coop_category_selected':
      handleCategorySelected(data);
      break;
    case 'coop_game_start':
      handleGameStart(data);
      break;
    case 'coop_partner_progress':
      handlePartnerProgress(data);
      break;
    case 'coop_partner_submitted':
      handlePartnerSubmitted(data);
      break;
    case 'coop_results':
      handleResults(data);
      break;
    case 'coop_timeout':
      handleTimeout();
      break;
    case 'partner_disconnected':
      handlePartnerDisconnected();
      break;
    case 'pong':
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
}

// Handle Role Assignment
function handleRoleAssignment(data) {
  myRole = data.role;
  console.log('Assigned role:', myRole);
  
  if (data.status === 'waiting') {
    gameState = 'waiting';
    waitingOverlay.classList.remove('hidden');
    statusIndicator.textContent = 'Waiting for partner...';
    statusIndicator.className = 'status-item waiting';
  } else if (data.status === 'paired') {
    waitingOverlay.classList.add('hidden');
    statusIndicator.textContent = 'Paired!';
    statusIndicator.className = 'status-item paired';
    
    // Show category selection for player1
    if (myRole === 'player1') {
      showCategorySelection();
    } else {
      statusIndicator.textContent = 'Waiting for Player 1 to select category...';
    }
  }
  
  // Update badges
  if (myRole === 'player1') {
    player1Badge.textContent = 'YOU';
    player1Badge.classList.add('you');
    player2Badge.textContent = 'PARTNER';
  } else {
    player2Badge.textContent = 'YOU';
    player2Badge.classList.add('you');
    player1Badge.textContent = 'PARTNER';
  }
}

// Show Category Selection (Player 1 only)
function showCategorySelection() {
  categoryOverlay.classList.remove('hidden');
  gameState = 'selecting';
  
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      categoryCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCategory = card.dataset.category;
      startCoopBtn.disabled = false;
    });
  });
}

// Start Co-op Challenge
startCoopBtn.addEventListener('click', () => {
  if (!selectedCategory || myRole !== 'player1') return;
  
  categoryOverlay.classList.add('hidden');
  
  // Map category to JSON file
  let questionFile;
  if (selectedCategory === 'frontend_backend') {
    questionFile = Math.random() > 0.5 ? 'javascript_react' : 'html_php';
  } else {
    questionFile = 'backend_backend';
  }
  
  // Send category selection to server
  ws.send(JSON.stringify({
    type: 'coop_select_category',
    category: selectedCategory,
    questionFile: questionFile
  }));
  
  statusIndicator.textContent = 'Starting challenge...';
});

// Handle Category Selected
function handleCategorySelected(data) {
  categoryType = data.category;
  categoryOverlay.classList.add('hidden');
  
  console.log('Category selected:', categoryType);
}

// Handle Game Start - BOTH PLAYERS START SIMULTANEOUSLY
function handleGameStart(data) {
  currentQuestion = data.question;
  gameState = 'playing';
  console.log('Game started! Both players working simultaneously');
  
  // Start timer
  startTimer();
  
  // Display code for both players
  displayCoopCode(currentQuestion);
  
  // Enable my submit button
  if (myRole === 'player1') {
    player1SubmitBtn.disabled = false;
    statusIndicator.textContent = 'Solve your part!';
    statusIndicator.className = 'status-item paired';
  } else {
    player2SubmitBtn.disabled = false;
    statusIndicator.textContent = 'Solve your part!';
    statusIndicator.className = 'status-item paired';
  }
}

// Display Co-op Code with Blur Effect
function displayCoopCode(question) {
  if (categoryType === 'frontend_backend') {
    // Frontend + Backend: Different code for each player
    if (myRole === 'player1') {
      // Player 1 sees frontend code (clear)
      const myCodeHTML = createCodeWithBlanks(question.player1.code, true);
      player1Code.innerHTML = myCodeHTML;
      player1TaskLabel.textContent = question.player1.role || 'Frontend Task';
      player1TaskDesc.textContent = question.player1.hints || question.description || '';
      
      // Player 1 sees player 2's backend code (BLURRED)
      const partnerCodeHTML = createCodeWithBlanks(question.player2.code, false);
      player2Code.innerHTML = partnerCodeHTML;
      player2Code.style.filter = 'blur(4px)';
      player2Code.style.opacity = '0.6';
      player2Code.style.userSelect = 'none';
      player2TaskLabel.textContent = question.player2.role || 'Backend Task';
      player2TaskDesc.textContent = question.player2.hints || '';
      player2Card.classList.add('blurred');
      player1Card.classList.add('active');
      
    } else {
      // Player 2 sees backend code (clear)
      const myCodeHTML = createCodeWithBlanks(question.player2.code, true);
      player2Code.innerHTML = myCodeHTML;
      player2TaskLabel.textContent = question.player2.role || 'Backend Task';
      player2TaskDesc.textContent = question.player2.hints || question.description || '';
      
      // Player 2 sees player 1's frontend code (BLURRED)
      const partnerCodeHTML = createCodeWithBlanks(question.player1.code, false);
      player1Code.innerHTML = partnerCodeHTML;
      player1Code.style.filter = 'blur(4px)';
      player1Code.style.opacity = '0.6';
      player1Code.style.userSelect = 'none';
      player1TaskLabel.textContent = question.player1.role || 'Frontend Task';
      player1TaskDesc.textContent = question.player1.hints || '';
      player1Card.classList.add('blurred');
      player2Card.classList.add('active');
    }
  } else if (categoryType === 'both_backends') {
    // Both Backends: SAME CODE, DIFFERENT BLANKS
    const sharedCode = question.shared_code;
    
    if (myRole === 'player1') {
      // Player 1 sees their blanks (P1_BLANK) clearly
      const myCodeHTML = createBackendCodeWithBlanks(sharedCode, 'P1_BLANK', true);
      player1Code.innerHTML = myCodeHTML;
      player1TaskLabel.textContent = 'Backend (Your Part)';
      player1TaskDesc.textContent = question.description || question.player1_hints || '';
      
      // Player 2's blanks (P2_BLANK) shown as filled/blurred
      const partnerCodeHTML = createBackendCodeWithBlanks(sharedCode, 'P2_BLANK', false);
      player2Code.innerHTML = partnerCodeHTML;
      player2Code.style.filter = 'blur(4px)';
      player2Code.style.opacity = '0.6';
      player2Code.style.userSelect = 'none';
      player2TaskLabel.textContent = 'Backend (Partner Part)';
      player2Card.classList.add('blurred');
      player1Card.classList.add('active');
      
    } else {
      // Player 2 sees their blanks (P2_BLANK) clearly
      const myCodeHTML = createBackendCodeWithBlanks(sharedCode, 'P2_BLANK', true);
      player2Code.innerHTML = myCodeHTML;
      player2TaskLabel.textContent = 'Backend (Your Part)';
      player2TaskDesc.textContent = question.description || question.player2_hints || '';
      
      // Player 1's blanks (P1_BLANK) shown as filled/blurred
      const partnerCodeHTML = createBackendCodeWithBlanks(sharedCode, 'P1_BLANK', false);
      player1Code.innerHTML = partnerCodeHTML;
      player1Code.style.filter = 'blur(4px)';
      player1Code.style.opacity = '0.6';
      player1Code.style.userSelect = 'none';
      player1TaskLabel.textContent = 'Backend (Partner Part)';
      player1Card.classList.add('blurred');
      player2Card.classList.add('active');
    }
  }
  
  setupMyInputs();
}

// Create Code with Blanks (Frontend/Backend mode)
function createCodeWithBlanks(codeText, editable) {
  let blankIndex = 0;
  let html = String(codeText || ''); // Ensure it's a string
  
  // Replace ___ with input fields
  html = html.replace(/___/g, () => {
    if (editable) {
      return `<input type="text" class="blank-input my-blank" data-index="${blankIndex++}" autocomplete="off" spellcheck="false">`;
    } else {
      return `<span class="blank-placeholder">___</span>`;
    }
  });
  
  return html;
}

// Create Backend Code with Specific Blanks (Backend-to-Backend mode)
function createBackendCodeWithBlanks(codeText, blankType, editable) {
  let blankIndex = 0;
  let html = String(codeText || ''); // Ensure it's a string
  
  // Replace only the blanks for this player
  html = html.replace(/P1_BLANK|P2_BLANK/g, (match) => {
    if (match === blankType) {
      if (editable) {
        return `<input type="text" class="blank-input my-blank" data-index="${blankIndex++}" autocomplete="off" spellcheck="false">`;
      } else {
        return `<span class="blank-placeholder">___</span>`;
      }
    } else {
      // Other player's blank - show as placeholder
      return `<span class="blank-filled">•••</span>`;
    }
  });
  
  return html;
}

// Setup My Blank Inputs
function setupMyInputs() {
  const myCodeElement = myRole === 'player1' ? player1Code : player2Code;
  const inputs = myCodeElement.querySelectorAll('.my-blank');
  
  myBlanks = inputs.length;
  myAnswers = new Array(myBlanks).fill('');
  
  console.log(`Setting up ${myBlanks} inputs for ${myRole}`);
  
  inputs.forEach((input, index) => {
    // Input event
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      myAnswers[index] = value;
      
      // Visual feedback
      if (value) {
        e.target.classList.add('filled');
      } else {
        e.target.classList.remove('filled');
      }
      
      // Send progress to partner
      sendProgress();
    });
    
    // Tab navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = (index + 1) % inputs.length;
        inputs[nextIndex].focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitMyAnswer();
      }
    });
  });
  
  // Focus first input
  if (inputs.length > 0) {
    inputs[0].focus();
  }
}

// Send Progress to Partner (LIVE PROGRESS TRACKING)
function sendProgress() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  
  const filledCount = myAnswers.filter(a => a !== '').length;
  const progress = myBlanks > 0 ? Math.round((filledCount / myBlanks) * 100) : 0;
  
  // Update my own progress bar
  const myNumber = myRole === 'player1' ? 1 : 2;
  updateLocalProgress(myNumber, progress);
  
  ws.send(JSON.stringify({
    type: 'coop_progress',
    progress: progress,
    filled: filledCount,
    total: myBlanks
  }));
}

// Update local progress bar
function updateLocalProgress(playerNumber, progress) {
  const progressText = document.getElementById(`player${playerNumber}Progress`);
  const progressBar = document.getElementById(`player${playerNumber}ProgressBar`);
  
  if (progressText) progressText.textContent = `${progress}%`;
  if (progressBar) progressBar.style.width = `${progress}%`;
}

// Handle Partner Progress (LIVE UPDATES)
function handlePartnerProgress(data) {
  partnerProgress = data.progress;
  
  // Update partner's progress bar
  const partnerNumber = myRole === 'player1' ? 2 : 1;
  updateLocalProgress(partnerNumber, data.progress);
  
  // Update partner badge
  const partnerBadge = myRole === 'player1' ? player2Badge : player1Badge;
  partnerBadge.textContent = `PARTNER (${data.progress}%)`;
}

// Submit My Answer
player1SubmitBtn.addEventListener('click', () => { if (myRole === 'player1') submitMyAnswer(); });
player2SubmitBtn.addEventListener('click', () => { if (myRole === 'player2') submitMyAnswer(); });

function submitMyAnswer() {
  // Get fresh values from inputs
  const myCodeElement = myRole === 'player1' ? player1Code : player2Code;
  const inputs = myCodeElement.querySelectorAll('.my-blank');
  
  // Rebuild answers array from current input values
  const currentAnswers = Array.from(inputs).map(input => input.value.trim());
  
  console.log('Submitting answers:', currentAnswers);
  console.log('Total blanks:', inputs.length);
  
  // Check if all blanks are filled
  const allFilled = currentAnswers.every(a => a !== '');
  
  if (!allFilled) {
    const emptyCount = currentAnswers.filter(a => a === '').length;
    alert(`Please fill in all blanks before submitting! (${emptyCount} blank${emptyCount !== 1 ? 's' : ''} remaining)`);
    return;
  }
  
  // Disable my inputs and button
  const myButton = myRole === 'player1' ? player1SubmitBtn : player2SubmitBtn;
  
  inputs.forEach(input => {
    input.disabled = true;
  });
  myButton.disabled = true;
  
  // Send to server
  ws.send(JSON.stringify({
    type: 'coop_submit',
    answers: currentAnswers
  }));
  
  statusIndicator.textContent = 'Submitted! Waiting for partner...';
  statusIndicator.className = 'status-item waiting';
  bothSubmitted = true;
}

// Handle Partner Submitted
function handlePartnerSubmitted(data) {
  statusIndicator.textContent = 'Partner submitted! Calculating results...';
  statusIndicator.className = 'status-item paired';
}

// Handle Partner Disconnected
function handlePartnerDisconnected() {
  stopTimer();
  
  alert('Your partner has disconnected! Returning to menu...');
  
  if (ws) {
    ws.close();
  }
  
  setTimeout(() => {
    window.location.href = 'menu.html';
  }, 2000);
}

// Handle Results
function handleResults(data) {
  stopTimer();
  gameState = 'finished';
  
  const totalBlanks = data.totalBlanks;
  const correctCount = data.correctCount;
  const accuracy = Math.round((correctCount / totalBlanks) * 100);
  
  // Calculate grade
  let grade, gradeClass;
  if (accuracy >= 90) {
    grade = 'A';
    gradeClass = 'grade-a';
  } else if (accuracy >= 70) {
    grade = 'B';
    gradeClass = 'grade-b';
  } else if (accuracy >= 50) {
    grade = 'C';
    gradeClass = 'grade-c';
  } else {
    grade = 'F';
    gradeClass = 'grade-f';
  }
  
  // Calculate time taken
  const timeTaken = timeLimit - timeRemaining;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Display results
  document.getElementById('gradeDisplay').textContent = grade;
  document.getElementById('gradeDisplay').className = `grade-display ${gradeClass}`;
  document.getElementById('totalQuestions').textContent = totalBlanks;
  document.getElementById('correctAnswers').textContent = correctCount;
  document.getElementById('timeTaken').textContent = timeString;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
  
  resultsOverlay.classList.remove('hidden');
}

// Handle Timeout
function handleTimeout() {
  stopTimer();
  gameState = 'finished';
  
  document.getElementById('gradeDisplay').textContent = 'F';
  document.getElementById('gradeDisplay').className = 'grade-display grade-f';
  document.querySelector('.results-title').textContent = "⏰ Time's Up!";
  document.getElementById('totalQuestions').textContent = myBlanks * 2;
  document.getElementById('correctAnswers').textContent = '0';
  document.getElementById('timeTaken').textContent = '05:00';
  document.getElementById('accuracy').textContent = '0%';
  
  resultsOverlay.classList.remove('hidden');
}

// Timer Functions
function startTimer() {
  timer.classList.remove('hidden');
  startTime = Date.now();
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Warning at 1 minute
    if (timeRemaining <= 60) {
      timer.classList.add('warning');
      timerText.classList.add('warning');
    }
    
    // Time's up
    if (timeRemaining <= 0) {
      stopTimer();
      ws.send(JSON.stringify({ type: 'coop_timeout' }));
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// Heartbeat
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  console.log('Co-op multiplayer page loaded');
  initWebSocket();
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && (!ws || ws.readyState !== WebSocket.OPEN)) {
    console.log('Page visible, reconnecting...');
    initWebSocket();
  }
});