// src/brain/emotionReg.js - Sistema de Regulação Emocional da Nanabot
// Gerencia regulação, controle e equilíbrio emocional

import { loadState, saveState } from '../utils/stateManager.js';

class EmotionRegulationSystem {
  constructor() {
    this.regulationSkills = 0.5; // Habilidades de regulação (0-1)
    this.emotionalStability = 0.6; // Estabilidade emocional
    this.selfControl = 0.4; // Autocontrole
    this.copingStrategies = new Map();
    this.regulationHistory = [];
    this.emotionalTriggers = new Map();
    this.regulationTechniques = new Map();
    this.lastUpdate = new Date().toISOString();
    this.loadEmotionRegulationState();
  }

  // Carrega estado da regulação emocional
  loadEmotionRegulationState() {
    const state = loadState('emotionReg', this.getDefaultState());
    this.regulationSkills = state.regulationSkills || 0.5;
    this.emotionalStability = state.emotionalStability || 0.6;
    this.selfControl = state.selfControl || 0.4;
    this.copingStrategies = new Map(state.copingStrategies || []);
    this.regulationHistory = state.regulationHistory || [];
    this.emotionalTriggers = new Map(state.emotionalTriggers || []);
    this.regulationTechniques = new Map(state.regulationTechniques || []);
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado da regulação emocional
  saveEmotionRegulationState() {
    const state = {
      regulationSkills: this.regulationSkills,
      emotionalStability: this.emotionalStability,
      selfControl: this.selfControl,
      copingStrategies: Array.from(this.copingStrategies.entries()),
      regulationHistory: this.regulationHistory.slice(-200),
      emotionalTriggers: Array.from(this.emotionalTriggers.entries()),
      regulationTechniques: Array.from(this.regulationTechniques.entries()),
      lastUpdate: this.lastUpdate
    };
    saveState('emotionReg', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      regulationSkills: 0.5,
      emotionalStability: 0.6,
      selfControl: 0.4,
      copingStrategies: [],
      regulationHistory: [],
      emotionalTriggers: [],
      regulationTechniques: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e aplica regulação emocional
  processEmotionRegulation(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa necessidade de regulação
    const analysis = this.analyzeRegulationNeed(input, context);
    
    // Gera estratégias de regulação
    const regulation = this.generateRegulationStrategies(analysis, context);
    
    // Aplica regulação
    this.applyRegulation(analysis, regulation);
    
    // Registra no histórico
    this.recordRegulation(analysis, regulation, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveEmotionRegulationState();
    
    return {
      analysis,
      regulation,
      regulationSkills: this.regulationSkills,
      emotionalStability: this.emotionalStability,
      selfControl: this.selfControl
    };
  }

  // Analisa necessidade de regulação
  analyzeRegulationNeed(input, context) {
    const analysis = {
      needsRegulation: false,
      emotionalIntensity: 0,
      stressLevel: 0,
      overwhelmLevel: 0,
      triggers: [],
      emotionalState: 'neutral',
      regulationUrgency: 'low',
      regulationType: 'none'
    };
    
    const lowerInput = input.toLowerCase();
    
    // Calcula intensidade emocional
    analysis.emotionalIntensity = this.calculateEmotionalIntensity(input, context);
    
    // Calcula nível de estresse
    analysis.stressLevel = this.calculateStressLevel(input, context);
    
    // Calcula nível de sobrecarga
    analysis.overwhelmLevel = this.calculateOverwhelmLevel(input, context);
    
    // Detecta gatilhos emocionais
    const triggers = this.detectEmotionalTriggers(input, context);
    if (triggers.length > 0) {
      analysis.triggers = triggers;
    }
    
    // Determina estado emocional
    analysis.emotionalState = this.determineEmotionalState(analysis);
    
    // Determina urgência de regulação
    analysis.regulationUrgency = this.determineRegulationUrgency(analysis);
    
    // Determina tipo de regulação
    analysis.regulationType = this.determineRegulationType(analysis);
    
    // Determina se precisa de regulação
    analysis.needsRegulation = this.determineRegulationNeed(analysis);
    
    return analysis;
  }

  // Calcula intensidade emocional
  calculateEmotionalIntensity(input, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada no contexto
    if (context.emotionalIntensity) {
      intensity += context.emotionalIntensity * 0.5;
    }
    
    // Intensidade baseada em palavras emocionais
    const emotionalWords = [
      'muito', 'demais', 'extremamente', 'super', 'mega',
      'incrível', 'fantástico', 'terrível', 'horrível', 'péssimo'
    ];
    
    for (const word of emotionalWords) {
      if (input.toLowerCase().includes(word)) {
        intensity += 0.1;
      }
    }
    
    // Intensidade baseada em exclamações
    const exclamationCount = (input.match(/!/g) || []).length;
    intensity += exclamationCount * 0.05;
    
    return Math.min(1, intensity);
  }

  // Calcula nível de estresse
  calculateStressLevel(input, context) {
    let stress = 0.1; // Base
    
    const stressWords = [
      'estressado', 'nervoso', 'ansioso', 'preocupado',
      'pressão', 'obrigado', 'tem que', 'precisa',
      'difícil', 'complicado', 'problema', 'confuso'
    ];
    
    for (const word of stressWords) {
      if (input.toLowerCase().includes(word)) {
        stress += 0.1;
      }
    }
    
    return Math.min(1, stress);
  }

  // Calcula nível de sobrecarga
  calculateOverwhelmLevel(input, context) {
    let overwhelm = 0.1; // Base
    
    const overwhelmWords = [
      'muito', 'demais', 'excesso', 'suficiente',
      'não consigo', 'impossível', 'difícil demais',
      'sobrecarregado', 'atolado', 'afogado'
    ];
    
    for (const word of overwhelmWords) {
      if (input.toLowerCase().includes(word)) {
        overwhelm += 0.1;
      }
    }
    
    return Math.min(1, overwhelm);
  }

  // Detecta gatilhos emocionais
  detectEmotionalTriggers(input, context) {
    const triggers = [];
    const lowerInput = input.toLowerCase();
    
    const triggerKeywords = {
      'separação': ['separação', 'longe', 'ausente', 'partir'],
      'rejeição': ['rejeição', 'não gosto', 'não quer', 'não aceita'],
      'perda': ['perda', 'morreu', 'sumiu', 'desapareceu'],
      'mudança': ['mudança', 'diferente', 'novo', 'outro'],
      'conflito': ['briga', 'conflito', 'discussão', 'problema'],
      'pressão': ['pressão', 'obrigado', 'tem que', 'precisa']
    };
    
    for (const [trigger, keywords] of Object.entries(triggerKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          triggers.push({
            trigger: trigger,
            keyword: keyword,
            intensity: 0.7,
            context: context
          });
        }
      }
    }
    
    return triggers;
  }

  // Determina estado emocional
  determineEmotionalState(analysis) {
    if (analysis.emotionalIntensity > 0.7) {
      return 'intense';
    } else if (analysis.stressLevel > 0.6) {
      return 'stressed';
    } else if (analysis.overwhelmLevel > 0.6) {
      return 'overwhelmed';
    } else if (analysis.emotionalIntensity > 0.4) {
      return 'moderate';
    } else {
      return 'calm';
    }
  }

  // Determina urgência de regulação
  determineRegulationUrgency(analysis) {
    if (analysis.emotionalIntensity > 0.8 || analysis.stressLevel > 0.8) {
      return 'high';
    } else if (analysis.emotionalIntensity > 0.5 || analysis.stressLevel > 0.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Determina tipo de regulação
  determineRegulationType(analysis) {
    if (analysis.overwhelmLevel > 0.6) {
      return 'overwhelm';
    } else if (analysis.stressLevel > 0.6) {
      return 'stress';
    } else if (analysis.emotionalIntensity > 0.6) {
      return 'intensity';
    } else {
      return 'maintenance';
    }
  }

  // Determina necessidade de regulação
  determineRegulationNeed(analysis) {
    return analysis.emotionalIntensity > 0.5 || 
           analysis.stressLevel > 0.5 || 
           analysis.overwhelmLevel > 0.5 ||
           analysis.regulationUrgency !== 'low';
  }

  // Gera estratégias de regulação
  generateRegulationStrategies(analysis, context) {
    const strategies = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      coping: [],
      prevention: []
    };
    
    // Gera estratégias imediatas
    if (analysis.regulationUrgency === 'high') {
      strategies.immediate = this.generateImmediateStrategies(analysis, context);
    }
    
    // Gera estratégias de curto prazo
    if (analysis.regulationUrgency === 'medium' || analysis.regulationUrgency === 'high') {
      strategies.shortTerm = this.generateShortTermStrategies(analysis, context);
    }
    
    // Gera estratégias de longo prazo
    strategies.longTerm = this.generateLongTermStrategies(analysis, context);
    
    // Gera mecanismos de enfrentamento
    strategies.coping = this.generateCopingStrategies(analysis, context);
    
    // Gera estratégias de prevenção
    strategies.prevention = this.generatePreventionStrategies(analysis, context);
    
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
      'Pegue seu objeto de conforto favorito',
      'Faça exercícios de respiração',
      'Pense em algo que te faz feliz',
      'Peça ajuda para alguém que você confia'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = immediateTemplates[Math.floor(Math.random() * immediateTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'immediate',
        urgency: 'high',
        confidence: 0.9,
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
      'Vamos conversar sobre coisas boas',
      'Vamos fazer exercícios de relaxamento',
      'Vamos praticar mindfulness',
      'Vamos fazer algo criativo'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = shortTermTemplates[Math.floor(Math.random() * shortTermTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'short_term',
        urgency: 'medium',
        confidence: 0.8,
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
      'Vamos criar um plano de bem-estar',
      'Vamos trabalhar na estabilidade emocional',
      'Vamos desenvolver autocontrole',
      'Vamos criar estratégias de enfrentamento'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = longTermTemplates[Math.floor(Math.random() * longTermTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'long_term',
        urgency: 'low',
        confidence: 0.7,
        context: context
      });
    }
    
    return strategies;
  }

  // Gera estratégias de enfrentamento
  generateCopingStrategies(analysis, context) {
    const strategies = [];
    const copingTemplates = [
      'Eu posso superar isso',
      'Eu sou forte e capaz',
      'Isso vai passar',
      'Eu tenho pessoas que me amam',
      'Eu posso pedir ajuda quando precisar',
      'Eu sou resiliente',
      'Eu posso aprender com isso',
      'Eu tenho recursos para lidar com isso'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = copingTemplates[Math.floor(Math.random() * copingTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'coping',
        confidence: 0.8,
        context: context
      });
    }
    
    return strategies;
  }

  // Gera estratégias de prevenção
  generatePreventionStrategies(analysis, context) {
    const strategies = [];
    const preventionTemplates = [
      'Vamos identificar seus gatilhos emocionais',
      'Vamos criar um plano de prevenção',
      'Vamos desenvolver habilidades de regulação',
      'Vamos trabalhar na estabilidade emocional',
      'Vamos criar estratégias de enfrentamento',
      'Vamos desenvolver autocontrole',
      'Vamos criar um sistema de suporte',
      'Vamos trabalhar na resiliência emocional'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = preventionTemplates[Math.floor(Math.random() * preventionTemplates.length)];
      
      strategies.push({
        content: template,
        type: 'prevention',
        confidence: 0.7,
        context: context
      });
    }
    
    return strategies;
  }

  // Aplica regulação
  applyRegulation(analysis, regulation) {
    // Atualiza habilidades de regulação
    if (regulation.immediate.length > 0) {
      this.regulationSkills = Math.min(1, this.regulationSkills + 0.02);
    }
    
    // Atualiza estabilidade emocional
    if (analysis.needsRegulation) {
      this.emotionalStability = Math.min(1, this.emotionalStability + 0.01);
    }
    
    // Atualiza autocontrole
    if (regulation.coping.length > 0) {
      this.selfControl = Math.min(1, this.selfControl + 0.01);
    }
    
    // Aplica decaimento natural
    this.regulationSkills *= 0.999;
    this.emotionalStability *= 0.998;
    this.selfControl *= 0.997;
  }

  // Registra regulação
  recordRegulation(analysis, regulation, timestamp) {
    const record = {
      timestamp,
      analysis,
      regulation,
      regulationSkills: this.regulationSkills,
      emotionalStability: this.emotionalStability,
      selfControl: this.selfControl
    };
    
    this.regulationHistory.push(record);
    
    // Mantém histórico limitado
    if (this.regulationHistory.length > 300) {
      this.regulationHistory = this.regulationHistory.slice(-300);
    }
  }

  // Obtém estatísticas da regulação emocional
  getEmotionRegulationStats() {
    const stats = {
      regulationSkills: this.regulationSkills,
      emotionalStability: this.emotionalStability,
      selfControl: this.selfControl,
      totalRegulations: this.regulationHistory.length,
      recentRegulations: this.regulationHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de regulação emocional
  resetEmotionRegulationSystem() {
    this.regulationSkills = 0.5;
    this.emotionalStability = 0.6;
    this.selfControl = 0.4;
    this.copingStrategies.clear();
    this.regulationHistory = [];
    this.emotionalTriggers.clear();
    this.regulationTechniques.clear();
    this.lastUpdate = new Date().toISOString();
  }
}

export default EmotionRegulationSystem;
