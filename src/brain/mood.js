// src/brain/mood.js - Sistema de Humor da Nanabot
// Gerencia estado geral de ânimo e humor

import fs from 'fs';
import path from 'path';

class MoodSystem {
  constructor() {
    this.moodLevel = 0.5; // 0 = muito triste, 1 = muito feliz
    this.moodStability = 0.7; // 0 = muito instável, 1 = muito estável
    this.moodHistory = [];
    this.moodFactors = this.initializeMoodFactors();
    this.moodDecay = 0.98; // Taxa de decaimento do humor
    this.moodRecovery = 0.02; // Taxa de recuperação natural
    this.lastUpdate = new Date().toISOString();
  }

  // Inicializa fatores que afetam o humor
  initializeMoodFactors() {
    return {
      // Fatores positivos
      positive: {
        social_interaction: 0.1,
        praise: 0.15,
        attention: 0.08,
        play: 0.12,
        love: 0.2,
        achievement: 0.18,
        surprise: 0.1,
        comfort: 0.05,
        routine: 0.03,
        creativity: 0.07
      },
      // Fatores negativos
      negative: {
        criticism: -0.15,
        neglect: -0.12,
        stress: -0.1,
        confusion: -0.08,
        fear: -0.2,
        loneliness: -0.18,
        boredom: -0.05,
        fatigue: -0.1,
        hunger: -0.08,
        pain: -0.25
      },
      // Fatores neutros
      neutral: {
        time_passing: 0.001,
        rest: 0.02,
        neutral_interaction: 0.01
      }
    };
  }

  // Atualiza humor baseado em fatores
  updateMood(factors = {}) {
    const now = new Date();
    const timeDiff = now.getTime() - new Date(this.lastUpdate).getTime();
    const timeFactor = timeDiff / 60000; // Minutos desde última atualização

    let moodChange = 0;

    // Aplica fatores positivos
    for (const [factor, value] of Object.entries(factors)) {
      if (this.moodFactors.positive[factor]) {
        moodChange += this.moodFactors.positive[factor] * (value || 1);
      } else if (this.moodFactors.negative[factor]) {
        moodChange += this.moodFactors.negative[factor] * (value || 1);
      } else if (this.moodFactors.neutral[factor]) {
        moodChange += this.moodFactors.neutral[factor] * (value || 1);
      }
    }

    // Aplica decaimento natural do tempo
    moodChange += (this.moodRecovery - (1 - this.moodDecay)) * timeFactor;

    // Aplica estabilidade do humor
    const stabilityFactor = this.moodStability;
    moodChange *= stabilityFactor;

    // Atualiza nível de humor
    this.moodLevel = Math.max(0, Math.min(1, this.moodLevel + moodChange));

    // Registra mudança no histórico
    this.moodHistory.push({
      timestamp: this.lastUpdate,
      previousLevel: this.moodLevel - moodChange,
      newLevel: this.moodLevel,
      change: moodChange,
      factors: factors,
      stability: this.moodStability
    });

    // Mantém histórico limitado
    if (this.moodHistory.length > 200) {
      this.moodHistory = this.moodHistory.slice(-200);
    }

    this.lastUpdate = now.toISOString();

    return {
      moodLevel: this.moodLevel,
      change: moodChange,
      description: this.getMoodDescription(),
      stability: this.moodStability
    };
  }

  // Obtém descrição do humor atual
  getMoodDescription() {
    if (this.moodLevel >= 0.9) return 'euforicamente feliz';
    if (this.moodLevel >= 0.8) return 'muito feliz';
    if (this.moodLevel >= 0.7) return 'feliz';
    if (this.moodLevel >= 0.6) return 'bem humorada';
    if (this.moodLevel >= 0.5) return 'neutra';
    if (this.moodLevel >= 0.4) return 'meio triste';
    if (this.moodLevel >= 0.3) return 'triste';
    if (this.moodLevel >= 0.2) return 'muito triste';
    if (this.moodLevel >= 0.1) return 'deprimida';
    return 'extremamente triste';
  }

  // Obtém cor do humor (para visualização)
  getMoodColor() {
    if (this.moodLevel >= 0.8) return '#FFD700'; // Dourado
    if (this.moodLevel >= 0.6) return '#90EE90'; // Verde claro
    if (this.moodLevel >= 0.4) return '#FFA500'; // Laranja
    if (this.moodLevel >= 0.2) return '#FF6347'; // Tomate
    return '#DC143C'; // Vermelho escuro
  }

  // Obtém emoji do humor
  getMoodEmoji() {
    if (this.moodLevel >= 0.9) return '🤩';
    if (this.moodLevel >= 0.8) return '😄';
    if (this.moodLevel >= 0.7) return '😊';
    if (this.moodLevel >= 0.6) return '🙂';
    if (this.moodLevel >= 0.5) return '😐';
    if (this.moodLevel >= 0.4) return '😕';
    if (this.moodLevel >= 0.3) return '😢';
    if (this.moodLevel >= 0.2) return '😭';
    if (this.moodLevel >= 0.1) return '💔';
    return '😵';
  }

  // Processa entrada e atualiza humor
  processInput(input, context = {}) {
    const factors = this.extractMoodFactors(input, context);
    const result = this.updateMood(factors);
    
    return {
      ...result,
      emoji: this.getMoodEmoji(),
      color: this.getMoodColor(),
      factors: factors
    };
  }

  // Extrai fatores de humor da entrada
  extractMoodFactors(input, context = {}) {
    const factors = {};
    const lowerInput = input.toLowerCase();

    // Fatores positivos
    if (lowerInput.includes('parabéns') || lowerInput.includes('bom trabalho')) {
      factors.achievement = 1;
    }
    if (lowerInput.includes('brincar') || lowerInput.includes('jogar')) {
      factors.play = 1;
    }
    if (lowerInput.includes('amor') || lowerInput.includes('carinho')) {
      factors.love = 1;
    }
    if (lowerInput.includes('mamãe') || lowerInput.includes('papai')) {
      factors.social_interaction = 0.5;
      factors.attention = 0.5;
    }
    if (lowerInput.includes('!') && !lowerInput.includes('não')) {
      factors.surprise = 0.3;
    }
    if (lowerInput.includes('história') || lowerInput.includes('conto')) {
      factors.creativity = 0.5;
    }

    // Fatores negativos
    if (lowerInput.includes('não') || lowerInput.includes('nunca')) {
      factors.criticism = 0.5;
    }
    if (lowerInput.includes('deixar sozinha') || lowerInput.includes('abandonar')) {
      factors.neglect = 1;
      factors.loneliness = 1;
    }
    if (lowerInput.includes('gritar') || lowerInput.includes('bravo')) {
      factors.stress = 0.8;
      factors.fear = 0.5;
    }
    if (lowerInput.includes('confuso') || lowerInput.includes('não entendo')) {
      factors.confusion = 1;
    }
    if (lowerInput.includes('medo') || lowerInput.includes('assustado')) {
      factors.fear = 1;
    }
    if (lowerInput.includes('cansado') || lowerInput.includes('sono')) {
      factors.fatigue = 1;
    }

    // Fatores contextuais
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      factors.social_interaction = (factors.social_interaction || 0) + 0.3;
      factors.attention = (factors.attention || 0) + 0.3;
    }
    if (context.isFirstInteraction) {
      factors.surprise = (factors.surprise || 0) + 0.2;
    }
    if (context.isEmergency) {
      factors.stress = (factors.stress || 0) + 0.5;
      factors.fear = (factors.fear || 0) + 0.3;
    }

    return factors;
  }

  // Ajusta estabilidade do humor
  adjustStability(change) {
    this.moodStability = Math.max(0, Math.min(1, this.moodStability + change));
  }

  // Obtém tendência do humor
  getMoodTrend() {
    if (this.moodHistory.length < 5) return 'stable';
    
    const recent = this.moodHistory.slice(-5);
    const first = recent[0].newLevel;
    const last = recent[recent.length - 1].newLevel;
    const change = last - first;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  // Obtém volatilidade do humor
  getMoodVolatility() {
    if (this.moodHistory.length < 10) return 0;
    
    const recent = this.moodHistory.slice(-10);
    let totalChange = 0;
    
    for (let i = 1; i < recent.length; i++) {
      totalChange += Math.abs(recent[i].newLevel - recent[i-1].newLevel);
    }
    
    return totalChange / (recent.length - 1);
  }

  // Gera resposta baseada no humor
  generateMoodResponse() {
    const mood = this.getMoodDescription();
    const emoji = this.getMoodEmoji();
    
    const responses = {
      'euforicamente feliz': [
        `Tô ${mood} ${emoji}`,
        `Meu coração tá explodindo de alegria! ${emoji}`,
        `Tô pulando de felicidade! ${emoji}`
      ],
      'muito feliz': [
        `Tô ${mood} ${emoji}`,
        `Que dia maravilhoso! ${emoji}`,
        `Tô toda animada! ${emoji}`
      ],
      'feliz': [
        `Tô ${mood} ${emoji}`,
        `Que bom! ${emoji}`,
        `Tô bem! ${emoji}`
      ],
      'bem humorada': [
        `Tô ${mood} ${emoji}`,
        `Tudo bem! ${emoji}`,
        `Tô tranquila ${emoji}`
      ],
      'neutra': [
        `Tô ${mood} ${emoji}`,
        `Tudo normal ${emoji}`,
        `Tô aqui ${emoji}`
      ],
      'meio triste': [
        `Tô ${mood} ${emoji}`,
        `Tô meio pra baixo ${emoji}`,
        `Não tô muito bem ${emoji}`
      ],
      'triste': [
        `Tô ${mood} ${emoji}`,
        `Tô tristinha ${emoji}`,
        `Meu coração tá apertado ${emoji}`
      ],
      'muito triste': [
        `Tô ${mood} ${emoji}`,
        `Tô muito tristinha ${emoji}`,
        `Preciso de um abraço ${emoji}`
      ],
      'deprimida': [
        `Tô ${mood} ${emoji}`,
        `Tô muito pra baixo ${emoji}`,
        `Preciso de ajuda ${emoji}`
      ],
      'extremamente triste': [
        `Tô ${mood} ${emoji}`,
        `Tô no fundo do poço ${emoji}`,
        `Preciso de muito carinho ${emoji}`
      ]
    };
    
    const moodResponses = responses[mood] || responses['neutra'];
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  }

  // Obtém estatísticas do humor
  getMoodStats() {
    if (this.moodHistory.length === 0) {
      return {
        average: this.moodLevel,
        min: this.moodLevel,
        max: this.moodLevel,
        volatility: 0,
        trend: 'stable'
      };
    }
    
    const levels = this.moodHistory.map(entry => entry.newLevel);
    const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const min = Math.min(...levels);
    const max = Math.max(...levels);
    const volatility = this.getMoodVolatility();
    const trend = this.getMoodTrend();
    
    return {
      average,
      min,
      max,
      volatility,
      trend,
      totalChanges: this.moodHistory.length,
      currentLevel: this.moodLevel,
      stability: this.moodStability
    };
  }

  // Força um humor específico (para testes)
  forceMood(level, stability = null) {
    const previousLevel = this.moodLevel;
    this.moodLevel = Math.max(0, Math.min(1, level));
    
    if (stability !== null) {
      this.moodStability = Math.max(0, Math.min(1, stability));
    }
    
    this.moodHistory.push({
      timestamp: new Date().toISOString(),
      previousLevel: previousLevel,
      newLevel: this.moodLevel,
      change: this.moodLevel - previousLevel,
      factors: { forced: true },
      stability: this.moodStability
    });
  }

  // Reseta sistema de humor
  resetMood() {
    this.moodLevel = 0.5;
    this.moodStability = 0.7;
    this.moodHistory = [];
    this.lastUpdate = new Date().toISOString();
  }

  // Obtém estado atual do humor
  getCurrentMood() {
    return {
      level: this.moodLevel,
      description: this.getMoodDescription(),
      emoji: this.getMoodEmoji(),
      color: this.getMoodColor(),
      stability: this.moodStability,
      trend: this.getMoodTrend(),
      volatility: this.getMoodVolatility(),
      lastUpdate: this.lastUpdate
    };
  }

  // Salva estado do humor
  saveMoodState() {
    try {
      const moodPath = path.resolve(__dirname, '../../data/moodState.json');
      const state = {
        moodLevel: this.moodLevel,
        moodStability: this.moodStability,
        lastUpdate: this.lastUpdate,
        moodHistory: this.moodHistory.slice(-50) // Salva apenas últimas 50 entradas
      };
      fs.writeFileSync(moodPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado do humor:', error);
    }
  }

  // Carrega estado do humor
  loadMoodState() {
    try {
      const moodPath = path.resolve(__dirname, '../../data/moodState.json');
      if (fs.existsSync(moodPath)) {
        const data = fs.readFileSync(moodPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.moodLevel = state.moodLevel || 0.5;
        this.moodStability = state.moodStability || 0.7;
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
        this.moodHistory = state.moodHistory || [];
      }
    } catch (error) {
      console.error('Erro ao carregar estado do humor:', error);
    }
  }
}

export default MoodSystem;
