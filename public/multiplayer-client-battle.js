// WebSocket connection
let ws;
let myRole = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Game State
let gameState = 'waiting'; // waiting, topic_selection, countdown, racing, finished
let currentQuestion = null;
let startTime = null;
let timerInterval = null;
let myAnswers = [];
let totalBlanks = 0;
let correctAnswers = [];
let selectedTopic = null;

// DOM elements
const waitingOverlay = document.getElementById('waitingOverlay');
const topicSelectionOverlay = document.getElementById('topicSelectionOverlay');
const countdownOverlay = document.getElementById('countdownOverlay');
const winnerOverlay = document.getElementById('winnerOverlay');
const statusIndicator = document.getElementById('statusIndicator');
const timer = document.getElementById('timer');
const cancelButton = document.getElementById('cancelButton');
const cancelWaiting = document.getElementById('cancelWaiting');
const submitButton = document.getElementById('submitButton');
const confirmTopicBtn = document.getElementById('confirmTopicBtn');

const yourCard = document.getElementById('yourCard');
const opponentCard = document.getElementById('opponentCard');
const yourProgress = document.getElementById('yourProgress');
const opponentProgress = document.getElementById('opponentProgress');
const yourCode = document.getElementById('yourCode');
const opponentCode = document.getElementById('opponentCode');
const yourQuestion = document.getElementById('yourQuestion');
const opponentQuestion = document.getElementById('opponentQuestion');

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
    statusIndicator.textContent = 'Connected';
    statusIndicator.className = 'status-item paired';
    
    // Send join request for battle
    ws.send(JSON.stringify({ type: 'join_battle' }));
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
    
    // Attempt to reconnect if racing
    if (gameState === 'racing' && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
      statusIndicator.textContent = `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;
      statusIndicator.className = 'status-item waiting';
      setTimeout(initWebSocket, 2000);
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      alert('Connection lost. Please refresh the page.');
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Handle incoming WebSocket messages
function handleMessage(data) {
  switch (data.type) {
    case 'battle_role_assignment':
      handleRoleAssignment(data);
      break;
    
    case 'battle_topic_selection':
      handleTopicSelection(data);
      break;
    
    case 'battle_start':
      handleBattleStart(data);
      break;
    
    case 'opponent_progress':
      handleOpponentProgress(data);
      break;
    
    case 'opponent_typing':
      handleOpponentTyping(data);
      break;
    
    case 'battle_result':
      handleBattleResult(data);
      break;
    
    case 'opponent_disconnected':
      handleOpponentDisconnect();
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
  
  // Update UI based on role
  if (myRole === 'player1') {
    yourCard.style.order = '1';
    opponentCard.style.order = '2';
  } else {
    yourCard.style.order = '1';
    opponentCard.style.order = '2';
  }
  
  if (data.status === 'waiting') {
    gameState = 'waiting';
    showWaitingOverlay();
    statusIndicator.textContent = 'Waiting for opponent...';
    statusIndicator.className = 'status-item waiting';
    cancelButton.classList.remove('hidden');
  } else if (data.status === 'paired') {
    hideWaitingOverlay();
    statusIndicator.textContent = 'Paired! Get ready...';
    statusIndicator.className = 'status-item paired';
    cancelButton.classList.add('hidden');
    
    // Topic selection will be triggered by server
  }
}

// Handle Topic Selection
function handleTopicSelection(data) {
  console.log('Topic selection phase:', data);
  
  if (data.chooser === myRole) {
    // This player chooses the topic
    gameState = 'topic_selection';
    hideWaitingOverlay();
    showTopicSelection();
    statusIndicator.textContent = 'Choose a topic!';
    statusIndicator.className = 'status-item paired';
    console.log('You are choosing the topic');
  } else {
    // Waiting for opponent to choose
    gameState = 'waiting_for_topic';
    hideWaitingOverlay();
    statusIndicator.textContent = 'Opponent choosing topic...';
    statusIndicator.className = 'status-item waiting';
    
    console.log('Waiting for opponent to choose topic');
  }
}

// Show Topic Selection
function showTopicSelection() {
  topicSelectionOverlay.style.display = 'flex';
  
  // Add click handlers to topic cards
  const topicCards = document.querySelectorAll('.topic-card');
  topicCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove selected from all
      topicCards.forEach(c => c.classList.remove('selected'));
      
      // Add selected to this card
      card.classList.add('selected');
      
      // Store selected topic
      selectedTopic = card.dataset.topic;
      
      // Enable confirm button
      confirmTopicBtn.disabled = false;
      
      console.log('Selected topic:', selectedTopic);
    });
  });
  
  // Confirm button handler
  confirmTopicBtn.addEventListener('click', () => {
    if (!selectedTopic) {
      alert('Please select a topic first!');
      return;
    }
    
    console.log('Confirming topic:', selectedTopic);
    
    // Send topic selection to server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'topic_selected',
        topic: selectedTopic
      }));
    }
    
    // Hide topic selection
    topicSelectionOverlay.style.display = 'none';
    
    // Show waiting for question
    statusIndicator.textContent = 'Loading question...';
    statusIndicator.className = 'status-item waiting';
  }, { once: true });
}

// Handle Battle Start
function handleBattleStart(data) {
  console.log('Battle starting!', data);
  
  // Hide topic selection if visible
  topicSelectionOverlay.style.display = 'none';
  
  currentQuestion = data.question;
  correctAnswers = currentQuestion.answers.map(a => a.toLowerCase().replace(/['"]/g, ''));
  
  // Display question on both sides
  yourQuestion.textContent = currentQuestion.question;
  opponentQuestion.textContent = currentQuestion.question;
  
  // Start countdown
  startCountdown();
}

// Start Countdown (3-2-1-GO!)
function startCountdown() {
  gameState = 'countdown';
  countdownOverlay.style.display = 'flex';
  const countdownNumber = document.getElementById('countdownNumber');
  
  let count = 3;
  countdownNumber.textContent = count;
  countdownNumber.className = 'countdown-number';
  
  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNumber.textContent = count;
      countdownNumber.className = 'countdown-number';
      // Trigger reflow to restart animation
      void countdownNumber.offsetWidth;
    } else {
      countdownNumber.textContent = 'GO!';
      countdownNumber.className = 'countdown-go';
      clearInterval(countdownInterval);
      
      setTimeout(() => {
        countdownOverlay.style.display = 'none';
        startBattle();
      }, 1000);
    }
  }, 1000);
}

// Start the Battle
function startBattle() {
  gameState = 'racing';
  statusIndicator.textContent = 'Racing!';
  statusIndicator.className = 'status-item paired';
  
  // Display code with blanks
  displayQuestion();
  
  // Start timer counting up
  startTime = Date.now();
  startTimer();
  
  // Enable submit button
  submitButton.disabled = false;
}

// Display Question with Blanks
function displayQuestion() {
  // Create code with blank inputs
  const codeHTML = createCodeWithBlanks(currentQuestion.code_snippet);
  yourCode.innerHTML = codeHTML;
  
  // Opponent side shows same code but inputs are disabled
  const opponentCodeHTML = createCodeWithBlanks(currentQuestion.code_snippet, true);
  opponentCode.innerHTML = opponentCodeHTML;
  
  // Get all blank inputs
  const blankInputs = yourCode.querySelectorAll('.blank-input');
  totalBlanks = blankInputs.length;
  myAnswers = new Array(totalBlanks).fill('');
  
  // Add event listeners
  blankInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      myAnswers[index] = value;
      
      // Visual feedback - only show if filled
      if (value) {
        e.target.classList.add('filled');
        
        // Check if this answer is correct
        const normalizedAnswer = value.toLowerCase().replace(/['"]/g, '');
        const isCorrect = normalizedAnswer === correctAnswers[index];
        
        if (isCorrect) {
          e.target.classList.add('correct');
          e.target.classList.remove('incorrect');
        } else {
          // Remove correct class if it was there before
          e.target.classList.remove('correct');
          // Optionally add incorrect class only after they finish typing
          // or leave it neutral until submit
          e.target.classList.remove('incorrect');
        }
      } else {
        e.target.classList.remove('filled', 'correct', 'incorrect');
      }
      
      // Update progress based on correct answers
      updateProgress();
      sendProgress();
      
      // Send real-time typing update to opponent
      sendTypingUpdate(index, value);
    });
    
    // Tab navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = (index + 1) % totalBlanks;
        blankInputs[nextIndex].focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      }
    });
  });
  
  // Focus first input
  if (blankInputs.length > 0) {
    blankInputs[0].focus();
  }
}

// Create Code with Blanks
function createCodeWithBlanks(codeText, disabled = false) {
  let blankIndex = 0;
  return codeText.replace(/___/g, () => {
    const disabledAttr = disabled ? ' disabled' : '';
    return `<input type="text" class="blank-input" data-index="${blankIndex++}" autocomplete="off"${disabledAttr}>`;
  });
}

// Update Progress Bar (only for correct answers)
function updateProgress() {
  let correctCount = 0;
  
  myAnswers.forEach((answer, index) => {
    const normalizedAnswer = answer.toLowerCase().replace(/['"]/g, '');
    if (normalizedAnswer === correctAnswers[index]) {
      correctCount++;
    }
  });
  
  const progress = (correctCount / totalBlanks) * 100;
  yourProgress.style.width = `${progress}%`;
  
  if (progress === 100) {
    yourProgress.classList.add('complete');
  } else {
    yourProgress.classList.remove('complete');
  }
}

// Send Progress to Opponent (only correct answers)
function sendProgress() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    let correctCount = 0;
    
    myAnswers.forEach((answer, index) => {
      const normalizedAnswer = answer.toLowerCase().replace(/['"]/g, '');
      if (normalizedAnswer === correctAnswers[index]) {
        correctCount++;
      }
    });
    
    const progress = (correctCount / totalBlanks) * 100;
    
    ws.send(JSON.stringify({
      type: 'battle_progress',
      progress: progress,
      filled: correctCount,
      total: totalBlanks
    }));
  }
}

// Send real-time typing update to opponent
function sendTypingUpdate(index, value) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'typing_update',
      index: index,
      value: value
    }));
  }
}

// Handle Opponent Progress
function handleOpponentProgress(data) {
  opponentProgress.style.width = `${data.progress}%`;
  if (data.progress === 100) {
    opponentProgress.classList.add('complete');
  } else {
    opponentProgress.classList.remove('complete');
  }
}

// Handle Opponent Typing (real-time updates)
function handleOpponentTyping(data) {
  const opponentInputs = opponentCode.querySelectorAll('.blank-input');
  if (opponentInputs[data.index]) {
    opponentInputs[data.index].value = data.value;
    
    // Only show that opponent is typing (no validation colors)
    if (data.value) {
      opponentInputs[data.index].classList.add('filled');
      // Don't show correct/incorrect - they see their own validation
    } else {
      opponentInputs[data.index].classList.remove('filled');
    }
  }
}

// Start Timer (counts up)
function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timer.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 100);
}

// Stop Timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// Submit Answer
submitButton.addEventListener('click', submitAnswer);

function submitAnswer() {
  // Check if all blanks are filled
  const allFilled = myAnswers.every(a => a !== '');
  if (!allFilled) {
    alert('Please fill in all blanks before submitting!');
    return;
  }
  
  // Check if all answers are correct
  let allCorrect = true;
  myAnswers.forEach((answer, index) => {
    const normalizedAnswer = answer.toLowerCase().replace(/['"]/g, '');
    if (normalizedAnswer !== correctAnswers[index]) {
      allCorrect = false;
    }
  });
  
  if (!allCorrect) {
    alert('Some answers are incorrect! Check the highlighted fields.');
    return;
  }
  
  // Stop timer
  stopTimer();
  const finalTime = Date.now() - startTime;
  
  // Disable inputs
  submitButton.disabled = true;
  yourCode.querySelectorAll('.blank-input').forEach(input => {
    input.disabled = true;
  });
  
  // Send result to server
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'battle_submit',
      time: finalTime,
      correct: allCorrect,
      answers: myAnswers
    }));
  }
  
  gameState = 'finished';
  statusIndicator.textContent = 'Waiting for results...';
}

// Handle Battle Result
function handleBattleResult(data) {
  stopTimer();
  
  const finalTime = data.yourTime || (Date.now() - startTime);
  const seconds = Math.floor(finalTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  // Show winner modal
  const winnerIcon = document.getElementById('winnerIcon');
  const winnerTitle = document.getElementById('winnerTitle');
  const winnerTime = document.getElementById('winnerTime');
  
  if (data.winner === myRole) {
    winnerIcon.textContent = '🏆';
    winnerTitle.textContent = 'You Win!';
    winnerTitle.style.color = '#28a745';
    yourCard.classList.add('winner');
  } else if (data.winner === 'tie') {
    winnerIcon.textContent = '🤝';
    winnerTitle.textContent = "It's a Tie!";
    winnerTitle.style.color = '#667eea';
  } else {
    winnerIcon.textContent = '😞';
    winnerTitle.textContent = 'You Lost!';
    winnerTitle.style.color = '#dc3545';
    opponentCard.classList.add('winner');
  }
  
  winnerTime.textContent = timeString;
  winnerOverlay.style.display = 'flex';
}

// Handle Opponent Disconnect
function handleOpponentDisconnect() {
  stopTimer();
  alert('Your opponent has disconnected. You win by default!');
  handleBattleResult({ 
    winner: myRole, 
    yourTime: Date.now() - startTime 
  });
}

// Show/Hide Waiting Overlay
function showWaitingOverlay() {
  waitingOverlay.style.display = 'flex';
}

function hideWaitingOverlay() {
  waitingOverlay.style.display = 'none';
}

// Cancel Waiting Buttons
cancelWaiting.addEventListener('click', () => {
  if (ws) {
    ws.close();
  }
  window.location.href = 'menu.html';
});

cancelButton.addEventListener('click', () => {
  if (ws) {
    ws.close();
  }
  window.location.href = 'menu.html';
});

// Heartbeat to keep connection alive
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000); // Every 30 seconds

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  console.log('Multiplayer Battle page loaded, initializing WebSocket...');
  initWebSocket();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && (!ws || ws.readyState !== WebSocket.OPEN)) {
    console.log('Page visible, reconnecting...');
    initWebSocket();
  }
});