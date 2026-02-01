// Solo Quiz Application
let selectedTopic = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let skippedCount = 0;
let currentBlankInputs = [];

// DOM Elements
const topicSelection = document.getElementById('topicSelection');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const startQuizBtn = document.getElementById('startQuizBtn');
const questionText = document.getElementById('questionText');
const submitBtn = document.getElementById('submitBtn');
const skipBtn = document.getElementById('skipBtn');
const feedback = document.getElementById('feedback');
const questionCounter = document.getElementById('questionCounter');
const scoreDisplay = document.getElementById('scoreDisplay');
const topicStatus = document.getElementById('topicStatus');
const questionStatus = document.getElementById('questionStatus');
const scoreStatus = document.getElementById('scoreStatus');

// Topic Selection
const topicCards = document.querySelectorAll('.topic-card');
topicCards.forEach(card => {
  card.addEventListener('click', () => {
    // Remove selected class from all cards
    topicCards.forEach(c => c.classList.remove('selected'));
    
    // Add selected class to clicked card
    card.classList.add('selected');
    
    // Store selected topic
    selectedTopic = card.dataset.topic;
    
    // Enable start button
    startQuizBtn.disabled = false;
    
    // Update status
    const topicName = card.querySelector('.topic-name').textContent;
    topicStatus.textContent = `Topic: ${topicName}`;
    
    console.log('Selected topic:', selectedTopic);
  });
});

// Start Quiz
startQuizBtn.addEventListener('click', async () => {
  if (!selectedTopic) {
    alert('Please select a topic first!');
    return;
  }
  
  try {
    // Load questions for selected topic
    await loadQuestions(selectedTopic);
    
    // Hide topic selection, show quiz
    topicSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    
    // Start first question
    displayQuestion();
  } catch (error) {
    console.error('Error starting quiz:', error);
    alert('Failed to load questions. Please try again.');
  }
});

// Load Questions from JSON
async function loadQuestions(topic) {
  try {
    const response = await fetch(`questions/${topic}.json`);
    if (!response.ok) {
      throw new Error('Failed to load questions');
    }
    
    const allQuestions = await response.json();
    
    // Shuffle and select 10 random questions
    questions = shuffleArray(allQuestions).slice(0, 10);
    
    console.log(`Loaded ${questions.length} questions for topic: ${topic}`);
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
}

// Shuffle Array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Display Current Question
function displayQuestion() {
  const question = questions[currentQuestionIndex];
  currentBlankInputs = [];
  
  // Update counters
  questionCounter.textContent = `Question ${currentQuestionIndex + 1}/10`;
  scoreDisplay.textContent = `Score: ${score}/10`;
  questionStatus.textContent = `Question ${currentQuestionIndex + 1}/10`;
  scoreStatus.textContent = `Score: ${score}`;
  
  // Hide feedback
  feedback.classList.remove('correct', 'incorrect');
  feedback.style.display = 'none';
  
  // Enable submit button
  submitBtn.disabled = false;
  
  // Parse code snippet and create blanks
  const questionHTML = `
    <div style="margin-bottom: 15px; color: #666; font-size: 14px;">
      ${question.question}
    </div>
    <pre style="background: #282c34; color: #abb2bf; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">${createQuestionWithBlanks(question.code_snippet, question.answers.length)}</pre>
  `;
  questionText.innerHTML = questionHTML;
  
  // Get all blank inputs
  currentBlankInputs = Array.from(document.querySelectorAll('.blank-input'));
  
  // Add Tab key navigation
  currentBlankInputs.forEach((input, index) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = (index + 1) % currentBlankInputs.length;
        currentBlankInputs[nextIndex].focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      }
    });
  });
  
  // Focus first input
  if (currentBlankInputs.length > 0) {
    currentBlankInputs[0].focus();
  }
  
  console.log('Displaying question:', currentQuestionIndex + 1);
}

// Create Question HTML with Blank Inputs
function createQuestionWithBlanks(questionText, blankCount) {
  let html = questionText;
  let blankIndex = 0;
  
  // Replace ___ with input fields
  html = html.replace(/___/g, () => {
    return `<input type="text" class="blank-input" data-blank-index="${blankIndex++}" autocomplete="off">`;
  });
  
  return html;
}

// Submit Answer
submitBtn.addEventListener('click', submitAnswer);

function submitAnswer() {
  const question = questions[currentQuestionIndex];
  const userAnswers = currentBlankInputs.map(input => 
    input.value.trim().toLowerCase().replace(/['"]/g, '') // Strip quotes and normalize
  );
  const correctAnswers = question.answers.map(answer => 
    answer.toLowerCase().replace(/['"]/g, '') // Strip quotes from correct answers too
  );
  
  console.log('User answers:', userAnswers);
  console.log('Correct answers:', correctAnswers);

  // Check if all blanks are filled
  if (userAnswers.some(answer => answer === '')) {
    alert('Please fill in all blanks before submitting!');
    return;
  }

  // Disable inputs and submit button
  currentBlankInputs.forEach(input => input.disabled = true);
  submitBtn.disabled = true;

  // Track if the user got all blanks correct
  let allCorrect = true;
  let partiallyCorrect = false;

  // Check each input individually
  currentBlankInputs.forEach((input, index) => {
    if (userAnswers[index] === correctAnswers[index]) {
      input.classList.add('correct');
      input.classList.remove('incorrect');
      partiallyCorrect = true;
    } else {
      input.classList.add('incorrect');
      input.classList.remove('correct');
      allCorrect = false;
    }
  });

  // Show feedback message
  if (allCorrect) {
    score++;
    feedback.textContent = `✅ Correct! Well done!`;
    feedback.className = 'feedback correct';
  } else if (partiallyCorrect) {
    feedback.textContent = `⚠️ Some answers are correct. Correct answers: ${question.answers.join(', ')}`;
    feedback.className = 'feedback incorrect';
  } else {
    feedback.textContent = `❌ Incorrect. The correct answers are: ${question.answers.join(', ')}`;
    feedback.className = 'feedback incorrect';
  }

  // Update score display
  scoreDisplay.textContent = `Score: ${score}/10`;
  scoreStatus.textContent = `Score: ${score}`;

  // Move to next question after delay
  setTimeout(() => {
    nextQuestion();
  }, 3000);
}

// Skip Question
skipBtn.addEventListener('click', () => {
  skippedCount++;
  console.log('Question skipped');
  
  // Show feedback
  const question = questions[currentQuestionIndex];
  feedback.textContent = `⏭️ Skipped. Correct answers: ${question.answers.join(', ')}`;
  feedback.className = 'feedback incorrect';
  
  // Disable inputs
  currentBlankInputs.forEach(input => input.disabled = true);
  submitBtn.disabled = true;
  
  setTimeout(() => {
    nextQuestion();
  }, 2000);
});

// Next Question
function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    showResults();
  }
}

// Show Results
function showResults() {
  quizContainer.classList.add('hidden');
  resultsContainer.classList.remove('hidden');
  
  const totalQuestions = questions.length;
  const correctCount = score;
  const incorrectCount = totalQuestions - score - skippedCount;
  const accuracy = Math.round((score / totalQuestions) * 100);
  
  // Update results
  document.getElementById('finalScore').textContent = `${score}/${totalQuestions}`;
  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('skippedCount').textContent = skippedCount;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
  
  // Set icon and message based on score
  const resultsIcon = document.getElementById('resultsIcon');
  const resultsMessage = document.getElementById('resultsMessage');
  
  if (accuracy >= 90) {
    resultsIcon.textContent = '🏆';
    resultsMessage.textContent = 'Outstanding! You\'re a master!';
  } else if (accuracy >= 70) {
    resultsIcon.textContent = '🎉';
    resultsMessage.textContent = 'Great job! Keep it up!';
  } else if (accuracy >= 50) {
    resultsIcon.textContent = '👍';
    resultsMessage.textContent = 'Good effort! Practice makes perfect!';
  } else {
    resultsIcon.textContent = '📚';
    resultsMessage.textContent = 'Keep learning! You\'ll do better next time!';
  }
  
  console.log('Quiz completed. Score:', score, 'Accuracy:', accuracy + '%');
}

// Initialize
console.log('Solo quiz initialized - Select a topic to begin!');