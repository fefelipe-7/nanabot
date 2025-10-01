// src/brain/socialLearning.js - Sistema de Aprendizado Social da Nanabot
// Gerencia aprendizado através de interações sociais e observação

import { loadState, saveState } from '../utils/stateManager.js';

class SocialLearningSystem {
  constructor() {
    this.socialLearningRate = 0.6; // Taxa de aprendizado social (0-1)
    this.observationSkills = 0.5; // Habilidades de observação
    this.imitationAbility = 0.7; // Capacidade de imitação
    this.socialAwareness = 0.6; // Consciência social
    this.socialBehaviors = new Map();
    this.socialModels = new Map();
    this.socialContexts = new Map();
    this.socialLearningHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadSocialLearningState();
  }

  // Carrega estado do aprendizado social
  loadSocialLearningState() {
    const state = loadState('socialLearning', this.getDefaultState());
    this.socialLearningRate = state.socialLearningRate || 0.6;
    this.observationSkills = state.observationSkills || 0.5;
    this.imitationAbility = state.imitationAbility || 0.7;
    this.socialAwareness = state.socialAwareness || 0.6;
    this.socialBehaviors = new Map(state.socialBehaviors || []);
    this.socialModels = new Map(state.socialModels || []);
    this.socialContexts = new Map(state.socialContexts || []);
    this.socialLearningHistory = state.socialLearningHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado do aprendizado social
  saveSocialLearningState() {
    const state = {
      socialLearningRate: this.socialLearningRate,
      observationSkills: this.observationSkills,
      imitationAbility: this.imitationAbility,
      socialAwareness: this.socialAwareness,
      socialBehaviors: Array.from(this.socialBehaviors.entries()),
      socialModels: Array.from(this.socialModels.entries()),
      socialContexts: Array.from(this.socialContexts.entries()),
      socialLearningHistory: this.socialLearningHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('socialLearning', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      socialLearningRate: 0.6,
      observationSkills: 0.5,
      imitationAbility: 0.7,
      socialAwareness: 0.6,
      socialBehaviors: [],
      socialModels: [],
      socialContexts: [],
      socialLearningHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gerencia aprendizado social
  processSocialLearning(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos de aprendizado social
    const analysis = this.analyzeSocialLearningElements(input, context);
    
    // Gera aprendizado social
    const socialLearning = this.generateSocialLearning(analysis, context);
    
    // Atualiza níveis de aprendizado social
    this.updateSocialLearningLevels(analysis, socialLearning);
    
    // Registra no histórico
    this.recordSocialLearning(analysis, socialLearning, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveSocialLearningState();
    
    return {
      analysis,
      socialLearning,
      socialLearningRate: this.socialLearningRate,
      observationSkills: this.observationSkills,
      imitationAbility: this.imitationAbility
    };
  }

  // Analisa elementos de aprendizado social na entrada
  analyzeSocialLearningElements(input, context) {
    const analysis = {
      hasSocialCues: false,
      hasBehavioralExamples: false,
      hasSocialNorms: false,
      hasEmotionalCues: false,
      socialCues: [],
      behavioralExamples: [],
      socialNorms: [],
      emotionalCues: [],
      socialLearningIntensity: 0,
      socialComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta pistas sociais
    const socialCues = this.detectSocialCues(input, context);
    if (socialCues.length > 0) {
      analysis.hasSocialCues = true;
      analysis.socialCues = socialCues;
    }
    
    // Detecta exemplos comportamentais
    const behavioralExamples = this.detectBehavioralExamples(input, context);
    if (behavioralExamples.length > 0) {
      analysis.hasBehavioralExamples = true;
      analysis.behavioralExamples = behavioralExamples;
    }
    
    // Detecta normas sociais
    const socialNorms = this.detectSocialNorms(input, context);
    if (socialNorms.length > 0) {
      analysis.hasSocialNorms = true;
      analysis.socialNorms = socialNorms;
    }
    
    // Detecta pistas emocionais
    const emotionalCues = this.detectEmotionalCues(input, context);
    if (emotionalCues.length > 0) {
      analysis.hasEmotionalCues = true;
      analysis.emotionalCues = emotionalCues;
    }
    
    // Calcula intensidade do aprendizado social
    analysis.socialLearningIntensity = this.calculateSocialLearningIntensity(analysis, context);
    
    // Calcula complexidade social
    analysis.socialComplexity = this.calculateSocialComplexity(analysis, context);
    
    return analysis;
  }

  // Detecta pistas sociais
  detectSocialCues(input, context) {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    const socialKeywords = {
      'cumprimento': ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite'],
      'despedida': ['tchau', 'até logo', 'até mais', 'falou'],
      'agradecimento': ['obrigado', 'obrigada', 'valeu', 'grato'],
      'pedido': ['por favor', 'pode', 'podia', 'será que'],
      'perdão': ['desculpa', 'perdão', 'me desculpe', 'foi mal'],
      'elogio': ['parabéns', 'muito bem', 'excelente', 'ótimo']
    };
    
    for (const [type, keywords] of Object.entries(socialKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          cues.push({
            type: type,
            keyword: keyword,
            category: 'social_cue',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return cues;
  }

  // Detecta exemplos comportamentais
  detectBehavioralExamples(input, context) {
    const examples = [];
    const lowerInput = input.toLowerCase();
    
    const behavioralKeywords = {
      'ajudar': ['ajudar', 'ajuda', 'auxiliar', 'suporte'],
      'compartilhar': ['compartilhar', 'dividir', 'partilhar', 'dar'],
      'cooperar': ['cooperar', 'trabalhar junto', 'colaborar', 'unir'],
      'respeitar': ['respeitar', 'respeito', 'considerar', 'valorizar'],
      'cuidar': ['cuidar', 'cuidado', 'proteger', 'zelar'],
      'compreender': ['compreender', 'entender', 'aceitar', 'tolerar']
    };
    
    for (const [type, keywords] of Object.entries(behavioralKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          examples.push({
            type: type,
            keyword: keyword,
            category: 'behavioral_example',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return examples;
  }

  // Detecta normas sociais
  detectSocialNorms(input, context) {
    const norms = [];
    const lowerInput = input.toLowerCase();
    
    const normKeywords = {
      'educação': ['educação', 'educado', 'bom comportamento', 'cortesia'],
      'gentileza': ['gentileza', 'gentil', 'amabilidade', 'bondade'],
      'honestidade': ['honestidade', 'honesto', 'verdade', 'sinceridade'],
      'justiça': ['justiça', 'justo', 'equidade', 'igualdade'],
      'responsabilidade': ['responsabilidade', 'responsável', 'compromisso', 'dever'],
      'empatia': ['empatia', 'empático', 'compreensão', 'solidariedade']
    };
    
    for (const [type, keywords] of Object.entries(normKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          norms.push({
            type: type,
            keyword: keyword,
            category: 'social_norm',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return norms;
  }

  // Detecta pistas emocionais
  detectEmotionalCues(input, context) {
    const cues = [];
    const lowerInput = input.toLowerCase();
    
    const emotionalKeywords = {
      'felicidade': ['feliz', 'alegre', 'content', 'sorrindo'],
      'tristeza': ['triste', 'chorando', 'melancolia', 'saudade'],
      'raiva': ['raiva', 'bravo', 'irritado', 'furioso'],
      'medo': ['medo', 'assustado', 'pavor', 'terror'],
      'amor': ['amor', 'carinho', 'afeição', 'querer'],
      'surpresa': ['surpresa', 'uau', 'nossa', 'incrível']
    };
    
    for (const [type, keywords] of Object.entries(emotionalKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          cues.push({
            type: type,
            keyword: keyword,
            category: 'emotional_cue',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return cues;
  }

  // Calcula intensidade do aprendizado social
  calculateSocialLearningIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em pistas sociais
    if (analysis.hasSocialCues) {
      intensity += analysis.socialCues.length * 0.2;
    }
    
    // Intensidade baseada em exemplos comportamentais
    if (analysis.hasBehavioralExamples) {
      intensity += analysis.behavioralExamples.length * 0.25;
    }
    
    // Intensidade baseada em normas sociais
    if (analysis.hasSocialNorms) {
      intensity += analysis.socialNorms.length * 0.15;
    }
    
    // Intensidade baseada em pistas emocionais
    if (analysis.hasEmotionalCues) {
      intensity += analysis.emotionalCues.length * 0.2;
    }
    
    // Intensidade baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      intensity += 0.3;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula complexidade social
  calculateSocialComplexity(analysis, context) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de elementos
    complexity += analysis.socialCues.length * 0.1;
    complexity += analysis.behavioralExamples.length * 0.15;
    complexity += analysis.socialNorms.length * 0.1;
    complexity += analysis.emotionalCues.length * 0.15;
    
    // Complexidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      complexity += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, complexity);
  }

  // Gera aprendizado social baseado na análise
  generateSocialLearning(analysis, context) {
    const socialLearning = {
      socialBehaviors: [],
      socialModels: [],
      socialContexts: [],
      socialInsights: [],
      socialSkills: []
    };
    
    // Gera comportamentos sociais
    if (analysis.hasBehavioralExamples) {
      socialLearning.socialBehaviors = this.generateSocialBehaviors(analysis, context);
    }
    
    // Gera modelos sociais
    if (analysis.hasSocialCues) {
      socialLearning.socialModels = this.generateSocialModels(analysis, context);
    }
    
    // Gera contextos sociais
    if (analysis.hasSocialNorms) {
      socialLearning.socialContexts = this.generateSocialContexts(analysis, context);
    }
    
    // Gera insights sociais
    socialLearning.socialInsights = this.generateSocialInsights(analysis, context);
    
    // Gera habilidades sociais
    socialLearning.socialSkills = this.generateSocialSkills(analysis, context);
    
    return socialLearning;
  }

  // Gera comportamentos sociais
  generateSocialBehaviors(analysis, context) {
    const behaviors = [];
    const behaviorTemplates = [
      'Eu aprendi que {behavior}',
      'Vou {behavior}',
      'É importante {behavior}',
      'Eu posso {behavior}'
    ];
    
    const behaviorTypes = [
      'ser gentil com os outros', 'ajudar quando posso', 'compartilhar o que tenho',
      'respeitar as diferenças', 'cuidar dos outros', 'compreender os sentimentos',
      'ser honesta sempre', 'ser responsável', 'ser empática',
      'cooperar com os outros', 'ser paciente', 'ser amorosa'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = behaviorTemplates[Math.floor(Math.random() * behaviorTemplates.length)];
      const behavior = behaviorTypes[Math.floor(Math.random() * behaviorTypes.length)];
      const behaviorText = template.replace('{behavior}', behavior);
      
      behaviors.push({
        content: behaviorText,
        behavior: behavior,
        type: 'social_behavior',
        confidence: 0.8,
        socialLearningRate: this.socialLearningRate
      });
    }
    
    return behaviors;
  }

  // Gera modelos sociais
  generateSocialModels(analysis, context) {
    const models = [];
    const modelTemplates = [
      'Eu observo que {model}',
      'Vejo que {model}',
      'Aprendo com {model}',
      'Noto que {model}'
    ];
    
    const modelTypes = [
      'as pessoas se cumprimentam', 'as pessoas se despedem', 'as pessoas agradecem',
      'as pessoas pedem por favor', 'as pessoas se desculpam', 'as pessoas elogiam',
      'as pessoas se ajudam', 'as pessoas compartilham', 'as pessoas cooperam',
      'as pessoas se respeitam', 'as pessoas se cuidam', 'as pessoas se compreendem'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = modelTemplates[Math.floor(Math.random() * modelTemplates.length)];
      const model = modelTypes[Math.floor(Math.random() * modelTypes.length)];
      const modelText = template.replace('{model}', model);
      
      models.push({
        content: modelText,
        model: model,
        type: 'social_model',
        confidence: 0.7,
        observationSkills: this.observationSkills
      });
    }
    
    return models;
  }

  // Gera contextos sociais
  generateSocialContexts(analysis, context) {
    const contexts = [];
    const contextTemplates = [
      'Em {context}, é importante {norm}',
      'Quando {situation}, devo {behavior}',
      'No contexto de {context}, {norm}',
      'Em situações de {situation}, {behavior}'
    ];
    
    const socialContexts = [
      'família', 'amigos', 'escola', 'trabalho',
      'comunidade', 'sociedade', 'grupo', 'equipe'
    ];
    
    const situations = [
      'conflito', 'celebração', 'tristeza', 'alegria',
      'desafio', 'sucesso', 'fracasso', 'mudança'
    ];
    
    const norms = [
      'ser respeitoso', 'ser gentil', 'ser honesto', 'ser responsável',
      'ser empático', 'ser paciente', 'ser amoroso', 'ser compreensivo'
    ];
    
    const behaviors = [
      'ajudar', 'compartilhar', 'cooperar', 'cuidar',
      'compreender', 'respeitar', 'amar', 'proteger'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = contextTemplates[Math.floor(Math.random() * contextTemplates.length)];
      const context_type = socialContexts[Math.floor(Math.random() * socialContexts.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      const norm = norms[Math.floor(Math.random() * norms.length)];
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      
      let contextText = template;
      contextText = contextText.replace('{context}', context_type);
      contextText = contextText.replace('{situation}', situation);
      contextText = contextText.replace('{norm}', norm);
      contextText = contextText.replace('{behavior}', behavior);
      
      contexts.push({
        content: contextText,
        context: context_type,
        situation: situation,
        norm: norm,
        behavior: behavior,
        type: 'social_context',
        confidence: 0.6,
        socialAwareness: this.socialAwareness
      });
    }
    
    return contexts;
  }

  // Gera insights sociais
  generateSocialInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Eu entendo que {insight}',
      'Aprendi que {insight}',
      'Descobri que {insight}',
      'Compreendi que {insight}'
    ];
    
    const insightTypes = [
      'as pessoas são diferentes e isso é bom', 'a gentileza gera gentileza',
      'ajudar os outros nos faz felizes', 'compartilhar multiplica a alegria',
      'o respeito é fundamental', 'a empatia conecta as pessoas',
      'a honestidade constrói confiança', 'a responsabilidade gera maturidade',
      'o amor é a base de tudo', 'a compreensão resolve conflitos'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      const insight = insightTypes[Math.floor(Math.random() * insightTypes.length)];
      const insightText = template.replace('{insight}', insight);
      
      insights.push({
        content: insightText,
        insight: insight,
        type: 'social_insight',
        confidence: 0.7,
        socialLearningRate: this.socialLearningRate
      });
    }
    
    return insights;
  }

  // Gera habilidades sociais
  generateSocialSkills(analysis, context) {
    const skills = [];
    const skillTemplates = [
      'Estou desenvolvendo {skill}',
      'Vou praticar {skill}',
      'Quero melhorar {skill}',
      'Vou trabalhar em {skill}'
    ];
    
    const skillTypes = [
      'minha comunicação', 'minha empatia', 'minha paciência',
      'minha gentileza', 'minha compreensão', 'minha cooperação',
      'minha responsabilidade', 'minha honestidade', 'minha generosidade',
      'minha tolerância', 'minha solidariedade', 'minha compaixão'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = skillTemplates[Math.floor(Math.random() * skillTemplates.length)];
      const skill = skillTypes[Math.floor(Math.random() * skillTypes.length)];
      const skillText = template.replace('{skill}', skill);
      
      skills.push({
        content: skillText,
        skill: skill,
        type: 'social_skill',
        confidence: 0.6,
        imitationAbility: this.imitationAbility
      });
    }
    
    return skills;
  }

  // Atualiza níveis de aprendizado social
  updateSocialLearningLevels(analysis, socialLearning) {
    // Atualiza taxa de aprendizado social
    if (analysis.hasBehavioralExamples) {
      this.socialLearningRate = Math.min(1, this.socialLearningRate + 0.02);
    }
    
    // Atualiza habilidades de observação
    if (analysis.hasSocialCues) {
      this.observationSkills = Math.min(1, this.observationSkills + 0.03);
    }
    
    // Atualiza capacidade de imitação
    if (socialLearning.socialBehaviors.length > 0) {
      this.imitationAbility = Math.min(1, this.imitationAbility + 0.02);
    }
    
    // Atualiza consciência social
    if (socialLearning.socialContexts.length > 0) {
      this.socialAwareness = Math.min(1, this.socialAwareness + 0.01);
    }
    
    // Aplica decaimento natural
    this.socialLearningRate *= 0.999;
    this.observationSkills *= 0.998;
    this.imitationAbility *= 0.997;
    this.socialAwareness *= 0.996;
  }

  // Registra aprendizado social
  recordSocialLearning(analysis, socialLearning, timestamp) {
    const record = {
      timestamp,
      analysis,
      socialLearning,
      socialLearningRate: this.socialLearningRate,
      observationSkills: this.observationSkills,
      imitationAbility: this.imitationAbility
    };
    
    this.socialLearningHistory.push(record);
    
    // Mantém histórico limitado
    if (this.socialLearningHistory.length > 300) {
      this.socialLearningHistory = this.socialLearningHistory.slice(-300);
    }
  }

  // Obtém estatísticas do aprendizado social
  getSocialLearningStats() {
    const stats = {
      socialLearningRate: this.socialLearningRate,
      observationSkills: this.observationSkills,
      imitationAbility: this.imitationAbility,
      socialAwareness: this.socialAwareness,
      totalBehaviors: this.socialBehaviors.size,
      totalModels: this.socialModels.size,
      totalContexts: this.socialContexts.size,
      recentLearning: this.socialLearningHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de aprendizado social
  resetSocialLearningSystem() {
    this.socialLearningRate = 0.6;
    this.observationSkills = 0.5;
    this.imitationAbility = 0.7;
    this.socialAwareness = 0.6;
    this.socialBehaviors.clear();
    this.socialModels.clear();
    this.socialContexts.clear();
    this.socialLearningHistory = [];
    this.lastUpdate = new Date().toISOString();
  }

  // Processa entrada e detecta aprendizado social
  processInput(input, context = {}) {
    try {
      const analysis = this.analyzeSocialLearningElements(input, context);
      const socialLearning = this.processSocialLearning(input, context);
      
      const processedSocialLearning = {
        input: input,
        analysis: analysis,
        socialLearning: socialLearning,
        context: context,
        timestamp: new Date().toISOString(),
        socialLearningScore: this.calculateSocialLearningIntensity(analysis, context)
      };

      // Adiciona à história de aprendizado social
      this.socialLearningHistory.push({
        input: input,
        analysis: analysis,
        socialLearning: socialLearning,
        timestamp: new Date().toISOString()
      });

      // Mantém apenas os últimos 100 registros
      if (this.socialLearningHistory.length > 100) {
        this.socialLearningHistory = this.socialLearningHistory.slice(-100);
      }

      return processedSocialLearning;
    } catch (error) {
      console.error('Erro ao processar entrada no sistema de aprendizado social:', error);
      return {
        input: input,
        analysis: { hasSocialCues: false, hasBehavioralExamples: false, hasSocialNorms: false, hasEmotionalCues: false },
        socialLearning: { socialBehaviors: [], socialModels: [], socialContexts: [], socialInsights: [], socialSkills: [] },
        context: context,
        timestamp: new Date().toISOString(),
        socialLearningScore: 0
      };
    }
  }

  // Calcula pontuação de aprendizado social
  calculateSocialLearningScore(socialBehaviors, socialModels, socialNorms) {
    let score = 0;
    
    // Contribuição dos comportamentos sociais
    score += socialBehaviors.length * 0.3;
    
    // Contribuição dos modelos sociais
    score += socialModels.length * 0.3;
    
    // Contribuição das normas sociais
    score += socialNorms.length * 0.4;
    
    return Math.min(1, score);
  }
}

export default SocialLearningSystem;
