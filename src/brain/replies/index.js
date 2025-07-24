// replies/index.js — Utilitário para buscar frases aleatórias por contexto
import fs from 'fs';
import path from 'path';

const REPLIES_PATH = path.resolve(process.cwd(), 'src', 'brain', 'replies', 'replies.json');
let replies = {};

function loadReplies() {
  if (fs.existsSync(REPLIES_PATH)) {
    replies = JSON.parse(fs.readFileSync(REPLIES_PATH, 'utf-8'));
  }
}

export function getRandomReply(contexto) {
  if (!Object.keys(replies).length) loadReplies();
  const arr = replies[contexto] || [];
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Exemplo de uso:
// getRandomReply('carinho');
// getRandomReply('sono');
