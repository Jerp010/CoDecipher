const path = require('path');
const fs = require('fs').promises;

// Solo question banks stay under public/ because the solo client fetches
// them directly from the browser (documented trade-off; see ARCHITECTURE.md).
const SOLO_QUESTIONS_DIR = path.join(__dirname, '..', 'public', 'questions');

// Co-op banks are loaded server-side only (kept out of the static dir so
// their answers are not publicly downloadable).
const COOP_QUESTIONS_DIR = path.join(__dirname, '..', 'public', 'questions-coop');

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Load a solo question bank (also used by battle mode) and return one
 * random question. Returns null when the bank cannot be read or parsed.
 */
async function loadSoloQuestion(topic) {
  const filePath = path.join(SOLO_QUESTIONS_DIR, `${topic}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const questions = JSON.parse(raw);
    return pickRandom(questions);
  } catch (error) {
    console.error(`Failed to load question bank "${topic}" (${filePath}):`, error.message);
    return null;
  }
}

/**
 * Load a co-op question bank and return one random question.
 * Returns null when the bank cannot be read or parsed.
 */
async function loadCoopQuestion(questionFile) {
  const filePath = path.join(COOP_QUESTIONS_DIR, `${questionFile}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const questions = JSON.parse(raw);
    return pickRandom(questions);
  } catch (error) {
    console.error(`Failed to load co-op bank "${questionFile}" (${filePath}):`, error.message);
    return null;
  }
}

module.exports = { SOLO_QUESTIONS_DIR, COOP_QUESTIONS_DIR, loadSoloQuestion, loadCoopQuestion };
