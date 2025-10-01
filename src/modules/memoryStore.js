// src/modules/memoryStore.js - Armazenamento de Memória de Conversa
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

class MemoryStore {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'conversation_memory.db');
    this.cache = new Map(); // LRU cache em memória
    this.cacheSize = 100; // Máximo de sessões em cache
    this.flushQueue = new Set(); // IDs de sessões para flush assíncrono
    this.flushTimeout = null;
    this.initialized = false;
    
    // Inicializa de forma assíncrona
    this.initDatabase().then(() => {
      this.initialized = true;
      this.startFlushTimer();
    }).catch(error => {
      console.error('[MEMORY-STORE] Erro na inicialização:', error.message);
    });
  }

  // Inicializa banco de dados SQLite
  async initDatabase() {
    try {
      // Garante que o diretório data existe
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Cria tabelas se não existirem
      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS conversation_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guild_id TEXT,
          channel_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          last_bot_message TEXT,
          summary TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(guild_id, channel_id, user_id)
        )
      `);

      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS conversation_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES conversation_sessions (id) ON DELETE CASCADE
        )
      `);

      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS conversation_summaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES conversation_sessions (id) ON DELETE CASCADE
        )
      `);

      // Tabelas para comandos de afeto e modos
      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS affection_stats (
          user_id TEXT NOT NULL,
          guild_id TEXT NOT NULL,
          hugs_given INTEGER DEFAULT 0,
          love_score INTEGER DEFAULT 0,
          last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (guild_id, user_id)
        )
      `);

      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS stories_state (
          user_id TEXT NOT NULL,
          guild_id TEXT NOT NULL,
          channel_id TEXT NOT NULL,
          mode TEXT NOT NULL,
          state_json TEXT,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (guild_id, channel_id, user_id)
        )
      `);

      // Índices para performance (após criar as tabelas)
      await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_sessions_context ON conversation_sessions(guild_id, channel_id, user_id)`);
      await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_messages_session ON conversation_messages(session_id, created_at)`);
      await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_summaries_session ON conversation_summaries(session_id, created_at)`);
      await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_affection_stats ON affection_stats(guild_id, user_id)`);
      await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_stories_state ON stories_state(guild_id, channel_id, user_id)`);
      await this.runQuery(`CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories_state(expires_at)`);

      console.log('[MEMORY-STORE] Banco de dados inicializado');
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao inicializar banco:', error.message);
    }
  }

  // Executa query SQL
  runQuery(sql, params = []) {
    try {
      const { Database } = sqlite3.verbose();
      const db = new Database(this.dbPath);
      
      return new Promise((resolve, reject) => {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          db.all(sql, params, (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          db.run(sql, params, function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
          });
        }
      });
    } catch (error) {
      console.error('[MEMORY-STORE] Erro na query:', error.message);
      return Promise.resolve([]);
    }
  }

  // Gera chave de contexto
  getContextKey(guildId, channelId, userId) {
    return `${guildId || 'dm'}:${channelId}:${userId}`;
  }

  // Aguarda inicialização do banco
  async waitForInitialization() {
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    while (!this.initialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.initialized) {
      throw new Error('Timeout aguardando inicialização do banco de dados');
    }
  }

  // Obtém ou cria sessão
  async getOrCreateSession(guildId, channelId, userId) {
    // Aguarda inicialização se necessário
    if (!this.initialized) {
      await this.waitForInitialization();
    }

    const contextKey = this.getContextKey(guildId, channelId, userId);
    
    // Verifica cache primeiro
    if (this.cache.has(contextKey)) {
      return this.cache.get(contextKey);
    }

    try {
      // Busca no banco
      const sessions = await this.runQuery(
        'SELECT * FROM conversation_sessions WHERE guild_id = ? AND channel_id = ? AND user_id = ?',
        [guildId, channelId, userId]
      );

      let session;
      if (sessions.length > 0) {
        session = sessions[0];
      } else {
        // Cria nova sessão
        const result = await this.runQuery(
          'INSERT INTO conversation_sessions (guild_id, channel_id, user_id) VALUES (?, ?, ?)',
          [guildId, channelId, userId]
        );
        session = {
          id: result.id,
          guild_id: guildId,
          channel_id: channelId,
          user_id: userId,
          last_bot_message: null,
          summary: null,
          updated_at: new Date().toISOString()
        };
      }

      // Adiciona ao cache
      this.addToCache(contextKey, session);
      return session;
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao obter sessão:', error.message);
      return null;
    }
  }

  // Adiciona mensagem à sessão
  async addMessage(sessionId, role, content) {
    try {
      // Trunca conteúdo se muito longo
      const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + '...' : content;
      
      const result = await this.runQuery(
        'INSERT INTO conversation_messages (session_id, role, content) VALUES (?, ?, ?)',
        [sessionId, role, truncatedContent]
      );

      // Atualiza timestamp da sessão
      await this.runQuery(
        'UPDATE conversation_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [sessionId]
      );

      // Marca para flush
      this.markForFlush(sessionId);
      
      return result.id;
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao adicionar mensagem:', error.message);
      return null;
    }
  }

  // Obtém mensagens recentes da sessão
  async getRecentMessages(sessionId, limit = 8) {
    try {
      const messages = await this.runQuery(
        'SELECT role, content, created_at FROM conversation_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?',
        [sessionId, limit]
      );
      return messages.reverse(); // Ordem cronológica
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao obter mensagens:', error.message);
      return [];
    }
  }

  // Obtém resumos da sessão
  async getSummaries(sessionId) {
    try {
      const summaries = await this.runQuery(
        'SELECT content, created_at FROM conversation_summaries WHERE session_id = ? ORDER BY created_at DESC',
        [sessionId]
      );
      return summaries;
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao obter resumos:', error.message);
      return [];
    }
  }

  // Adiciona resumo à sessão
  async addSummary(sessionId, content) {
    try {
      const result = await this.runQuery(
        'INSERT INTO conversation_summaries (session_id, content) VALUES (?, ?)',
        [sessionId, content]
      );
      
      // Atualiza resumo atual da sessão
      await this.runQuery(
        'UPDATE conversation_sessions SET summary = ? WHERE id = ?',
        [content, sessionId]
      );

      return result.id;
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao adicionar resumo:', error.message);
      return null;
    }
  }

  // Atualiza última mensagem do bot
  async updateLastBotMessage(sessionId, message) {
    try {
      await this.runQuery(
        'UPDATE conversation_sessions SET last_bot_message = ? WHERE id = ?',
        [message, sessionId]
      );
      
      this.markForFlush(sessionId);
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao atualizar última mensagem:', error.message);
    }
  }

  // Remove mensagens antigas (manter apenas as últimas N)
  async rotateMessages(sessionId, keepCount = 4) {
    try {
      // Conta mensagens atuais
      const countResult = await this.runQuery(
        'SELECT COUNT(*) as count FROM conversation_messages WHERE session_id = ?',
        [sessionId]
      );
      
      const currentCount = countResult[0].count;
      
      if (currentCount > keepCount) {
        // Remove mensagens antigas
        await this.runQuery(
          'DELETE FROM conversation_messages WHERE session_id = ? AND id IN (SELECT id FROM conversation_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?)',
          [sessionId, sessionId, currentCount - keepCount]
        );
        
        console.log(`[MEMORY-STORE] Rotacionadas mensagens da sessão ${sessionId}: ${currentCount} -> ${keepCount}`);
      }
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao rotacionar mensagens:', error.message);
    }
  }

  // Limpa sessão
  async clearSession(sessionId) {
    try {
      await this.runQuery('DELETE FROM conversation_sessions WHERE id = ?', [sessionId]);
      console.log(`[MEMORY-STORE] Sessão ${sessionId} limpa`);
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao limpar sessão:', error.message);
    }
  }

  // Limpa sessões expiradas (TTL de 4 horas)
  async cleanupExpiredSessions() {
    try {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      
      const result = await this.runQuery(
        'DELETE FROM conversation_sessions WHERE updated_at < ?',
        [fourHoursAgo]
      );
      
      if (result.changes > 0) {
        console.log(`[MEMORY-STORE] ${result.changes} sessões expiradas removidas`);
      }
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao limpar sessões expiradas:', error.message);
    }
  }

  // Cache LRU
  addToCache(key, session) {
    if (this.cache.size >= this.cacheSize) {
      // Remove o mais antigo
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, session);
  }

  // Marca sessão para flush assíncrono
  markForFlush(sessionId) {
    this.flushQueue.add(sessionId);
  }

  // Timer para flush assíncrono
  startFlushTimer() {
    this.flushTimeout = setInterval(() => {
      this.flushPendingUpdates();
      this.cleanupExpiredSessions();
    }, 30000); // A cada 30 segundos
  }

  // Flush de atualizações pendentes
  async flushPendingUpdates() {
    if (this.flushQueue.size === 0) return;
    
    console.log(`[MEMORY-STORE] Flush de ${this.flushQueue.size} sessões pendentes`);
    this.flushQueue.clear();
  }

  // Obtém estatísticas
  async getStats() {
    try {
      const sessionCount = await this.runQuery('SELECT COUNT(*) as count FROM conversation_sessions');
      const messageCount = await this.runQuery('SELECT COUNT(*) as count FROM conversation_messages');
      const summaryCount = await this.runQuery('SELECT COUNT(*) as count FROM conversation_summaries');
      
      return {
        sessions: sessionCount[0].count,
        messages: messageCount[0].count,
        summaries: summaryCount[0].count,
        cacheSize: this.cache.size,
        pendingFlushes: this.flushQueue.size
      };
    } catch (error) {
      console.error('[MEMORY-STORE] Erro ao obter estatísticas:', error.message);
      return { sessions: 0, messages: 0, summaries: 0, cacheSize: 0, pendingFlushes: 0 };
    }
  }

  // Destrói recursos
  destroy() {
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
    }
    this.cache.clear();
    this.flushQueue.clear();
  }
}

export default new MemoryStore();
