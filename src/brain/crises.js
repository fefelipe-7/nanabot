// src/brain/crises.js - Sistema de Crises da Nanabot
// Gerencia crises emocionais, regulação e recuperação

import { loadState, saveState } from '../utils/stateManager.js';

class CrisesSystem {
  constructor() {
    this.crisisLevel = 0.0; // Nível de crise (0-1)
    this.regulationSkills = 0.5; // Habilidades de regulação
    this.recoveryRate = 0.3; // Taxa de recuperação
    this.crisisHistory = [];
    this.regulationStrategies = new Map();
    this.triggerPatterns = new Map();
    this.copingMechanisms = new Map();
    this.lastUpdate = new Date().toISOString();
    this.loadCrisesState();
  }

  // Carrega estado das crises
  loadCrisesState() {
    const state = loadState('crises', this.getDefaultState());
    this.crisisLevel = state.crisisLevel || 0.0;
    this.regulationSkills = state.regulationSkills || 0.5;
    this.recoveryRate = state.recoveryRate || 0.3;
    this.crisisHistory = state.crisisHistory || [];
    this.regulationStrategies = new Map(state.regulationStrategies || []);
    this.triggerPatterns = new Map(state.triggerPatterns || []);
    this.copingMechanisms = new Map(state.copingMechanisms || []);
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado das crises
  saveCrisesState() {
    const state = {
      crisisLevel: this.crisisLevel,
      regulationSkills: this.regulationSkills,
      recoveryRate: this.recoveryRate,
      crisisHistory: this.crisisHistory.slice(-200),
      regulationStrategies: Array.from(this.regulationStrategies.entries()),
      triggerPatterns: Array.from(this.triggerPatterns.entries()),
      copingMechanisms: Array.from(this.copingMechanisms.entries()),
      lastUpdate: this.lastUpdate
    };
    saveState('crises', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      crisisLevel: 0.0,
      regulationSkills: 0.5,
      recoveryRate: 0.3,
      crisisHistory: [],
      regulationStrategies: [],
      triggerPatterns: [],
      copingMechanisms: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gerencia crises
  processCrises(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para sinais de crise
    const analysis = this.analyzeCrisisSignals(input, context);
    
    // Gera estratégias de regulação
    const regulation = this.generateRegulationStrategies(analysis, context);
    
    // Atualiza níveis de crise
    this.updateCrisisLevels(analysis, regulation);
    
    // Registra no histórico
    this.recordCrisis(analysis, regulation, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveCrisesState();
    
    return {
      analysis,
      regulation,
      crisisLevel: this.crisisLevel,
      regulationSkills: this.regulationSkills,
      recoveryRate: this.recoveryRate
    };
  }

  // Analisa sinais de crise na entrada
  analyzeCrisisSignals(input, context) {
    const analysis = {
      hasCrisisSignals: false,
      hasTriggers: false,
      hasOverwhelm: false,
      hasDistress: false,
      crisisSignals: [],
      triggers: [],
      overwhelmSignals: [],
      distressSignals: [],
      crisisIntensity: 0,
      regulationNeed: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta sinais de crise
    const crisisSignals = this.detectCrisisSignals(input, context);
    if (crisisSignals.length > 0) {
      analysis.hasCrisisSignals = true;
      analysis.crisisSignals = crisisSignals;
    }
    
    // Detecta gatilhos
    const triggers = this.detectTriggers(input, context);
    if (triggers.length > 0) {
      analysis.hasTriggers = true;
      analysis.triggers = triggers;
    }
    
    // Detecta sobrecarga
    const overwhelmSignals = this.detectOverwhelm(input, context);
    if (overwhelmSignals.length > 0) {
      analysis.hasOverwhelm = true;
      analysis.overwhelmSignals = overwhelmSignals;
    }
    
    // Detecta angústia
    const distressSignals = this.detectDistress(input, context);
    if (distressSignals.length > 0) {
      analysis.hasDistress = true;
      analysis.distressSignals = distressSignals;
    }
    
    // Calcula intensidade da crise
    analysis.crisisIntensity = this.calculateCrisisIntensity(analysis, context);
    
    // Calcula necessidade de regulação
    analysis.regulationNeed = this.calculateRegulationNeed(analysis, context);
    
    return analysis;
  }

  // Detecta sinais de crise
  detectCrisisSignals(input, context) {
    const signals = [];
    const lowerInput = input.toLowerCase();
    
    const crisisKeywords = {
      'pânico': ['pânico', 'desespero', 'terror', 'pavor', 'medo extremo'],
      'raiva': ['raiva', 'fúria', 'irritação', 'bravo', 'furioso'],
      'tristeza': ['tristeza', 'depressão', 'melancolia', 'desânimo', 'desesperança'],
      'ansiedade': ['ansiedade', 'nervosismo', 'preocupação', 'inquietação', 'agitação'],
      'confusão': ['confusão', 'perdido', 'desorientado', 'confuso', 'perplexo'],
      'isolamento': ['sozinho', 'isolado', 'abandonado', 'rejeitado', 'excluído']
    };
    
    for (const [signal, keywords] of Object.entries(crisisKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          signals.push({
            signal: signal,
            keyword: keyword,
            type: 'crisis_signal',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return signals;
  }

  // Detecta gatilhos
  detectTriggers(input, context) {
    const triggers = [];
    const lowerInput = input.toLowerCase();
    
    const triggerKeywords = {
      'separação': ['separação', 'longe', 'ausente', 'partir', 'sair'],
      'rejeição': ['rejeição', 'não gosto', 'não quer', 'não aceita'],
      'perda': ['perda', 'morreu', 'sumiu', 'desapareceu', 'não tem mais'],
      'mudança': ['mudança', 'diferente', 'novo', 'outro', 'mudou'],
      'conflito': ['briga', 'conflito', 'discussão', 'problema', 'diferença'],
      'pressão': ['pressão', 'obrigado', 'tem que', 'precisa', 'deve']
    };
    
    for (const [trigger, keywords] of Object.entries(triggerKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          triggers.push({
            trigger: trigger,
            keyword: keyword,
            type: 'trigger',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return triggers;
  }

  // Detecta sobrecarga
  detectOverwhelm(input, context) {
    const signals = [];
    const lowerInput = input.toLowerCase();
    
    const overwhelmKeywords = {
      'muito': ['muito', 'demais', 'excesso', 'suficiente', 'bastante'],
      'não_consigo': ['não consigo', 'não dá', 'impossível', 'difícil demais'],
      'confuso': ['confuso', 'perdido', 'não entendo', 'complexo'],
      'cansado': ['cansado', 'exausto', 'fatigado', 'sem energia'],
      'sobrecarregado': ['sobrecarregado', 'atolado', 'afogado', 'sufocado']
    };
    
    for (const [signal, keywords] of Object.entries(overwhelmKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          signals.push({
            signal: signal,
            keyword: keyword,
            type: 'overwhelm',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return signals;
  }

  // Detecta angústia
  detectDistress(input, context) {
    const signals = [];
    const lowerInput = input.toLowerCase();
    
    const distressKeywords = {
      'dor': ['dor', 'machuca', 'dói', 'sofrendo', 'dolorido'],
      'medo': ['medo', 'assustado', 'aterrorizado', 'apavorado'],
      'angústia': ['angústia', 'aflição', 'sofrimento', 'tortura'],
      'desespero': ['desespero', 'desesperança', 'sem saída', 'perdido'],
      'vazio': ['vazio', 'nada', 'vazio', 'sem sentido', 'inútil']
    };
    
    for (const [signal, keywords] of Object.entries(distressKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          signals.push({
            signal: signal,
            keyword: keyword,
            type: 'distress',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return signals;
  }

  // Calcula intensidade da crise
  calculateCrisisIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em sinais de crise
    if (analysis.hasCrisisSignals) {
      intensity += analysis.crisisSignals.length * 0.2;
    }
    
    // Intensidade baseada em gatilhos
    if (analysis.hasTriggers) {
      intensity += analysis.triggers.length * 0.15;
    }
    
    // Intensidade baseada em sobrecarga
    if (analysis.hasOverwhelm) {
      intensity += analysis.overwhelmSignals.length * 0.1;
    }
    
    // Intensidade baseada em angústia
    if (analysis.hasDistress) {
      intensity += analysis.distressSignals.length * 0.2;
    }
    
    // Intensidade baseada no contexto
    if (context.emotionalIntensity > 0.7) {
      intensity += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula necessidade de regulação
  calculateRegulationNeed(analysis, context) {
    let need = 0.1; // Base
    
    // Necessidade baseada na intensidade da crise
    need += analysis.crisisIntensity * 0.4;
    
    // Necessidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      need += context.emotionalIntensity * 0.3;
    }
    
    // Necessidade baseada em sinais de crise
    if (analysis.hasCrisisSignals) {
      need += 0.2;
    }
    
    return Math.min(1, need);
  }

  // Gera estratégias de regulação
  generateRegulationStrategies(analysis, context) {
    const strategies = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      coping: [],
      support: []
    };
    
    // Gera estratégias imediatas
    if (analysis.crisisIntensity > 0.5) {
      strategies.immediate = this.generateImmediateStrategies(analysis, context);
    }
    
    // Gera estratégias de curto prazo
    if (analysis.regulationNeed > 0.3) {
      strategies.shortTerm = this.generateShortTermStrategies(analysis, context);
    }
    
    // Gera estratégias de longo prazo
    strategies.longTerm = this.generateLongTermStrategies(analysis, context);
    
    // Gera mecanismos de enfrentamento
    strategies.coping = this.generateCopingMechanisms(analysis, context);
    
    // Gera estratégias de suporte
    strategies.support = this.generateSupportStrategies(analysis, context);
    
    return strategies;
  }

  // Gera estratégias imediatas
  generateImmediateStrategies(analysis, context) {
    const strategies = [];
    const immediateTemplates = [
      'Respire fundo e conte até 10',
      'Pegue um abraço bem apertado',
      'Feche os olhos e pense em algo bonito',
      'Cante uma música que você gosta',
      'Pegue seu objeto de conforto favorito'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = immediateTemplates[Math.floor(Math.random() * immediateTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'immediate',
        confidence: 0.9,
        urgency: 'high',
        context: context
      });
    }
    
    return strategies;
  }

  // Gera estratégias de curto prazo
  generateShortTermStrategies(analysis, context) {
    const strategies = [];
    const shortTermTemplates = [
      'Vamos brincar de algo que você gosta',
      'Que tal desenhar ou colorir?',
      'Vamos ouvir uma música relaxante',
      'Vamos fazer uma atividade calma',
      'Vamos conversar sobre coisas boas'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = shortTermTemplates[Math.floor(Math.random() * shortTermTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'short_term',
        confidence: 0.8,
        urgency: 'medium',
        context: context
      });
    }
    
    return strategies;
  }

  // Gera estratégias de longo prazo
  generateLongTermStrategies(analysis, context) {
    const strategies = [];
    const longTermTemplates = [
      'Vamos criar uma rotina de relaxamento',
      'Vamos aprender técnicas de respiração',
      'Vamos praticar mindfulness juntos',
      'Vamos desenvolver habilidades de regulação',
      'Vamos criar um plano de bem-estar'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = longTermTemplates[Math.floor(Math.random() * longTermTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'long_term',
        confidence: 0.7,
        urgency: 'low',
        context: context
      });
    }
    
    return strategies;
  }

  // Gera mecanismos de enfrentamento
  generateCopingMechanisms(analysis, context) {
    const mechanisms = [];
    const copingTemplates = [
      'Eu posso superar isso',
      'Eu sou forte e capaz',
      'Isso vai passar',
      'Eu tenho pessoas que me amam',
      'Eu posso pedir ajuda quando precisar'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = copingTemplates[Math.floor(Math.random() * copingTemplates.length)];
      
      mechanisms.push({
        content: template,
        type: 'coping',
        confidence: 0.8,
        context: context
      });
    }
    
    return mechanisms;
  }

  // Gera estratégias de suporte
  generateSupportStrategies(analysis, context) {
    const strategies = [];
    const supportTemplates = [
      'Você não está sozinho, eu estou aqui',
      'Eu te amo e vou te ajudar',
      'Vamos passar por isso juntos',
      'Eu acredito em você',
      'Você é especial e importante para mim'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = supportTemplates[Math.floor(Math.random() * supportTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'support',
        confidence: 0.9,
        context: context
      });
    }
    
    return strategies;
  }

  // Atualiza níveis de crise
  updateCrisisLevels(analysis, regulation) {
    // Atualiza nível de crise
    if (analysis.crisisIntensity > 0.5) {
      this.crisisLevel = Math.min(1, this.crisisLevel + analysis.crisisIntensity * 0.1);
    } else {
      // Aplica recuperação
      this.crisisLevel = Math.max(0, this.crisisLevel - this.recoveryRate * 0.1);
    }
    
    // Atualiza habilidades de regulação
    if (regulation.immediate.length > 0) {
      this.regulationSkills = Math.min(1, this.regulationSkills + 0.02);
    }
    
    // Atualiza taxa de recuperação
    if (this.crisisLevel < 0.3) {
      this.recoveryRate = Math.min(1, this.recoveryRate + 0.01);
    }
    
    // Aplica decaimento natural
    this.crisisLevel *= 0.995;
    this.regulationSkills *= 0.999;
    this.recoveryRate *= 0.998;
  }

  // Registra crise
  recordCrisis(analysis, regulation, timestamp) {
    const record = {
      timestamp,
      analysis,
      regulation,
      crisisLevel: this.crisisLevel,
      regulationSkills: this.regulationSkills,
      recoveryRate: this.recoveryRate
    };
    
    this.crisisHistory.push(record);
    
    // Mantém histórico limitado
    if (this.crisisHistory.length > 300) {
      this.crisisHistory = this.crisisHistory.slice(-300);
    }
  }

  // Obtém estatísticas das crises
  getCrisesStats() {
    const stats = {
      crisisLevel: this.crisisLevel,
      regulationSkills: this.regulationSkills,
      recoveryRate: this.recoveryRate,
      totalCrises: this.crisisHistory.length,
      recentCrises: this.crisisHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de crises
  resetCrisesSystem() {
    this.crisisLevel = 0.0;
    this.regulationSkills = 0.5;
    this.recoveryRate = 0.3;
    this.crisisHistory = [];
    this.regulationStrategies.clear();
    this.triggerPatterns.clear();
    this.copingMechanisms.clear();
    this.lastUpdate = new Date().toISOString();
  }

  // Processa entrada e detecta crises
  processInput(input, context = {}) {
    try {
      const crisisTriggers = this.detectCrisisTriggers(input, context);
      const overwhelmSignals = this.detectOverwhelm(input, context);
      const emotionalCrisis = this.detectEmotionalCrisis(input, context);
      const crisisLevel = this.assessCrisisLevel(input, context);
      
      const processedCrisis = {
        input: input,
        crisisTriggers: crisisTriggers,
        overwhelmSignals: overwhelmSignals,
        emotionalCrisis: emotionalCrisis,
        crisisLevel: crisisLevel,
        context: context,
        timestamp: new Date().toISOString(),
        crisisScore: this.calculateCrisisScore(crisisTriggers, overwhelmSignals, emotionalCrisis)
      };

      // Adiciona à história de crises
      this.crisisHistory.push({
        input: input,
        crisisTriggers: crisisTriggers,
        overwhelmSignals: overwhelmSignals,
        emotionalCrisis: emotionalCrisis,
        crisisLevel: crisisLevel,
        timestamp: new Date().toISOString()
      });

      // Mantém apenas os últimos 100 registros
      if (this.crisisHistory.length > 100) {
        this.crisisHistory = this.crisisHistory.slice(-100);
      }

      return processedCrisis;
    } catch (error) {
      console.error('Erro ao processar entrada no sistema de crises:', error);
      return {
        input: input,
        crisisTriggers: [],
        overwhelmSignals: [],
        emotionalCrisis: { level: 0, triggers: [] },
        crisisLevel: { level: 0, triggers: [] },
        context: context,
        timestamp: new Date().toISOString(),
        crisisScore: 0
      };
    }
  }

  // Calcula pontuação de crise
  calculateCrisisScore(crisisTriggers, overwhelmSignals, emotionalCrisis) {
    let score = 0;
    
    // Contribuição dos gatilhos de crise
    score += crisisTriggers.length * 0.4;
    
    // Contribuição dos sinais de sobrecarga
    score += overwhelmSignals.length * 0.3;
    
    // Contribuição da crise emocional
    score += emotionalCrisis.level * 0.3;
    
    return Math.min(1, score);
  }
}

export default CrisesSystem;
