#!/usr/bin/env node
/**
 * Question-bank validator.
 *
 * Validates every question bank in public/questions/ (solo + battle) and
 * data/questions-coop/ (co-op). Exits non-zero when any error is found so
 * CI can catch malformed question PRs before they break gameplay.
 *
 * Usage: node scripts/validate-questions.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOLO_DIR = path.join(ROOT, 'public', 'questions');
const COOP_DIR = path.join(ROOT, 'data', 'questions-coop');

const errors = [];
const bankSummaries = [];

function addError(file, message) {
  errors.push(`${path.relative(ROOT, file)}: ${message}`);
}

function readBanks(dir) {
  if (!fs.existsSync(dir)) {
    addError(dir, 'directory does not exist');
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const file = path.join(dir, name);
      try {
        return { file, name, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
      } catch (error) {
        addError(file, `invalid JSON (${error.message})`);
        return null;
      }
    })
    .filter(Boolean);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function normalize(value) {
  return String(value).toLowerCase().replace(/['"]/g, '');
}

/**
 * Solo banks: { id, topic, question, code_snippet, answers[] }.
 * The number of "___" masks must equal the number of answers, otherwise
 * the blank inputs and grading arrays desynchronize in the client.
 */
function validateSoloBank(bank) {
  const { file, data } = bank;
  if (!Array.isArray(data) || data.length === 0) {
    addError(file, 'bank must be a non-empty array of questions');
    return;
  }

  const ids = new Set();
  data.forEach((question, index) => {
    const label = `question #${index}`;
    if (question.id === undefined || question.id === null) addError(file, `${label}: missing "id"`);
    else if (ids.has(question.id)) addError(file, `${label}: duplicate id ${question.id}`);
    else ids.add(question.id);

    if (!isNonEmptyString(question.topic)) addError(file, `${label}: missing "topic"`);
    if (!isNonEmptyString(question.question)) addError(file, `${label}: missing "question"`);
    if (!isNonEmptyString(question.code_snippet)) addError(file, `${label}: missing "code_snippet"`);

    if (!Array.isArray(question.answers) || question.answers.length === 0) {
      addError(file, `${label}: "answers" must be a non-empty array`);
      return;
    }
    question.answers.forEach((answer, i) => {
      if (!isNonEmptyString(answer)) addError(file, `${label}: answers[${i}] is empty`);
    });

    const masks = (question.code_snippet.match(/___/g) || []).length;
    if (masks !== question.answers.length) {
      addError(
        file,
        `${label}: ${masks} "___" masks but ${question.answers.length} answers (must match)`,
      );
    }
  });
}

/**
 * Co-op banks: typed questions.
 * - frontend_backend: per-player { role?, code, blanks[] } (blanks = expected
 *   answers in mask order; "___" masks in code must equal blanks.length).
 * - both_backends: { shared_code, player1: { answers[] }, player2: { answers[] } }
 *   with P1_BLANK / P2_BLANK tokens matching the answer counts.
 */
function validateCoopBank(bank) {
  const { file, data } = bank;
  if (!Array.isArray(data) || data.length === 0) {
    addError(file, 'bank must be a non-empty array of questions');
    return;
  }

  const ids = new Set();
  data.forEach((question, index) => {
    const label = `question #${index}`;
    if (question.id === undefined || question.id === null) addError(file, `${label}: missing "id"`);
    else if (ids.has(question.id)) addError(file, `${label}: duplicate id ${question.id}`);
    else ids.add(question.id);

    if (!isNonEmptyString(question.type)) {
      addError(file, `${label}: missing "type"`);
      return;
    }
    if (!isNonEmptyString(question.description)) addError(file, `${label}: missing "description"`);

    if (question.type === 'frontend_backend') {
      for (const player of ['player1', 'player2']) {
        const part = question[player];
        if (!part || typeof part !== 'object') {
          addError(file, `${label}: missing "${player}"`);
          continue;
        }
        if (!isNonEmptyString(part.code)) addError(file, `${label}: ${player}.code missing`);
        if (!Array.isArray(part.blanks) || part.blanks.length === 0) {
          addError(file, `${label}: ${player}.blanks must be a non-empty array`);
          continue;
        }
        const masks = (String(part.code || '').match(/___/g) || []).length;
        if (masks !== part.blanks.length) {
          addError(
            file,
            `${label}: ${player} has ${masks} "___" masks but ${part.blanks.length} expected answers`,
          );
        }
      }
    } else if (question.type === 'both_backends') {
      if (!isNonEmptyString(question.shared_code)) {
        addError(file, `${label}: missing "shared_code"`);
        return;
      }
      const p1Tokens = (question.shared_code.match(/P1_BLANK/g) || []).length;
      const p2Tokens = (question.shared_code.match(/P2_BLANK/g) || []).length;
      for (const [player, tokens] of [['player1', p1Tokens], ['player2', p2Tokens]]) {
        const part = question[player];
        if (!part || !Array.isArray(part.answers) || part.answers.length === 0) {
          addError(file, `${label}: ${player}.answers must be a non-empty array`);
          continue;
        }
        if (tokens !== part.answers.length) {
          addError(
            file,
            `${label}: shared_code has ${tokens} ${player === 'player1' ? 'P1_BLANK' : 'P2_BLANK'} tokens but ${player}.answers has ${part.answers.length} entries`,
          );
        }
      }
    } else {
      addError(file, `${label}: unknown type "${question.type}"`);
    }
  });
}

function main() {
  const soloBanks = readBanks(SOLO_DIR);
  const coopBanks = readBanks(COOP_DIR);

  for (const bank of soloBanks) {
    validateSoloBank(bank);
    bankSummaries.push(
      `${path.relative(ROOT, bank.file)}: ${Array.isArray(bank.data) ? bank.data.length : '?'} questions`,
    );
  }
  for (const bank of coopBanks) {
    validateCoopBank(bank);
    bankSummaries.push(
      `${path.relative(ROOT, bank.file)}: ${Array.isArray(bank.data) ? bank.data.length : '?'} questions`,
    );
  }

  console.log('Question bank validation');
  console.log('========================');
  bankSummaries.forEach((line) => console.log(`  ${line}`));

  if (soloBanks.length + coopBanks.length === 0) {
    addError(ROOT, 'no question banks found');
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s):`);
    errors.forEach((line) => console.error(`  ✗ ${line}`));
    process.exit(1);
  }

  console.log(`\nAll ${soloBanks.length + coopBanks.length} bank(s) valid.`);
}

main();
