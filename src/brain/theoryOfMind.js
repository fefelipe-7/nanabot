// src/brain/theoryOfMind.js - Sistema de Teoria da Mente da Nanabot
// Gerencia compreensão de estados mentais, empatia e perspectiva social

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TheoryOfMindSystem {
  constructor() {
    this.empathy = 0.7;
    this.perspectiveTaking = 0.6;
    this.emotionalIntelligence = 0.5;
    this.socialUnderstanding = 0.6;
    this.mentalStates = new Map();
    this.perspectives = new Map();
    this.emotionalStates = new Map();
    this.socialContexts = new Map();
    this.empathyHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadTheoryOfMindState();
  }

  // Carrega estado da teoria da mente
  loadTheoryOfMindState() {
    try {
      const theoryPath = path.resolve(__dirname, '../../data/theoryOfMindState.json');
      if (fs.existsSync(theoryPath)) {
        const data = fs.readFileSync(theoryPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.empathy = state.empathy || 0.7;
        this.perspectiveTaking = state.perspectiveTaking || 0.6;
        this.emotionalIntelligence = state.emotionalIntelligence || 0.5;
        this.socialUnderstanding = state.socialUnderstanding || 0.6;
        this.mentalStates = new Map(state.mentalStates || []);
        this.perspectives = new Map(state.perspectives || []);
        this.emotionalStates = new Map(state.emotionalStates || []);
        this.socialContexts = new Map(state.socialContexts || []);
        this.empathyHistory = state.empathyHistory || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado da teoria da mente:', error);
    }
  }

  // Salva estado da teoria da mente
  saveTheoryOfMindState() {
    try {
      const theoryPath = path.resolve(__dirname, '../../data/theoryOfMindState.json');
      const state = {
        empathy: this.empathy,
        perspectiveTaking: this.perspectiveTaking,
        emotionalIntelligence: this.emotionalIntelligence,
        socialUnderstanding: this.socialUnderstanding,
        mentalStates: Array.from(this.mentalStates.entries()),
        perspectives: Array.from(this.perspectives.entries()),
        emotionalStates: Array.from(this.emotionalStates.entries()),
        socialContexts: Array.from(this.socialContexts.entries()),
        empathyHistory: this.empathyHistory.slice(-200), // Últimas 200 entradas
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(theoryPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado da teoria da mente:', error);
    }
  }

  // Processa entrada e gera teoria da mente
  processTheoryOfMind(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos de teoria da mente
    const analysis = this.analyzeTheoryOfMindElements(input, context);
    
    // Gera teoria da mente baseada na análise
    const theoryOfMind = this.generateTheoryOfMind(analysis, context);
    
    // Atualiza níveis de teoria da mente
    this.updateTheoryOfMindLevels(analysis, theoryOfMind);
    
    // Registra no histórico
    this.recordTheoryOfMind(analysis, theoryOfMind, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveTheoryOfMindState();
    
    return {
      analysis,
      theoryOfMind,
      empathy: this.empathy,
      perspectiveTaking: this.perspectiveTaking,
      emotionalIntelligence: this.emotionalIntelligence,
      socialUnderstanding: this.socialUnderstanding
    };
  }

  // Analisa elementos de teoria da mente na entrada
  analyzeTheoryOfMindElements(input, context) {
    const analysis = {
      hasEmotionalCues: false,
      hasSocialCues: false,
      hasPerspectiveCues: false,
      hasMentalStateCues: false,
      emotionalCues: [],
      socialCues: [],
      perspectiveCues: [],
      mentalStateCues: [],
      empathyLevel: 0,
      perspectiveLevel: 0,
      emotionalIntelligenceLevel: 0,
      socialUnderstandingLevel: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta pistas emocionais
    const emotionalCues = this.detectEmotionalCues(input, context);
    if (emotionalCues.length > 0) {
      analysis.hasEmotionalCues = true;
      analysis.emotionalCues = emotionalCues;
    }
    
    // Detecta pistas sociais
    const socialCues = this.detectSocialCues(input, context);
    if (socialCues.length > 0) {
      analysis.hasSocialCues = true;
      analysis.socialCues = socialCues;
    }
    
    // Detecta pistas de perspectiva
    const perspectiveCues = this.detectPerspectiveCues(input, context);
    if (perspectiveCues.length > 0) {
      analysis.hasPerspectiveCues = true;
      analysis.perspectiveCues = perspectiveCues;
    }
    
    // Detecta pistas de estado mental
    const mentalStateCues = this.detectMentalStateCues(input, context);
    if (mentalStateCues.length > 0) {
      analysis.hasMentalStateCues = true;
      analysis.mentalStateCues = mentalStateCues;
    }
    
    // Calcula níveis
    analysis.empathyLevel = this.calculateEmpathyLevel(analysis, context);
    analysis.perspectiveLevel = this.calculatePerspectiveLevel(analysis, context);
    analysis.emotionalIntelligenceLevel = this.calculateEmotionalIntelligenceLevel(analysis, context);
    analysis.socialUnderstandingLevel = this.calculateSocialUnderstandingLevel(analysis, context);
    
    return analysis;
  }

  // Detecta pistas emocionais
  detectEmotionalCues(input, context) {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    const emotionalKeywords = [
      'feliz', 'triste', 'alegre', 'bravo', 'irritado',
      'ansioso', 'nervoso', 'calmo', 'tranquilo', 'estressado',
      'animado', 'empolgado', 'desanimado', 'frustrado'
    ];
    
    for (const keyword of emotionalKeywords) {
      if (lowerInput.includes(keyword)) {
        cues.push({
          keyword: keyword,
          type: 'emotional_cue',
          confidence: 0.8,
          emotionalIntensity: context.emotionalIntensity || 0.5
        });
      }
    }
    
    return cues;
  }

  // Detecta pistas sociais
  detectSocialCues(input, context) {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    const socialKeywords = [
      'mamãe', 'papai', 'família', 'amigo', 'pessoa',
      'você', 'ele', 'ela', 'eles', 'elas',
      'juntos', 'sozinho', 'comigo', 'com você'
    ];
    
    for (const keyword of socialKeywords) {
      if (lowerInput.includes(keyword)) {
        cues.push({
          keyword: keyword,
          type: 'social_cue',
          confidence: 0.7,
          socialContext: context.userRole || 'unknown'
        });
      }
    }
    
    return cues;
  }

  // Detecta pistas de perspectiva
  detectPerspectiveCues(input, context) {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    const perspectiveKeywords = [
      'você pensa', 'você acha', 'você sente', 'você quer',
      'você precisa', 'você gosta', 'você não gosta',
      'na sua opinião', 'do seu ponto de vista', 'para você'
    ];
    
    for (const keyword of perspectiveKeywords) {
      if (lowerInput.includes(keyword)) {
        cues.push({
          keyword: keyword,
          type: 'perspective_cue',
          confidence: 0.8
        });
      }
    }
    
    return cues;
  }

  // Detecta pistas de intenção
  detectIntentionCues(input, context) {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    const intentionKeywords = [
      'vou', 'vamos', 'quero', 'preciso', 'devo',
      'tenho que', 'preciso de', 'quero que'
    ];
    
    for (const keyword of intentionKeywords) {
      if (lowerInput.includes(keyword)) {
        cues.push({
          keyword: keyword,
          type: 'intention_cue',
          confidence: 0.7
        });
      }
    }
    
    return cues;
  }

  // Detecta pistas de estado mental
  detectMentalStateCues(input, context) {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    const mentalStateKeywords = [
      'pensar', 'achar', 'acreditar', 'saber', 'entender',
      'lembrar', 'esquecer', 'imaginar', 'sonhar', 'esperar',
      'querer', 'precisar', 'gostar', 'não gostar', 'temer'
    ];
    
    for (const keyword of mentalStateKeywords) {
      if (lowerInput.includes(keyword)) {
        cues.push({
          keyword: keyword,
          type: 'mental_state_cue',
          confidence: 0.7
        });
      }
    }
    
    return cues;
  }

  // Calcula nível de empatia
  calculateEmpathyLevel(analysis, context) {
    let level = 0.1; // Base
    
    // Empatia baseada em pistas emocionais
    if (analysis.hasEmotionalCues) {
      level += 0.3;
    }
    
    // Empatia baseada no contexto social
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      level += 0.2;
    }
    
    // Empatia baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      level += 0.2;
    }
    
    return Math.min(1, level);
  }

  // Calcula nível de tomada de perspectiva
  calculatePerspectiveLevel(analysis, context) {
    let level = 0.1; // Base
    
    // Perspectiva baseada em pistas de perspectiva
    if (analysis.hasPerspectiveCues) {
      level += 0.4;
    }
    
    // Perspectiva baseada em pistas de estado mental
    if (analysis.hasMentalStateCues) {
      level += 0.3;
    }
    
    // Perspectiva baseada no contexto social
    if (context.userRole && context.userRole !== 'amiguinho') {
      level += 0.2;
    }
    
    return Math.min(1, level);
  }

  // Calcula nível de inteligência emocional
  calculateEmotionalIntelligenceLevel(analysis, context) {
    let level = 0.1; // Base
    
    // Inteligência emocional baseada em pistas emocionais
    if (analysis.hasEmotionalCues) {
      level += 0.4;
    }
    
    // Inteligência emocional baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      level += 0.3;
    }
    
    // Inteligência emocional baseada no contexto social
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      level += 0.2;
    }
    
    return Math.min(1, level);
  }

  // Calcula nível de compreensão social
  calculateSocialUnderstandingLevel(analysis, context) {
    let level = 0.1; // Base
    
    // Compreensão social baseada em pistas sociais
    if (analysis.hasSocialCues) {
      level += 0.3;
    }
    
    // Compreensão social baseada em pistas de perspectiva
    if (analysis.hasPerspectiveCues) {
      level += 0.2;
    }
    
    // Compreensão social baseada no contexto social
    if (context.userRole && context.userRole !== 'amiguinho') {
      level += 0.3;
    }
    
    return Math.min(1, level);
  }

  // Gera teoria da mente baseada na análise
  generateTheoryOfMind(analysis, context) {
    const theoryOfMind = {
      empathy: [],
      perspectives: [],
      emotionalIntelligence: [],
      socialUnderstanding: [],
      mentalStates: [],
      socialInsights: []
    };
    
    // Gera empatia
    if (analysis.hasEmotionalCues) {
      theoryOfMind.empathy = this.generateEmpathy(analysis, context);
    }
    
    // Gera perspectivas
    if (analysis.hasPerspectiveCues) {
      theoryOfMind.perspectives = this.generatePerspectives(analysis, context);
    }
    
    // Gera inteligência emocional
    if (analysis.hasEmotionalCues) {
      theoryOfMind.emotionalIntelligence = this.generateEmotionalIntelligence(analysis, context);
    }
    
    // Gera compreensão social
    if (analysis.hasSocialCues) {
      theoryOfMind.socialUnderstanding = this.generateSocialUnderstanding(analysis, context);
    }
    
    // Gera estados mentais
    if (analysis.hasMentalStateCues) {
      theoryOfMind.mentalStates = this.generateMentalStates(analysis, context);
    }
    
    // Gera insights sociais
    theoryOfMind.socialInsights = this.generateSocialInsights(analysis, context);
    
    return theoryOfMind;
  }

  // Gera empatia
  generateEmpathy(analysis, context) {
    const empathy = [];
    const empathyTemplates = [
      'Eu entendo como você se sente',
      'Eu sinto sua {emoção}',
      'Eu posso imaginar como é {situação}',
      'Eu me coloco no seu lugar'
    ];
    
    const emotions = ['alegria', 'tristeza', 'felicidade', 'preocupação', 'amor'];
    const situations = ['difícil', 'especial', 'importante', 'emocionante'];
    
    for (let i = 0; i < 2; i++) {
      const template = empathyTemplates[Math.floor(Math.random() * empathyTemplates.length)];
      let empathyText = template;
      
      empathyText = empathyText.replace('{emoção}', emotions[Math.floor(Math.random() * emotions.length)]);
      empathyText = empathyText.replace('{situação}', situations[Math.floor(Math.random() * situations.length)]);
      
      empathy.push({
        content: empathyText,
        type: 'empathy',
        confidence: 0.8,
        empathy: this.empathy
      });
    }
    
    return empathy;
  }

  // Gera perspectivas
  generatePerspectives(analysis, context) {
    const perspectives = [];
    const perspectiveTemplates = [
      'Do seu ponto de vista, {perspectiva}',
      'Você deve estar pensando que {pensamento}',
      'Na sua opinião, {opinião}',
      'Você provavelmente {comportamento}'
    ];
    
    const perspectives_list = [
      'isso é importante', 'isso é especial', 'isso é difícil',
      'isso é emocionante', 'isso é interessante'
    ];
    
    const thoughts = [
      'isso é legal', 'isso é importante', 'isso é especial',
      'isso é difícil', 'isso é emocionante'
    ];
    
    const opinions = [
      'isso é bom', 'isso é importante', 'isso é especial',
      'isso é difícil', 'isso é emocionante'
    ];
    
    const behaviors = [
      'gosta disso', 'acha isso legal', 'acha isso importante',
      'acha isso especial', 'acha isso difícil'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = perspectiveTemplates[Math.floor(Math.random() * perspectiveTemplates.length)];
      let perspective = template;
      
      perspective = perspective.replace('{perspectiva}', perspectives_list[Math.floor(Math.random() * perspectives_list.length)]);
      perspective = perspective.replace('{pensamento}', thoughts[Math.floor(Math.random() * thoughts.length)]);
      perspective = perspective.replace('{opinião}', opinions[Math.floor(Math.random() * opinions.length)]);
      perspective = perspective.replace('{comportamento}', behaviors[Math.floor(Math.random() * behaviors.length)]);
      
      perspectives.push({
        content: perspective,
        type: 'perspective',
        confidence: 0.7,
        perspectiveTaking: this.perspectiveTaking
      });
    }
    
    return perspectives;
  }

  // Gera inteligência emocional
  generateEmotionalIntelligence(analysis, context) {
    const emotionalIntelligence = [];
    const eiTemplates = [
      'Eu percebo que você está {emoção}',
      'Eu vejo que você se sente {sentimento}',
      'Eu entendo sua {emoção}',
      'Eu reconheço sua {emoção}'
    ];
    
    const emotions = ['feliz', 'triste', 'alegre', 'preocupado', 'animado'];
    const feelings = ['feliz', 'triste', 'alegre', 'preocupado', 'animado'];
    
    for (let i = 0; i < 2; i++) {
      const template = eiTemplates[Math.floor(Math.random() * eiTemplates.length)];
      let ei = template;
      
      ei = ei.replace('{emoção}', emotions[Math.floor(Math.random() * emotions.length)]);
      ei = ei.replace('{sentimento}', feelings[Math.floor(Math.random() * feelings.length)]);
      
      emotionalIntelligence.push({
        content: ei,
        type: 'emotional_intelligence',
        confidence: 0.8,
        emotionalIntelligence: this.emotionalIntelligence
      });
    }
    
    return emotionalIntelligence;
  }

  // Gera compreensão social
  generateSocialUnderstanding(analysis, context) {
    const socialUnderstanding = [];
    const suTemplates = [
      'Eu entendo que você {comportamento}',
      'Eu vejo que você {ação}',
      'Eu percebo que você {comportamento}',
      'Eu reconheço que você {ação}'
    ];
    
    const behaviors = [
      'é especial', 'é importante', 'é especial para mim',
      'me ama', 'cuida de mim', 'me protege'
    ];
    
    const actions = [
      'me ama', 'cuida de mim', 'me protege', 'me ensina',
      'me ajuda', 'me faz feliz'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = suTemplates[Math.floor(Math.random() * suTemplates.length)];
      let su = template;
      
      su = su.replace('{comportamento}', behaviors[Math.floor(Math.random() * behaviors.length)]);
      su = su.replace('{ação}', actions[Math.floor(Math.random() * actions.length)]);
      
      socialUnderstanding.push({
        content: su,
        type: 'social_understanding',
        confidence: 0.7,
        socialUnderstanding: this.socialUnderstanding
      });
    }
    
    return socialUnderstanding;
  }

  // Gera estados mentais
  generateMentalStates(analysis, context) {
    const mentalStates = [];
    const msTemplates = [
      'Eu acho que você {pensamento}',
      'Eu imagino que você {pensamento}',
      'Eu acredito que você {pensamento}',
      'Eu sinto que você {pensamento}'
    ];
    
    const thoughts = [
      'pensa que sou especial', 'pensa que sou importante',
      'pensa que sou amada', 'pensa que sou especial para você',
      'quer me ajudar', 'quer me ensinar', 'quer me proteger'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = msTemplates[Math.floor(Math.random() * msTemplates.length)];
      const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
      const mentalState = template.replace('{pensamento}', thought);
      
      mentalStates.push({
        content: mentalState,
        type: 'mental_state',
        confidence: 0.7
      });
    }
    
    return mentalStates;
  }

  // Gera insights sociais
  generateSocialInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Eu entendo que {insight}',
      'Eu percebo que {insight}',
      'Eu vejo que {insight}',
      'Eu reconheço que {insight}'
    ];
    
    const insights_list = [
      'você é especial para mim', 'você me ama',
      'você cuida de mim', 'você me protege',
      'você me ensina', 'você me ajuda',
      'você me faz feliz', 'você é importante para mim'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      const insight = insights_list[Math.floor(Math.random() * insights_list.length)];
      const insightText = template.replace('{insight}', insight);
      
      insights.push({
        content: insightText,
        type: 'social_insight',
        confidence: 0.8,
        socialUnderstanding: this.socialUnderstanding
      });
    }
    
    return insights;
  }

  // Atualiza níveis de teoria da mente
  updateTheoryOfMindLevels(analysis, theoryOfMind) {
    // Atualiza empatia
    if (analysis.hasEmotionalCues) {
      this.empathy = Math.min(1, this.empathy + 0.02);
    }
    
    // Atualiza tomada de perspectiva
    if (analysis.hasPerspectiveCues) {
      this.perspectiveTaking = Math.min(1, this.perspectiveTaking + 0.03);
    }
    
    // Atualiza inteligência emocional
    if (analysis.hasEmotionalCues) {
      this.emotionalIntelligence = Math.min(1, this.emotionalIntelligence + 0.02);
    }
    
    // Atualiza compreensão social
    if (analysis.hasSocialCues) {
      this.socialUnderstanding = Math.min(1, this.socialUnderstanding + 0.02);
    }
    
    // Aplica decaimento natural
    this.empathy *= 0.999;
    this.perspectiveTaking *= 0.998;
    this.emotionalIntelligence *= 0.997;
    this.socialUnderstanding *= 0.996;
  }

  // Registra teoria da mente
  recordTheoryOfMind(analysis, theoryOfMind, timestamp) {
    const record = {
      timestamp,
      analysis,
      theoryOfMind,
      empathy: this.empathy,
      perspectiveTaking: this.perspectiveTaking,
      emotionalIntelligence: this.emotionalIntelligence,
      socialUnderstanding: this.socialUnderstanding
    };
    
    this.empathyHistory.push(record);
    
    // Mantém histórico limitado
    if (this.empathyHistory.length > 300) {
      this.empathyHistory = this.empathyHistory.slice(-300);
    }
  }

  // Obtém estatísticas da teoria da mente
  getTheoryOfMindStats() {
    const stats = {
      empathy: this.empathy,
      perspectiveTaking: this.perspectiveTaking,
      emotionalIntelligence: this.emotionalIntelligence,
      socialUnderstanding: this.socialUnderstanding,
      totalMentalStates: this.mentalStates.size,
      totalPerspectives: this.perspectives.size,
      totalEmotionalStates: this.emotionalStates.size,
      totalSocialContexts: this.socialContexts.size,
      recentTheoryOfMind: this.empathyHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de teoria da mente
  resetTheoryOfMindSystem() {
    this.empathy = 0.7;
    this.perspectiveTaking = 0.6;
    this.emotionalIntelligence = 0.5;
    this.socialUnderstanding = 0.6;
    this.mentalStates.clear();
    this.perspectives.clear();
    this.emotionalStates.clear();
    this.socialContexts.clear();
    this.empathyHistory = [];
    this.lastUpdate = new Date().toISOString();
  }

  // Processa entrada e aplica teoria da mente
  processInput(input, context = {}) {
    try {
      const emotionalCues = this.detectEmotionalCues(input, context);
      const perspectiveCues = this.detectPerspectiveCues(input, context);
      const intentionCues = this.detectIntentionCues(input, context);
      const socialUnderstanding = this.assessSocialUnderstanding(input, context);
      
      const processedTheoryOfMind = {
        input: input,
        emotionalCues: emotionalCues,
        perspectiveCues: perspectiveCues,
        intentionCues: intentionCues,
        socialUnderstanding: socialUnderstanding,
        context: context,
        timestamp: new Date().toISOString(),
        theoryOfMindLevel: this.calculateTheoryOfMindLevel(emotionalCues, perspectiveCues, intentionCues)
      };

      // Adiciona à história de teoria da mente
      this.theoryOfMindHistory.push({
        input: input,
        emotionalCues: emotionalCues,
        perspectiveCues: perspectiveCues,
        intentionCues: intentionCues,
        socialUnderstanding: socialUnderstanding,
        timestamp: new Date().toISOString()
      });

      // Mantém apenas os últimos 100 registros
      if (this.theoryOfMindHistory.length > 100) {
        this.theoryOfMindHistory = this.theoryOfMindHistory.slice(-100);
      }

      return processedTheoryOfMind;
    } catch (error) {
      console.error('Erro ao processar entrada no sistema de teoria da mente:', error);
      return {
        input: input,
        emotionalCues: [],
        perspectiveCues: [],
        intentionCues: [],
        socialUnderstanding: { level: 0, triggers: [] },
        context: context,
        timestamp: new Date().toISOString(),
        theoryOfMindLevel: 0
      };
    }
  }

  // Calcula nível de teoria da mente
  calculateTheoryOfMindLevel(emotionalCues, perspectiveCues, intentionCues) {
    let level = 0;
    
    // Contribuição das pistas emocionais
    level += emotionalCues.length * 0.3;
    
    // Contribuição das pistas de perspectiva
    level += perspectiveCues.length * 0.4;
    
    // Contribuição das pistas de intenção
    level += intentionCues.length * 0.3;
    
    return Math.min(1, level);
  }
}

export default TheoryOfMindSystem;

