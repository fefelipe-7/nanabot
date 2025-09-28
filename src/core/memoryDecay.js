// src/core/memoryDecay.js - Sistema de Decaimento de Memória da Nanabot
// Gerencia o decaimento natural e artificial das memórias

import { loadState, saveState } from '../utils/stateManager.js';

class MemoryDecaySystem {
  constructor() {
    this.decayRate = 0.001; // Taxa de decaimento por dia (0-1)
    this.retentionThreshold = 0.1; // Limiar de retenção mínima
    this.importanceWeight = 0.8; // Peso da importância no decaimento
    this.emotionalWeight = 0.6; // Peso emocional no decaimento
    this.accessWeight = 0.4; // Peso do acesso no decaimento
    this.decayHistory = [];
    this.lastDecayCheck = new Date().toISOString();
    this.loadMemoryDecayState();
  }

  // Carrega estado do decaimento de memória
  loadMemoryDecayState() {
    const state = loadState('memoryDecay', this.getDefaultState());
    this.decayRate = state.decayRate || 0.001;
    this.retentionThreshold = state.retentionThreshold || 0.1;
    this.importanceWeight = state.importanceWeight || 0.8;
    this.emotionalWeight = state.emotionalWeight || 0.6;
    this.accessWeight = state.accessWeight || 0.4;
    this.decayHistory = state.decayHistory || [];
    this.lastDecayCheck = state.lastDecayCheck || new Date().toISOString();
  }

  // Salva estado do decaimento de memória
  saveMemoryDecayState() {
    const state = {
      decayRate: this.decayRate,
      retentionThreshold: this.retentionThreshold,
      importanceWeight: this.importanceWeight,
      emotionalWeight: this.emotionalWeight,
      accessWeight: this.accessWeight,
      decayHistory: this.decayHistory.slice(-200),
      lastDecayCheck: this.lastDecayCheck
    };
    saveState('memoryDecay', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      decayRate: 0.001,
      retentionThreshold: 0.1,
      importanceWeight: 0.8,
      emotionalWeight: 0.6,
      accessWeight: 0.4,
      decayHistory: [],
      lastDecayCheck: new Date().toISOString()
    };
  }

  // Processa decaimento de memória
  processMemoryDecay(memories, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa memórias para decaimento
    const analysis = this.analyzeMemoryDecay(memories, context);
    
    // Aplica decaimento
    const decayedMemories = this.applyMemoryDecay(analysis, context);
    
    // Registra no histórico
    this.recordMemoryDecay(analysis, decayedMemories, timestamp);
    
    this.lastDecayCheck = timestamp;
    this.saveMemoryDecayState();
    
    return {
      analysis,
      decayedMemories,
      decayRate: this.decayRate,
      retentionThreshold: this.retentionThreshold
    };
  }

  // Analisa memórias para decaimento
  analyzeMemoryDecay(memories, context) {
    const analysis = {
      totalMemories: memories.size,
      memoriesToDecay: [],
      memoriesToRetain: [],
      memoriesToForget: [],
      decayFactors: [],
      retentionFactors: []
    };
    
    for (const [id, memory] of memories) {
      const decayAnalysis = this.analyzeMemoryDecayFactors(memory, context);
      
      if (decayAnalysis.shouldForget) {
        analysis.memoriesToForget.push({ id, memory, decayAnalysis });
      } else if (decayAnalysis.shouldDecay) {
        analysis.memoriesToDecay.push({ id, memory, decayAnalysis });
      } else {
        analysis.memoriesToRetain.push({ id, memory, decayAnalysis });
      }
      
      analysis.decayFactors.push(decayAnalysis.decayFactors);
      analysis.retentionFactors.push(decayAnalysis.retentionFactors);
    }
    
    return analysis;
  }

  // Analisa fatores de decaimento de uma memória
  analyzeMemoryDecayFactors(memory, context) {
    const now = new Date();
    const memoryAge = this.calculateMemoryAge(memory);
    const timeDecay = this.calculateTimeDecay(memoryAge);
    const importanceDecay = this.calculateImportanceDecay(memory);
    const emotionalDecay = this.calculateEmotionalDecay(memory);
    const accessDecay = this.calculateAccessDecay(memory);
    
    const decayFactors = {
      timeDecay,
      importanceDecay,
      emotionalDecay,
      accessDecay,
      totalDecay: 0
    };
    
    const retentionFactors = {
      importance: memory.importance || 0.5,
      emotionalWeight: memory.emotionalWeight || 0.5,
      accessCount: memory.accessCount || 0,
      lastAccessed: memory.lastAccessed,
      totalRetention: 0
    };
    
    // Calcula decaimento total
    decayFactors.totalDecay = (
      timeDecay * 0.4 +
      importanceDecay * this.importanceWeight +
      emotionalDecay * this.emotionalWeight +
      accessDecay * this.accessWeight
    ) / 4;
    
    // Calcula retenção total
    retentionFactors.totalRetention = (
      retentionFactors.importance * 0.4 +
      retentionFactors.emotionalWeight * 0.3 +
      Math.min(1, retentionFactors.accessCount / 10) * 0.2 +
      (memoryAge < 7 ? 0.1 : 0) // Bônus para memórias recentes
    );
    
    const shouldDecay = decayFactors.totalDecay > this.decayRate;
    const shouldForget = retentionFactors.totalRetention < this.retentionThreshold;
    
    return {
      decayFactors,
      retentionFactors,
      shouldDecay,
      shouldForget,
      memoryAge
    };
  }

  // Calcula idade da memória em dias
  calculateMemoryAge(memory) {
    const now = new Date();
    const memoryDate = new Date(memory.timestamp || memory.createdAt || now);
    const diffTime = Math.abs(now - memoryDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Dias
  }

  // Calcula decaimento por tempo
  calculateTimeDecay(memoryAge) {
    // Decaimento exponencial baseado na idade
    return Math.min(1, memoryAge * this.decayRate);
  }

  // Calcula decaimento por importância
  calculateImportanceDecay(memory) {
    const importance = memory.importance || 0.5;
    // Memórias menos importantes decaem mais rápido
    return Math.max(0, 1 - importance);
  }

  // Calcula decaimento emocional
  calculateEmotionalDecay(memory) {
    const emotionalWeight = memory.emotionalWeight || 0.5;
    // Memórias menos emocionais decaem mais rápido
    return Math.max(0, 1 - emotionalWeight);
  }

  // Calcula decaimento por acesso
  calculateAccessDecay(memory) {
    const accessCount = memory.accessCount || 0;
    const lastAccessed = memory.lastAccessed;
    
    if (!lastAccessed) return 1; // Memórias nunca acessadas decaem completamente
    
    const now = new Date();
    const lastAccessDate = new Date(lastAccessed);
    const daysSinceAccess = Math.ceil((now - lastAccessDate) / (1000 * 60 * 60 * 24));
    
    // Memórias não acessadas recentemente decaem mais
    const accessDecay = Math.min(1, daysSinceAccess * 0.1);
    
    // Memórias com muitos acessos decaem menos
    const accessBonus = Math.min(0.5, accessCount * 0.05);
    
    return Math.max(0, accessDecay - accessBonus);
  }

  // Aplica decaimento de memória
  applyMemoryDecay(analysis, context) {
    const decayedMemories = {
      decayed: [],
      forgotten: [],
      retained: []
    };
    
    // Processa memórias para decaimento
    for (const { id, memory, decayAnalysis } of analysis.memoriesToDecay) {
      const decayedMemory = this.decayMemory(memory, decayAnalysis);
      decayedMemories.decayed.push({ id, memory: decayedMemory });
    }
    
    // Processa memórias para esquecimento
    for (const { id, memory, decayAnalysis } of analysis.memoriesToForget) {
      decayedMemories.forgotten.push({ id, memory, decayAnalysis });
    }
    
    // Processa memórias para retenção
    for (const { id, memory, decayAnalysis } of analysis.memoriesToRetain) {
      decayedMemories.retained.push({ id, memory, decayAnalysis });
    }
    
    return decayedMemories;
  }

  // Decai uma memória específica
  decayMemory(memory, decayAnalysis) {
    const decayedMemory = { ...memory };
    
    // Aplica decaimento à força da memória
    if (decayedMemory.strength) {
      decayedMemory.strength = Math.max(0, decayedMemory.strength - decayAnalysis.decayFactors.totalDecay);
    }
    
    // Aplica decaimento à importância
    if (decayedMemory.importance) {
      decayedMemory.importance = Math.max(0, decayedMemory.importance - decayAnalysis.decayFactors.totalDecay * 0.5);
    }
    
    // Aplica decaimento ao peso emocional
    if (decayedMemory.emotionalWeight) {
      decayedMemory.emotionalWeight = Math.max(0, decayedMemory.emotionalWeight - decayAnalysis.decayFactors.totalDecay * 0.3);
    }
    
    // Marca como decaída
    decayedMemory.decayed = true;
    decayedMemory.lastDecay = new Date().toISOString();
    
    return decayedMemory;
  }

  // Registra decaimento de memória
  recordMemoryDecay(analysis, decayedMemories, timestamp) {
    const record = {
      timestamp,
      analysis,
      decayedMemories,
      decayRate: this.decayRate,
      retentionThreshold: this.retentionThreshold
    };
    
    this.decayHistory.push(record);
    
    // Mantém histórico limitado
    if (this.decayHistory.length > 300) {
      this.decayHistory = this.decayHistory.slice(-300);
    }
  }

  // Ajusta taxa de decaimento baseada no contexto
  adjustDecayRate(context) {
    let adjustment = 1.0;
    
    // Ajusta baseado na idade mental
    if (context.mentalAge < 3) {
      adjustment *= 1.5; // Crianças mais novas esquecem mais rápido
    } else if (context.mentalAge > 5) {
      adjustment *= 0.8; // Crianças mais velhas retêm mais
    }
    
    // Ajusta baseado no estresse
    if (context.stressLevel > 0.7) {
      adjustment *= 1.3; // Estresse acelera o decaimento
    }
    
    // Ajusta baseado na estabilidade emocional
    if (context.emotionalStability < 0.4) {
      adjustment *= 1.2; // Instabilidade emocional acelera o decaimento
    }
    
    this.decayRate = Math.min(0.01, Math.max(0.0001, this.decayRate * adjustment));
  }

  // Obtém estatísticas do decaimento de memória
  getMemoryDecayStats() {
    const stats = {
      decayRate: this.decayRate,
      retentionThreshold: this.retentionThreshold,
      importanceWeight: this.importanceWeight,
      emotionalWeight: this.emotionalWeight,
      accessWeight: this.accessWeight,
      totalDecayEvents: this.decayHistory.length,
      recentDecay: this.decayHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de decaimento de memória
  resetMemoryDecaySystem() {
    this.decayRate = 0.001;
    this.retentionThreshold = 0.1;
    this.importanceWeight = 0.8;
    this.emotionalWeight = 0.6;
    this.accessWeight = 0.4;
    this.decayHistory = [];
    this.lastDecayCheck = new Date().toISOString();
  }
}

export default MemoryDecaySystem;

