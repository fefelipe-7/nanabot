// src/utils/db.js - Sistema de Banco de Dados da Nanabot
// Gerencia conexões, queries e operações de banco de dados

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseManager {
  constructor() {
    this.db = null;
    this.isConnected = false;
    this.dbPath = path.join(__dirname, '../../data/nanabot.db');
    this.connectionRetries = 0;
    this.maxRetries = 3;
    this.lastConnectionAttempt = null;
  }

  // Conecta ao banco de dados
  async connect() {
    try {
      if (this.isConnected && this.db) {
        return this.db;
      }

      this.lastConnectionAttempt = new Date();
      
      // Cria diretório se não existir
      const dbDir = path.dirname(this.dbPath);
      await this.ensureDirectoryExists(dbDir);

      // Conecta ao SQLite
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar ao banco de dados:', err);
          this.isConnected = false;
          throw err;
        } else {
          console.log('✅ Conectado ao banco de dados SQLite');
          this.isConnected = true;
          this.connectionRetries = 0;
        }
      });

      // Promisifica métodos do banco
      this.db.run = promisify(this.db.run.bind(this.db));
      this.db.get = promisify(this.db.get.bind(this.db));
      this.db.all = promisify(this.db.all.bind(this.db));
      this.db.close = promisify(this.db.close.bind(this.db));

      // Inicializa tabelas
      await this.initializeTables();

      return this.db;
    } catch (error) {
      this.connectionRetries++;
      console.error(`Erro na conexão (tentativa ${this.connectionRetries}):`, error);
      
      if (this.connectionRetries < this.maxRetries) {
        console.log('Tentando reconectar em 2 segundos...');
        await this.sleep(2000);
        return this.connect();
      } else {
        throw new Error(`Falha ao conectar após ${this.maxRetries} tentativas`);
      }
    }
  }

  // Garante que o diretório existe
  async ensureDirectoryExists(dirPath) {
    const fs = await import('fs');
    const { mkdir } = fs.promises;
    
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  // Inicializa tabelas do banco
  async initializeTables() {
    const tables = [
      // Tabela de memórias
      `CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        emotional_weight REAL DEFAULT 0.5,
        access_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_protected BOOLEAN DEFAULT FALSE
      )`,
      
      // Tabela de memórias esquecidas
      `CREATE TABLE IF NOT EXISTS forgotten_memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_id INTEGER,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        emotional_weight REAL DEFAULT 0.5,
        forgotten_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reason TEXT DEFAULT 'memory_decay'
      )`,
      
      // Tabela de interações
      `CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_role TEXT NOT NULL,
        input_text TEXT NOT NULL,
        response_text TEXT,
        emotional_intensity REAL DEFAULT 0.5,
        processing_time INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de aprendizado
      `CREATE TABLE IF NOT EXISTS learning_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        concept TEXT NOT NULL,
        category TEXT NOT NULL,
        confidence REAL DEFAULT 0.5,
        importance REAL DEFAULT 0.5,
        access_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de emoções
      `CREATE TABLE IF NOT EXISTS emotions_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emotion TEXT NOT NULL,
        intensity REAL NOT NULL,
        trigger_text TEXT,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de crescimento
      `CREATE TABLE IF NOT EXISTS growth_milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        milestone_type TEXT NOT NULL,
        description TEXT NOT NULL,
        impact_score REAL DEFAULT 0.5,
        age_at_milestone REAL DEFAULT 4.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de vocabulário
      `CREATE TABLE IF NOT EXISTS vocabulary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        meaning TEXT,
        category TEXT,
        usage_count INTEGER DEFAULT 0,
        confidence REAL DEFAULT 0.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de histórias
      `CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        characters TEXT,
        setting TEXT,
        moral TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de expressões
      `CREATE TABLE IF NOT EXISTS expressions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expression_type TEXT NOT NULL,
        content TEXT NOT NULL,
        emotion TEXT,
        confidence REAL DEFAULT 0.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Tabela de mal-entendidos
      `CREATE TABLE IF NOT EXISTS misunderstandings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_text TEXT NOT NULL,
        misunderstanding_type TEXT NOT NULL,
        clarification TEXT,
        resolved BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME
      )`
    ];

    for (const tableSQL of tables) {
      try {
        await this.db.run(tableSQL);
      } catch (error) {
        console.error('Erro ao criar tabela:', error);
        throw error;
      }
    }

    console.log('✅ Tabelas do banco de dados inicializadas');
  }

  // Executa query SQL
  async query(sql, params = []) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = await this.db.all(sql, params);
      return result;
    } catch (error) {
      console.error('Erro na query:', error);
      throw error;
    }
  }

  // Executa query SQL e retorna uma linha
  async queryOne(sql, params = []) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = await this.db.get(sql, params);
      return result;
    } catch (error) {
      console.error('Erro na queryOne:', error);
      throw error;
    }
  }

  // Executa query SQL de inserção/atualização
  async execute(sql, params = []) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = await this.db.run(sql, params);
      return result;
    } catch (error) {
      console.error('Erro na execução:', error);
      throw error;
    }
  }

  // Insere dados na tabela
  async insert(table, data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      const result = await this.execute(sql, values);
      
      return {
        id: result?.lastID || 0,
        changes: result?.changes || 0
      };
    } catch (error) {
      console.error('Erro na inserção:', error);
      throw error;
    }
  }

  // Atualiza dados na tabela
  async update(table, data, whereClause, whereParams = []) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map(col => `${col} = ?`).join(', ');
      
      const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
      const allParams = [...values, ...whereParams];
      
      const result = await this.execute(sql, allParams);
      
      return {
        changes: result.changes
      };
    } catch (error) {
      console.error('Erro na atualização:', error);
      throw error;
    }
  }

  // Deleta dados da tabela
  async delete(table, whereClause, whereParams = []) {
    try {
      const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
      const result = await this.execute(sql, whereParams);
      
      return {
        changes: result.changes
      };
    } catch (error) {
      console.error('Erro na deleção:', error);
      throw error;
    }
  }

  // Busca dados na tabela
  async select(table, columns = '*', whereClause = '', whereParams = []) {
    try {
      let sql = `SELECT ${columns} FROM ${table}`;
      
      if (whereClause) {
        sql += ` WHERE ${whereClause}`;
      }
      
      const result = await this.query(sql, whereParams);
      return result;
    } catch (error) {
      console.error('Erro na busca:', error);
      throw error;
    }
  }

  // Busca uma linha na tabela
  async selectOne(table, columns = '*', whereClause = '', whereParams = []) {
    try {
      let sql = `SELECT ${columns} FROM ${table}`;
      
      if (whereClause) {
        sql += ` WHERE ${whereClause}`;
      }
      
      const result = await this.queryOne(sql, whereParams);
      return result;
    } catch (error) {
      console.error('Erro na busca única:', error);
      throw error;
    }
  }

  // Executa transação
  async transaction(callback) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      await this.db.run('BEGIN TRANSACTION');
      
      try {
        const result = await callback(this);
        await this.db.run('COMMIT');
        return result;
      } catch (error) {
        await this.db.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro na transação:', error);
      throw error;
    }
  }

  // Verifica saúde do banco
  async healthCheck() {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = await this.queryOne('SELECT 1 as health');
      return {
        status: 'healthy',
        connected: this.isConnected,
        lastCheck: new Date().toISOString(),
        result: result
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Obtém estatísticas do banco
  async getStats() {
    try {
      const stats = {};
      
      // Conta registros em cada tabela
      const tables = [
        'memories', 'forgotten_memories', 'interactions', 
        'learning_records', 'emotions_log', 'growth_milestones',
        'vocabulary', 'stories', 'expressions', 'misunderstandings'
      ];
      
      for (const table of tables) {
        try {
          const count = await this.queryOne(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = count.count;
        } catch (error) {
          stats[table] = 0;
        }
      }
      
      // Informações do banco
      const dbInfo = await this.queryOne('SELECT COUNT(*) as total_tables FROM sqlite_master WHERE type="table"');
      stats.totalTables = dbInfo.total_tables;
      stats.isConnected = this.isConnected;
      stats.lastConnectionAttempt = this.lastConnectionAttempt;
      stats.connectionRetries = this.connectionRetries;
      
      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        error: error.message,
        isConnected: this.isConnected
      };
    }
  }

  // Desconecta do banco
  async disconnect() {
    try {
      if (this.db && this.isConnected) {
        await this.db.close();
        this.isConnected = false;
        console.log('✅ Desconectado do banco de dados');
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      throw error;
    }
  }

  // Reconecta ao banco
  async reconnect() {
    try {
      await this.disconnect();
      await this.sleep(1000);
      await this.connect();
    } catch (error) {
      console.error('Erro ao reconectar:', error);
      throw error;
    }
  }

  // Utilitário para sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Backup do banco
  async backup(backupPath) {
    try {
      const fs = await import('fs');
      const { copyFile } = fs.promises;
      
      await copyFile(this.dbPath, backupPath);
      console.log(`✅ Backup criado em: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Erro no backup:', error);
      throw error;
    }
  }

  // Restaura backup
  async restore(backupPath) {
    try {
      const fs = await import('fs');
      const { copyFile } = fs.promises;
      
      await this.disconnect();
      await copyFile(backupPath, this.dbPath);
      await this.connect();
      console.log(`✅ Backup restaurado de: ${backupPath}`);
    } catch (error) {
      console.error('Erro na restauração:', error);
      throw error;
    }
  }
}

// Instância global do gerenciador de banco
const dbManager = new DatabaseManager();

// Funções de conveniência
export const connectDB = () => dbManager.connect();
export const queryDB = (sql, params) => dbManager.query(sql, params);
export const queryOneDB = (sql, params) => dbManager.queryOne(sql, params);
export const executeDB = (sql, params) => dbManager.execute(sql, params);
export const insertDB = (table, data) => dbManager.insert(table, data);
export const updateDB = (table, data, whereClause, whereParams) => dbManager.update(table, data, whereClause, whereParams);
export const deleteDB = (table, whereClause, whereParams) => dbManager.delete(table, whereClause, whereParams);
export const selectDB = (table, columns, whereClause, whereParams) => dbManager.select(table, columns, whereClause, whereParams);
export const selectOneDB = (table, columns, whereClause, whereParams) => dbManager.selectOne(table, columns, whereClause, whereParams);
export const transactionDB = (callback) => dbManager.transaction(callback);
export const healthCheckDB = () => dbManager.healthCheck();
export const getStatsDB = () => dbManager.getStats();
export const disconnectDB = () => dbManager.disconnect();
export const reconnectDB = () => dbManager.reconnect();
export const backupDB = (backupPath) => dbManager.backup(backupPath);
export const restoreDB = (backupPath) => dbManager.restore(backupPath);

export default dbManager;
