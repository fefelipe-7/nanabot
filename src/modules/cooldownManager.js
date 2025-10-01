// src/modules/cooldownManager.js - Gerenciador de Cooldowns Inteligentes
import sqlite3 from 'sqlite3';

class CooldownManager {
  constructor() {
    this.dbPath = './data/cooldowns.db';
    this.memoryCache = new Map(); // userId -> { command: timestamp }
    this.cacheSize = 1000;
    this.initialized = false;
    
    this.initDatabase().then(() => {
      this.initialized = true;
      console.log('[COOLDOWN-MANAGER] ✅ Inicializado');
    }).catch(error => {
      console.error('[COOLDOWN-MANAGER] ❌ Erro na inicialização:', error.message);
    });
  }

  // Inicializa banco de dados
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Cria tabela de cooldowns
        db.run(`
          CREATE TABLE IF NOT EXISTS command_cooldowns (
            user_id TEXT NOT NULL,
            guild_id TEXT NOT NULL,
            command_name TEXT NOT NULL,
            last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
            cooldown_duration INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, guild_id, command_name)
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          db.close();
          resolve();
        });
      });
    });
  }

  // Verifica se comando está em cooldown
  async isOnCooldown(userId, guildId, commandName) {
    if (!this.initialized) return false;
    
    try {
      const cacheKey = `${userId}_${guildId}_${commandName}`;
      const cached = this.memoryCache.get(cacheKey);
      
      if (cached) {
        const now = Date.now();
        const timeLeft = cached.cooldownEnd - now;
        return timeLeft > 0 ? Math.ceil(timeLeft / 1000) : false;
      }
      
      // Consulta banco de dados
      const cooldownData = await this.getCooldownFromDB(userId, guildId, commandName);
      if (!cooldownData) return false;
      
      const now = Date.now();
      const timeLeft = cooldownData.cooldownEnd - now;
      
      if (timeLeft > 0) {
        // Atualiza cache
        this.memoryCache.set(cacheKey, {
          cooldownEnd: cooldownData.cooldownEnd,
          lastUsed: cooldownData.lastUsed
        });
        
        return Math.ceil(timeLeft / 1000);
      }
      
      return false;
    } catch (error) {
      console.error('[COOLDOWN-MANAGER] Erro ao verificar cooldown:', error.message);
      return false;
    }
  }

  // Define cooldown para comando
  async setCooldown(userId, guildId, commandName, durationSeconds) {
    if (!this.initialized) return false;
    
    try {
      const now = Date.now();
      const cooldownEnd = now + (durationSeconds * 1000);
      
      // Atualiza cache
      const cacheKey = `${userId}_${guildId}_${commandName}`;
      this.memoryCache.set(cacheKey, {
        cooldownEnd: cooldownEnd,
        lastUsed: now
      });
      
      // Limpa cache se necessário
      if (this.memoryCache.size > this.cacheSize) {
        const firstKey = this.memoryCache.keys().next().value;
        this.memoryCache.delete(firstKey);
      }
      
      // Atualiza banco de dados
      await this.updateCooldownInDB(userId, guildId, commandName, durationSeconds);
      
      console.log(`[COOLDOWN-MANAGER] ⏰ Cooldown definido: ${commandName} para ${durationSeconds}s`);
      return true;
    } catch (error) {
      console.error('[COOLDOWN-MANAGER] Erro ao definir cooldown:', error.message);
      return false;
    }
  }

  // Obtém cooldown do banco de dados
  async getCooldownFromDB(userId, guildId, commandName) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.get(
          'SELECT last_used, cooldown_duration FROM command_cooldowns WHERE user_id = ? AND guild_id = ? AND command_name = ?',
          [userId, guildId, commandName],
          (err, row) => {
            db.close();
            
            if (err) {
              reject(err);
              return;
            }
            
            if (!row) {
              resolve(null);
              return;
            }
            
            const lastUsed = new Date(row.last_used).getTime();
            const cooldownEnd = lastUsed + (row.cooldown_duration * 1000);
            
            resolve({
              lastUsed: lastUsed,
              cooldownEnd: cooldownEnd
            });
          }
        );
      });
    });
  }

  // Atualiza cooldown no banco de dados
  async updateCooldownInDB(userId, guildId, commandName, durationSeconds) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.run(
          'INSERT OR REPLACE INTO command_cooldowns (user_id, guild_id, command_name, cooldown_duration) VALUES (?, ?, ?, ?)',
          [userId, guildId, commandName, durationSeconds],
          (err) => {
            db.close();
            
            if (err) {
              reject(err);
              return;
            }
            
            resolve();
          }
        );
      });
    });
  }

  // Calcula cooldown dinâmico baseado no comportamento do usuário
  calculateDynamicCooldown(commandName, userStats) {
    const baseCooldowns = {
      'elogio': 30,      // 30 segundos
      'abracar': 15,     // 15 segundos
      'meama': 60,       // 1 minuto
      'chorar': 300,     // 5 minutos
      'conta': 120,      // 2 minutos
      'historinha': 180,  // 3 minutos
      'memoria': 240,    // 4 minutos
      'fantasia': 600    // 10 minutos
    };
    
    const baseCooldown = baseCooldowns[commandName] || 60;
    
    // Reduz cooldown para usuários com alta interação
    if (userStats.totalInteractions > 50) {
      return Math.max(baseCooldown * 0.5, 10); // Mínimo 10 segundos
    }
    
    // Aumenta cooldown para usuários muito ativos
    if (userStats.recentCommands > 10) {
      return baseCooldown * 2;
    }
    
    return baseCooldown;
  }

  // Limpa cooldowns expirados
  async cleanupExpiredCooldowns() {
    if (!this.initialized) return;
    
    try {
      const now = Date.now();
      const expiredKeys = [];
      
      for (const [key, data] of this.memoryCache.entries()) {
        if (data.cooldownEnd < now) {
          expiredKeys.push(key);
        }
      }
      
      expiredKeys.forEach(key => this.memoryCache.delete(key));
      
      if (expiredKeys.length > 0) {
        console.log(`[COOLDOWN-MANAGER] 🧹 Limpeza: ${expiredKeys.length} cooldowns expirados`);
      }
    } catch (error) {
      console.error('[COOLDOWN-MANAGER] Erro na limpeza:', error.message);
    }
  }

  // Obtém estatísticas de cooldown
  getStats() {
    return {
      cacheSize: this.memoryCache.size,
      maxCacheSize: this.cacheSize,
      initialized: this.initialized
    };
  }
}

export default new CooldownManager();
