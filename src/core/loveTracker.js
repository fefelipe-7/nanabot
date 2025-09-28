// src/core/loveTracker.js - Rastreador de Amor da Nanabot
// Gerencia níveis de amor, carinho e conexão emocional

import { loadState, saveState } from '../utils/stateManager.js';

class LoveTracker {
  constructor() {
    this.loveLevel = 0.7; // Nível de amor (0-1)
    this.loveHistory = new Map();
    this.loveExpressions = new Map();
    this.loveRecipients = new Map();
    this.loveStats = {
      totalExpressions: 0,
      averageIntensity: 0.5,
      lastExpression: null
    };
    this.lastUpdate = new Date().toISOString();
    this.loadLoveState();
  }

  // Carrega estado do amor
  loadLoveState() {
    const state = loadState('loveTracker', this.getDefaultState());
    this.loveLevel = state.loveLevel || 0.7;
    this.loveHistory = new Map(state.loveHistory || []);
    this.loveExpressions = new Map(state.loveExpressions || []);
    this.loveRecipients = new Map(state.loveRecipients || []);
    this.loveStats = state.loveStats || this.loveStats;
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado do amor
  saveLoveState() {
    const state = {
      loveLevel: this.loveLevel,
      loveHistory: Array.from(this.loveHistory.entries()),
      loveExpressions: Array.from(this.loveExpressions.entries()),
      loveRecipients: Array.from(this.loveRecipients.entries()),
      loveStats: this.loveStats,
      lastUpdate: this.lastUpdate
    };
    saveState('loveTracker', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      loveLevel: 0.7,
      loveHistory: [],
      loveExpressions: [],
      loveRecipients: [],
      loveStats: {
        totalExpressions: 0,
        averageIntensity: 0.5,
        lastExpression: null
      },
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa expressão de amor
  processLoveExpression(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa expressão de amor
    const analysis = this.analyzeLoveExpression(input, context);
    
    // Atualiza níveis de amor
    this.updateLoveLevels(analysis, context);
    
    // Registra expressão
    this.recordLoveExpression(analysis, context, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveLoveState();
    
    return {
      analysis,
      loveLevel: this.loveLevel,
      loveStats: this.loveStats
    };
  }

  // Analisa expressão de amor
  analyzeLoveExpression(input, context) {
    const analysis = {
      hasLoveWords: false,
      hasAffection: false,
      hasIntimacy: false,
      loveWords: [],
      affectionSigns: [],
      intimacySigns: [],
      loveIntensity: 0,
      recipient: context.userRole || 'unknown'
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta palavras de amor
    const loveWords = this.detectLoveWords(input);
    if (loveWords.length > 0) {
      analysis.hasLoveWords = true;
      analysis.loveWords = loveWords;
    }
    
    // Detecta sinais de afeto
    const affectionSigns = this.detectAffectionSigns(input);
    if (affectionSigns.length > 0) {
      analysis.hasAffection = true;
      analysis.affectionSigns = affectionSigns;
    }
    
    // Detecta sinais de intimidade
    const intimacySigns = this.detectIntimacySigns(input);
    if (intimacySigns.length > 0) {
      analysis.hasIntimacy = true;
      analysis.intimacySigns = intimacySigns;
    }
    
    // Calcula intensidade do amor
    analysis.loveIntensity = this.calculateLoveIntensity(analysis, context);
    
    return analysis;
  }

  // Detecta palavras de amor
  detectLoveWords(input) {
    const words = [];
    const lowerInput = input.toLowerCase();
    
    const loveKeywords = {
      'amor': ['amor', 'amar', 'amada', 'amado'],
      'carinho': ['carinho', 'carinhoso', 'carinhosa', 'carinhar'],
      'querer': ['querer', 'quero', 'querida', 'querido'],
      'gostar': ['gostar', 'gosto', 'gostosa', 'gostoso'],
      'coração': ['coração', 'coraçãozinho', 'coraçãozão'],
      'beijo': ['beijo', 'beijar', 'beijinho', 'beijão'],
      'abraço': ['abraço', 'abraçar', 'abraçinho', 'abração']
    };
    
    for (const [type, keywords] of Object.entries(loveKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          words.push({
            type: type,
            keyword: keyword,
            confidence: 0.8
          });
        }
      }
    }
    
    return words;
  }

  // Detecta sinais de afeto
  detectAffectionSigns(input) {
    const signs = [];
    const lowerInput = input.toLowerCase();
    
    const affectionKeywords = {
      'fofo': ['fofo', 'fofinho', 'fofura', 'fofíssimo'],
      'lindo': ['lindo', 'lindinho', 'lindura', 'lindíssimo'],
      'especial': ['especial', 'especialzinho', 'especialíssimo'],
      'precioso': ['precioso', 'preciosinho', 'preciosíssimo'],
      'doce': ['doce', 'docinho', 'doçura', 'docíssimo']
    };
    
    for (const [type, keywords] of Object.entries(affectionKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          signs.push({
            type: type,
            keyword: keyword,
            confidence: 0.7
          });
        }
      }
    }
    
    return signs;
  }

  // Detecta sinais de intimidade
  detectIntimacySigns(input) {
    const signs = [];
    const lowerInput = input.toLowerCase();
    
    const intimacyKeywords = {
      'mamãe': ['mamãe', 'mamãezinha', 'mamãezona'],
      'papai': ['papai', 'papazinho', 'papazão'],
      'família': ['família', 'familinha', 'familíssima'],
      'casa': ['casa', 'casinha', 'lar'],
      'juntos': ['juntos', 'juntinhos', 'juntos para sempre']
    };
    
    for (const [type, keywords] of Object.entries(intimacyKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          signs.push({
            type: type,
            keyword: keyword,
            confidence: 0.6
          });
        }
      }
    }
    
    return signs;
  }

  // Calcula intensidade do amor
  calculateLoveIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em palavras de amor
    if (analysis.hasLoveWords) {
      intensity += analysis.loveWords.length * 0.2;
    }
    
    // Intensidade baseada em sinais de afeto
    if (analysis.hasAffection) {
      intensity += analysis.affectionSigns.length * 0.15;
    }
    
    // Intensidade baseada em sinais de intimidade
    if (analysis.hasIntimacy) {
      intensity += analysis.intimacySigns.length * 0.1;
    }
    
    // Intensidade baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      intensity += 0.3;
    }
    
    return Math.min(1, intensity);
  }

  // Atualiza níveis de amor
  updateLoveLevels(analysis, context) {
    // Atualiza nível de amor
    if (analysis.loveIntensity > 0.3) {
      this.loveLevel = Math.min(1, this.loveLevel + analysis.loveIntensity * 0.1);
    }
    
    // Atualiza estatísticas
    this.loveStats.totalExpressions++;
    this.loveStats.averageIntensity = (this.loveStats.averageIntensity + analysis.loveIntensity) / 2;
    this.loveStats.lastExpression = new Date().toISOString();
    
    // Aplica decaimento natural
    this.loveLevel *= 0.999;
  }

  // Registra expressão de amor
  recordLoveExpression(analysis, context, timestamp) {
    const record = {
      timestamp,
      analysis,
      loveLevel: this.loveLevel,
      recipient: context.userRole || 'unknown',
      intensity: analysis.loveIntensity
    };
    
    // Adiciona ao histórico
    const historyKey = `${context.userRole}_${timestamp}`;
    this.loveHistory.set(historyKey, record);
    
    // Atualiza destinatário
    if (!this.loveRecipients.has(context.userRole)) {
      this.loveRecipients.set(context.userRole, {
        recipient: context.userRole,
        totalExpressions: 0,
        averageIntensity: 0,
        lastExpression: null
      });
    }
    
    const recipient = this.loveRecipients.get(context.userRole);
    recipient.totalExpressions++;
    recipient.averageIntensity = (recipient.averageIntensity + analysis.loveIntensity) / 2;
    recipient.lastExpression = timestamp;
    
    // Mantém histórico limitado
    if (this.loveHistory.size > 1000) {
      const oldestKey = this.loveHistory.keys().next().value;
      this.loveHistory.delete(oldestKey);
    }
  }

  // Obtém estatísticas do amor
  getLoveStats() {
    const stats = {
      loveLevel: this.loveLevel,
      totalExpressions: this.loveStats.totalExpressions,
      averageIntensity: this.loveStats.averageIntensity,
      lastExpression: this.loveStats.lastExpression,
      recipients: Array.from(this.loveRecipients.values()),
      recentExpressions: Array.from(this.loveHistory.values()).slice(-10)
    };
    
    return stats;
  }

  // Reseta rastreador de amor
  resetLoveTracker() {
    this.loveLevel = 0.7;
    this.loveHistory.clear();
    this.loveExpressions.clear();
    this.loveRecipients.clear();
    this.loveStats = {
      totalExpressions: 0,
      averageIntensity: 0.5,
      lastExpression: null
    };
    this.lastUpdate = new Date().toISOString();
  }
}

export default LoveTracker;
