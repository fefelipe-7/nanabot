import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';

const configPath = path.resolve(__dirname, 'routineConfig.json');
const phrasesPath = path.resolve(__dirname, 'routinePhrases.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function loadPhrases() {
  return JSON.parse(fs.readFileSync(phrasesPath, 'utf-8'));
}

function getRoutineBlock(now = DateTime.now()) {
  const config = loadConfig();
  const tz = config.timezone || 'America/Sao_Paulo';
  const blocks = config.blocks;
  const localNow = now.setZone(tz);
  const timeStr = localNow.toFormat('HH:mm');

  for (const block of blocks) {
    // Bloco que cruza meia-noite
    if (block.start > block.end) {
      if (timeStr >= block.start || timeStr < block.end) return block;
    } else {
      if (timeStr >= block.start && timeStr < block.end) return block;
    }
  }
  return blocks[blocks.length - 1]; // fallback
}

function getNextBlock(now = DateTime.now()) {
  const config = loadConfig();
  const tz = config.timezone || 'America/Sao_Paulo';
  const blocks = config.blocks;
  const localNow = now.setZone(tz);
  const timeStr = localNow.toFormat('HH:mm');
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.start > block.end) {
      if (timeStr >= block.start || timeStr < block.end) return blocks[(i + 1) % blocks.length];
    } else {
      if (timeStr >= block.start && timeStr < block.end) return blocks[(i + 1) % blocks.length];
    }
  }
  return blocks[0];
}

function describeCurrentRoutine(now = DateTime.now()) {
  const block = getRoutineBlock(now);
  const phrases = loadPhrases();
  const arr = phrases[block.name] || phrases.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

function setTimezone(tz) {
  const config = loadConfig();
  config.timezone = tz;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function updateRoutineConfig(newConfig) {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
}

export {
  getRoutineBlock,
  getNextBlock,
  describeCurrentRoutine,
  setTimezone,
  updateRoutineConfig
};
