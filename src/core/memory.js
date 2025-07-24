// memory.js — Módulo de Memória Contextual da Nanabot
// Persistência: SQLite, fácil migração futura
// Limite configurável, backup de esquecidas, enum de categorias, funções especiais

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Configuração (pode ser movida para memoryConfig.js)
const DB_PATH = path.resolve(process.cwd(), 'data', 'memory.db');
const DEFAULT_LIMIT = 1000;
const MEMORY_LIMIT = process.env.MEMORY_LIMIT ? parseInt(process.env.MEMORY_LIMIT) : DEFAULT_LIMIT;

// Enum de categorias
export const MemoryCategories = Object.freeze({
  carinho: 'carinho',
  trauma: 'trauma',
  brincadeira: 'brincadeira',
  frase: 'frase',
  rotina: 'rotina',
  momentoEspecial: 'momentoEspecial',
  conquista: 'conquista',
  repreensao: 'repreensão',
  desconhecida: 'desconhecida',
});

function validateCategory(cat) {
  return Object.values(MemoryCategories).includes(cat) ? cat : MemoryCategories.desconhecida;
}

let db;

// Inicialização do banco
export async function initDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      type TEXT,
      content TEXT,
      author TEXT,
      created_at TEXT,
      last_accessed TEXT,
      emotional_weight REAL,
      access_count INTEGER,
      category TEXT,
      protected INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS forgotten_memories (
      id TEXT PRIMARY KEY,
      type TEXT,
      content TEXT,
      author TEXT,
      created_at TEXT,
      last_accessed TEXT,
      emotional_weight REAL,
      access_count INTEGER,
      category TEXT,
      protected INTEGER DEFAULT 0,
      forgotten_at TEXT,
      isRestored INTEGER DEFAULT 0
    );
  `);
}

// Função para registrar memória
export async function registerMemory({ type, content, author, emotional_weight = 0.5, category, protected: isProtected = false }) {
  const now = new Date().toISOString();
  const id = uuidv4();
  const cat = validateCategory(category || type);
  await enforceMemoryLimit();
  await db.run(
    `INSERT INTO memories (id, type, content, author, created_at, last_accessed, emotional_weight, access_count, category, protected)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, type, content, author, now, now, emotional_weight, 0, cat, isProtected ? 1 : 0]
  );
  return id;
}

// Buscar memórias por tipo
export async function getMemoriesByType(type, limit = 10) {
  const cat = validateCategory(type);
  return db.all(`SELECT * FROM memories WHERE category = ? ORDER BY created_at DESC LIMIT ?`, [cat, limit]);
}

// Buscar memória por ID
export async function getMemoryById(id) {
  return db.get(`SELECT * FROM memories WHERE id = ?`, [id]);
}

// Buscar memórias por texto (fuzzy, usando LIKE)
export async function searchMemoriesByText(text, limit = 10) {
  return db.all(`SELECT * FROM memories WHERE content LIKE ? ORDER BY created_at DESC LIMIT ?`, [`%${text}%`, limit]);
}

// Listar memórias recentes
export async function getRecentMemories(limit = 10) {
  return db.all(`SELECT * FROM memories ORDER BY created_at DESC LIMIT ?`, [limit]);
}

// Atualizar acesso à memória
export async function updateMemoryAccess(id) {
  const now = new Date().toISOString();
  await db.run(`UPDATE memories SET access_count = access_count + 1, last_accessed = ? WHERE id = ?`, [now, id]);
}

// Remover memória (se não for protegida)
export async function removeMemory(id) {
  const mem = await getMemoryById(id);
  if (!mem) return false;
  if (mem.protected) return false;
  await db.run(`DELETE FROM memories WHERE id = ?`, [id]);
  return true;
}

// Backup (move) memória para forgotten_memories
export async function backupMemory(id) {
  const mem = await getMemoryById(id);
  if (!mem || mem.protected) return false;
  const now = new Date().toISOString();
  await db.run(`INSERT INTO forgotten_memories (id, type, content, author, created_at, last_accessed, emotional_weight, access_count, category, protected, forgotten_at, isRestored)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [mem.id, mem.type, mem.content, mem.author, mem.created_at, mem.last_accessed, mem.emotional_weight, mem.access_count, mem.category, mem.protected, now]
  );
  await db.run(`DELETE FROM memories WHERE id = ?`, [id]);
  return true;
}

// Limitar quantidade de memórias (remove menos relevantes, não protegidas)
export async function enforceMemoryLimit() {
  const count = (await db.get(`SELECT COUNT(*) as c FROM memories`)).c;
  if (count < MEMORY_LIMIT) return;
  // Remove as menos relevantes (menor emotional_weight, menos acessos, mais antigas, não protegidas)
  const toRemove = await db.all(`SELECT id FROM memories WHERE protected = 0 ORDER BY emotional_weight ASC, access_count ASC, created_at ASC LIMIT ?`, [count - MEMORY_LIMIT + 1]);
  for (const row of toRemove) {
    await backupMemory(row.id);
  }
}

// Função especial: memória aleatória
export async function getRandomMemory({ type, protectedOnly = false } = {}) {
  let query = 'SELECT * FROM memories';
  const params = [];
  if (type) {
    query += ' WHERE category = ?';
    params.push(validateCategory(type));
  }
  if (protectedOnly) {
    query += params.length ? ' AND protected = 1' : ' WHERE protected = 1';
  }
  query += ' ORDER BY RANDOM() LIMIT 1';
  return db.get(query, params);
}

// Função especial: restaurar memória esquecida
export async function restoreForgottenMemory(id) {
  const mem = await db.get(`SELECT * FROM forgotten_memories WHERE id = ?`, [id]);
  if (!mem) return false;
  await db.run(`INSERT INTO memories (id, type, content, author, created_at, last_accessed, emotional_weight, access_count, category, protected)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [mem.id, mem.type, mem.content, mem.author, mem.created_at, mem.last_accessed, mem.emotional_weight, mem.access_count, mem.category, mem.protected]
  );
  await db.run(`UPDATE forgotten_memories SET isRestored = 1 WHERE id = ?`, [id]);
  return true;
}

// Exemplo de uso: await initDB();
// await registerMemory({ type: 'carinho', content: 'Hoje foi especial!', author: '787524878642577429', emotional_weight: 0.9, category: 'carinho', protected: false });
// ...
