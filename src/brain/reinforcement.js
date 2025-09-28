// src/brain/reinforcement.js - Sistema de Reforço da Nanabot
// Gerencia recompensas, punições e aprendizado por reforço

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReinforcementSystem {
  constructor() {
    this.rewards = new Map();
    this.punishments = new Map();
    this.behaviors = new Map();
    this.reinforcementHistory = [];
    this.rewardThreshold = 0.7;
    this.punishmentThreshold = 0.3;
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.lastUpdate = new Date().toISOString();
    this.loadReinforcementState();
  }

  // Carrega estado do reforço
  loadReinforcementState() {
    try {
      const reinforcementPath = path.resolve(__dirname, '../../data/reinforcementState.json');
      if (fs.existsSync(reinforcementPath)) {
        const data = fs.readFileSync(reinforcementPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.rewards = new Map(state.rewards || []);
        this.punishments = new Map(state.punishments || []);
        this.behaviors = new Map(state.behaviors || []);
        this.reinforcementHistory = state.reinforcementHistory || [];
        this.rewardThreshold = state.rewardThreshold || 0.7;
        this.punishmentThreshold = state.punishmentThreshold || 0.3;
        this.learningRate = state.learningRate || 0.1;
        this.discountFactor = state.discountFactor || 0.9;
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado do reforço:', error);
    }
  }

  // Salva estado do reforço
  saveReinforcementState() {
    try {
      const reinforcementPath = path.resolve(__dirname, '../../data/reinforcementState.json');
      const state = {
        rewards: Array.from(this.rewards.entries()),
        punishments: Array.from(this.punishments.entries()),
        behaviors: Array.from(this.behaviors.entries()),
        reinforcementHistory: this.reinforcementHistory.slice(-300), // Últimas 300 entradas
        rewardThreshold: this.rewardThreshold,
        punishmentThreshold: this.punishmentThreshold,
        learningRate: this.learningRate,
        discountFactor: this.discountFactor,
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(reinforcementPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado do reforço:', error);
    }
  }

  // Processa reforço
  processReinforcement(behavior, feedback, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    const reinforcement = {
      behavior,
      feedback,
      context,
      timestamp,
      type: this.determineReinforcementType(feedback),
      intensity: this.calculateIntensity(feedback, context),
      value: this.calculateValue(feedback, context)
    };
    
    // Aplica reforço
    this.applyReinforcement(reinforcement);
    
    // Atualiza comportamento
    this.updateBehavior(behavior, reinforcement);
    
    // Registra no histórico
    this.recordReinforcement(reinforcement);
    
    this.lastUpdate = timestamp;
    this.saveReinforcementState();
    
    return reinforcement;
  }

  // Determina tipo de reforço
  determineReinforcementType(feedback) {
    if (typeof feedback === 'string') {
      const lowerFeedback = feedback.toLowerCase();
      
      if (lowerFeedback.includes('bom') || lowerFeedback.includes('bem') || 
          lowerFeedback.includes('parabéns') || lowerFeedback.includes('ótimo')) {
        return 'positive';
      }
      
      if (lowerFeedback.includes('ruim') || lowerFeedback.includes('mal') || 
          lowerFeedback.includes('não') || lowerFeedback.includes('errado')) {
        return 'negative';
      }
    }
    
    if (typeof feedback === 'number') {
      if (feedback > 0.5) return 'positive';
      if (feedback < 0.3) return 'negative';
      return 'neutral';
    }
    
    if (typeof feedback === 'boolean') {
      return feedback ? 'positive' : 'negative';
    }
    
    return 'neutral';
  }

  // Calcula intensidade do reforço
  calculateIntensity(feedback, context) {
    let intensity = 0.5; // Base
    
    if (typeof feedback === 'number') {
      intensity = Math.abs(feedback);
    } else if (typeof feedback === 'string') {
      const lowerFeedback = feedback.toLowerCase();
      
      // Intensidade baseada em palavras
      if (lowerFeedback.includes('muito') || lowerFeedback.includes('super') || 
          lowerFeedback.includes('demais') || lowerFeedback.includes('incrível')) {
        intensity = 0.9;
      } else if (lowerFeedback.includes('bastante') || lowerFeedback.includes('bem')) {
        intensity = 0.7;
      } else if (lowerFeedback.includes('um pouco') || lowerFeedback.includes('meio')) {
        intensity = 0.4;
      }
    }
    
    // Ajusta intensidade baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      intensity *= 1.2; // 20% mais intenso com os pais
    }
    
    if (context.emotionalIntensity > 0.7) {
      intensity *= 1.1; // 10% mais intenso em contextos emocionais
    }
    
    return Math.min(1, intensity);
  }

  // Calcula valor do reforço
  calculateValue(feedback, context) {
    const type = this.determineReinforcementType(feedback);
    const intensity = this.calculateIntensity(feedback, context);
    
    let value = 0;
    
    switch (type) {
      case 'positive':
        value = intensity;
        break;
      case 'negative':
        value = -intensity;
        break;
      case 'neutral':
        value = 0;
        break;
    }
    
    return value;
  }

  // Aplica reforço
  applyReinforcement(reinforcement) {
    const { behavior, type, intensity, value } = reinforcement;
    
    if (type === 'positive') {
      this.applyReward(behavior, intensity, value);
    } else if (type === 'negative') {
      this.applyPunishment(behavior, intensity, value);
    }
  }

  // Aplica recompensa
  applyReward(behavior, intensity, value) {
    const behaviorKey = this.getBehaviorKey(behavior);
    
    if (!this.rewards.has(behaviorKey)) {
      this.rewards.set(behaviorKey, {
        behavior: behavior,
        totalRewards: 0,
        averageReward: 0,
        lastReward: null,
        frequency: 0,
        confidence: 0.1
      });
    }
    
    const reward = this.rewards.get(behaviorKey);
    reward.totalRewards += value;
    reward.frequency++;
    reward.averageReward = reward.totalRewards / reward.frequency;
    reward.lastReward = new Date().toISOString();
    reward.confidence = Math.min(1, reward.confidence + intensity * 0.1);
  }

  // Aplica punição
  applyPunishment(behavior, intensity, value) {
    const behaviorKey = this.getBehaviorKey(behavior);
    
    if (!this.punishments.has(behaviorKey)) {
      this.punishments.set(behaviorKey, {
        behavior: behavior,
        totalPunishments: 0,
        averagePunishment: 0,
        lastPunishment: null,
        frequency: 0,
        confidence: 0.1
      });
    }
    
    const punishment = this.punishments.get(behaviorKey);
    punishment.totalPunishments += Math.abs(value);
    punishment.frequency++;
    punishment.averagePunishment = punishment.totalPunishments / punishment.frequency;
    punishment.lastPunishment = new Date().toISOString();
    punishment.confidence = Math.min(1, punishment.confidence + intensity * 0.1);
  }

  // Atualiza comportamento
  updateBehavior(behavior, reinforcement) {
    const behaviorKey = this.getBehaviorKey(behavior);
    
    if (!this.behaviors.has(behaviorKey)) {
      this.behaviors.set(behaviorKey, {
        behavior: behavior,
        qValue: 0.5, // Valor Q inicial
        frequency: 0,
        lastUpdate: new Date().toISOString(),
        successRate: 0.5,
        confidence: 0.1
      });
    }
    
    const behaviorData = this.behaviors.get(behaviorKey);
    
    // Atualiza valor Q usando Q-learning
    const reward = reinforcement.value;
    const currentQ = behaviorData.qValue;
    const newQ = currentQ + this.learningRate * (reward - currentQ);
    
    behaviorData.qValue = Math.max(0, Math.min(1, newQ));
    behaviorData.frequency++;
    behaviorData.lastUpdate = new Date().toISOString();
    
    // Atualiza taxa de sucesso
    if (reinforcement.type === 'positive') {
      behaviorData.successRate = Math.min(1, behaviorData.successRate + 0.1);
    } else if (reinforcement.type === 'negative') {
      behaviorData.successRate = Math.max(0, behaviorData.successRate - 0.1);
    }
    
    // Atualiza confiança
    behaviorData.confidence = Math.min(1, behaviorData.confidence + reinforcement.intensity * 0.05);
  }

  // Obtém chave do comportamento
  getBehaviorKey(behavior) {
    if (typeof behavior === 'string') {
      return behavior;
    }
    
    if (typeof behavior === 'object' && behavior.type) {
      return behavior.type;
    }
    
    return JSON.stringify(behavior);
  }

  // Registra reforço
  recordReinforcement(reinforcement) {
    this.reinforcementHistory.push(reinforcement);
    
    // Mantém histórico limitado
    if (this.reinforcementHistory.length > 500) {
      this.reinforcementHistory = this.reinforcementHistory.slice(-500);
    }
  }

  // Obtém comportamento recomendado
  getRecommendedBehavior(context = {}) {
    const behaviors = Array.from(this.behaviors.values());
    
    if (behaviors.length === 0) return null;
    
    // Filtra comportamentos por contexto
    const filteredBehaviors = behaviors.filter(behavior => 
      this.isBehaviorAppropriate(behavior, context)
    );
    
    if (filteredBehaviors.length === 0) return null;
    
    // Ordena por valor Q e confiança
    const sortedBehaviors = filteredBehaviors.sort((a, b) => {
      const scoreA = a.qValue * a.confidence;
      const scoreB = b.qValue * b.confidence;
      return scoreB - scoreA;
    });
    
    return sortedBehaviors[0];
  }

  // Verifica se comportamento é apropriado
  isBehaviorAppropriate(behavior, context) {
    // Verifica se comportamento é apropriado para o contexto
    if (context.userRole === 'amiguinho' && behavior.behavior.includes('mamãe')) {
      return false;
    }
    
    if (context.emotionalIntensity > 0.8 && behavior.behavior.includes('brincar')) {
      return false;
    }
    
    return true;
  }

  // Obtém recompensas por comportamento
  getRewardsForBehavior(behavior) {
    const behaviorKey = this.getBehaviorKey(behavior);
    return this.rewards.get(behaviorKey) || null;
  }

  // Obtém punições por comportamento
  getPunishmentsForBehavior(behavior) {
    const behaviorKey = this.getBehaviorKey(behavior);
    return this.punishments.get(behaviorKey) || null;
  }

  // Obtém valor Q de um comportamento
  getQValue(behavior) {
    const behaviorKey = this.getBehaviorKey(behavior);
    const behaviorData = this.behaviors.get(behaviorKey);
    return behaviorData ? behaviorData.qValue : 0.5;
  }

  // Obtém taxa de sucesso de um comportamento
  getSuccessRate(behavior) {
    const behaviorKey = this.getBehaviorKey(behavior);
    const behaviorData = this.behaviors.get(behaviorKey);
    return behaviorData ? behaviorData.successRate : 0.5;
  }

  // Obtém comportamentos mais recompensados
  getMostRewardedBehaviors(limit = 10) {
    const behaviors = Array.from(this.behaviors.values());
    
    return behaviors
      .sort((a, b) => b.qValue - a.qValue)
      .slice(0, limit)
      .map(behavior => ({
        behavior: behavior.behavior,
        qValue: behavior.qValue,
        successRate: behavior.successRate,
        confidence: behavior.confidence,
        frequency: behavior.frequency
      }));
  }

  // Obtém comportamentos menos recompensados
  getLeastRewardedBehaviors(limit = 10) {
    const behaviors = Array.from(this.behaviors.values());
    
    return behaviors
      .sort((a, b) => a.qValue - b.qValue)
      .slice(0, limit)
      .map(behavior => ({
        behavior: behavior.behavior,
        qValue: behavior.qValue,
        successRate: behavior.successRate,
        confidence: behavior.confidence,
        frequency: behavior.frequency
      }));
  }

  // Obtém estatísticas do reforço
  getReinforcementStats() {
    const stats = {
      totalBehaviors: this.behaviors.size,
      totalRewards: this.rewards.size,
      totalPunishments: this.punishments.size,
      averageQValue: 0,
      averageSuccessRate: 0,
      mostRewardedBehavior: null,
      leastRewardedBehavior: null,
      recentReinforcements: this.reinforcementHistory.slice(-20)
    };
    
    if (this.behaviors.size === 0) return stats;
    
    let totalQValue = 0;
    let totalSuccessRate = 0;
    let maxQValue = 0;
    let minQValue = 1;
    
    for (const [key, behavior] of this.behaviors) {
      totalQValue += behavior.qValue;
      totalSuccessRate += behavior.successRate;
      
      if (behavior.qValue > maxQValue) {
        maxQValue = behavior.qValue;
        stats.mostRewardedBehavior = {
          behavior: behavior.behavior,
          qValue: behavior.qValue,
          successRate: behavior.successRate
        };
      }
      
      if (behavior.qValue < minQValue) {
        minQValue = behavior.qValue;
        stats.leastRewardedBehavior = {
          behavior: behavior.behavior,
          qValue: behavior.qValue,
          successRate: behavior.successRate
        };
      }
    }
    
    stats.averageQValue = totalQValue / this.behaviors.size;
    stats.averageSuccessRate = totalSuccessRate / this.behaviors.size;
    
    return stats;
  }

  // Ajusta parâmetros de aprendizado
  adjustLearningParameters(successRate) {
    if (successRate > 0.8) {
      // Aumenta taxa de aprendizado se estiver indo bem
      this.learningRate = Math.min(0.3, this.learningRate + 0.01);
    } else if (successRate < 0.3) {
      // Diminui taxa de aprendizado se estiver indo mal
      this.learningRate = Math.max(0.01, this.learningRate - 0.01);
    }
    
    // Ajusta threshold de recompensa
    if (successRate > 0.7) {
      this.rewardThreshold = Math.min(0.9, this.rewardThreshold + 0.01);
    } else if (successRate < 0.4) {
      this.rewardThreshold = Math.max(0.5, this.rewardThreshold - 0.01);
    }
  }

  // Aplica decaimento de valores
  applyValueDecay() {
    const decayFactor = 0.99;
    
    for (const [key, behavior] of this.behaviors) {
      behavior.qValue *= decayFactor;
      behavior.confidence *= decayFactor;
    }
  }

  // Reseta sistema de reforço
  resetReinforcementSystem() {
    this.rewards.clear();
    this.punishments.clear();
    this.behaviors.clear();
    this.reinforcementHistory = [];
    this.rewardThreshold = 0.7;
    this.punishmentThreshold = 0.3;
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.lastUpdate = new Date().toISOString();
  }
}

export default ReinforcementSystem;

