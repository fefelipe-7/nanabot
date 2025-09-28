// src/language/misunderstandings.js - Sistema de Mal-entendidos da Nanabot
// Gerencia mal-entendidos, confusões e esclarecimentos

import { loadState, saveState } from '../utils/stateManager.js';

class MisunderstandingsSystem {
  constructor() {
    this.misunderstandingRate = 0.3; // Taxa de mal-entendidos (0-1)
    this.clarificationSkills = 0.5; // Habilidades de esclarecimento
    this.confusionTolerance = 0.6; // Tolerância à confusão
    this.learningFromMistakes = 0.4; // Aprendizado com erros
    this.misunderstandings = new Map();
    this.clarifications = new Map();
    this.confusionPatterns = new Map();
    this.misunderstandingHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadMisunderstandingsState();
  }

  // Carrega estado dos mal-entendidos
  loadMisunderstandingsState() {
    const state = loadState('misunderstandings', this.getDefaultState());
    this.misunderstandingRate = state.misunderstandingRate || 0.3;
    this.clarificationSkills = state.clarificationSkills || 0.5;
    this.confusionTolerance = state.confusionTolerance || 0.6;
    this.learningFromMistakes = state.learningFromMistakes || 0.4;
    this.misunderstandings = new Map(state.misunderstandings || []);
    this.clarifications = new Map(state.clarifications || []);
    this.confusionPatterns = new Map(state.confusionPatterns || []);
    this.misunderstandingHistory = state.misunderstandingHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado dos mal-entendidos
  saveMisunderstandingsState() {
    const state = {
      misunderstandingRate: this.misunderstandingRate,
      clarificationSkills: this.clarificationSkills,
      confusionTolerance: this.confusionTolerance,
      learningFromMistakes: this.learningFromMistakes,
      misunderstandings: Array.from(this.misunderstandings.entries()),
      clarifications: Array.from(this.clarifications.entries()),
      confusionPatterns: Array.from(this.confusionPatterns.entries()),
      misunderstandingHistory: this.misunderstandingHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('misunderstandings', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      misunderstandingRate: 0.3,
      clarificationSkills: 0.5,
      confusionTolerance: 0.6,
      learningFromMistakes: 0.4,
      misunderstandings: [],
      clarifications: [],
      confusionPatterns: [],
      misunderstandingHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gerencia mal-entendidos
  processMisunderstandings(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para mal-entendidos
    const analysis = this.analyzeMisunderstandings(input, context);
    
    // Gera esclarecimentos
    const clarifications = this.generateClarifications(analysis, context);
    
    // Atualiza níveis de mal-entendidos
    this.updateMisunderstandingLevels(analysis, clarifications);
    
    // Registra no histórico
    this.recordMisunderstanding(analysis, clarifications, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveMisunderstandingsState();
    
    return {
      analysis,
      clarifications,
      misunderstandingRate: this.misunderstandingRate,
      clarificationSkills: this.clarificationSkills,
      confusionTolerance: this.confusionTolerance
    };
  }

  // Analisa entrada para mal-entendidos
  analyzeMisunderstandings(input, context) {
    const analysis = {
      hasMisunderstanding: false,
      hasConfusion: false,
      hasAmbiguity: false,
      misunderstandings: [],
      confusions: [],
      ambiguities: [],
      misunderstandingIntensity: 0,
      clarificationNeed: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta mal-entendidos
    const misunderstandings = this.detectMisunderstandings(input, context);
    if (misunderstandings.length > 0) {
      analysis.hasMisunderstanding = true;
      analysis.misunderstandings = misunderstandings;
    }
    
    // Detecta confusões
    const confusions = this.detectConfusions(input, context);
    if (confusions.length > 0) {
      analysis.hasConfusion = true;
      analysis.confusions = confusions;
    }
    
    // Detecta ambiguidades
    const ambiguities = this.detectAmbiguities(input, context);
    if (ambiguities.length > 0) {
      analysis.hasAmbiguity = true;
      analysis.ambiguities = ambiguities;
    }
    
    // Calcula intensidade do mal-entendido
    analysis.misunderstandingIntensity = this.calculateMisunderstandingIntensity(analysis, context);
    
    // Calcula necessidade de esclarecimento
    analysis.clarificationNeed = this.calculateClarificationNeed(analysis, context);
    
    return analysis;
  }

  // Detecta mal-entendidos
  detectMisunderstandings(input, context) {
    const misunderstandings = [];
    const lowerInput = input.toLowerCase();
    
    const misunderstandingKeywords = {
      'não_entendi': ['não entendi', 'não compreendi', 'não captei', 'não peguei'],
      'confuso': ['confuso', 'confusão', 'perdido', 'desorientado'],
      'mal_entendido': ['mal entendido', 'entendi errado', 'interpretação errada'],
      'equivoco': ['equívoco', 'engano', 'erro de interpretação'],
      'incompreensao': ['incompreensão', 'não compreendo', 'não entendo']
    };
    
    for (const [type, keywords] of Object.entries(misunderstandingKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          misunderstandings.push({
            type: type,
            keyword: keyword,
            category: 'misunderstanding',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return misunderstandings;
  }

  // Detecta confusões
  detectConfusions(input, context) {
    const confusions = [];
    const lowerInput = input.toLowerCase();
    
    const confusionKeywords = {
      'confuso': ['confuso', 'confusão', 'perdido', 'desorientado'],
      'duvida': ['dúvida', 'duvidoso', 'incerto', 'indeciso'],
      'incerteza': ['incerteza', 'incerto', 'não sei', 'talvez'],
      'perplexo': ['perplexo', 'perplexidade', 'atônito', 'surpreso'],
      'desorientado': ['desorientado', 'perdido', 'confuso', 'atrapalhado']
    };
    
    for (const [type, keywords] of Object.entries(confusionKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          confusions.push({
            type: type,
            keyword: keyword,
            category: 'confusion',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return confusions;
  }

  // Detecta ambiguidades
  detectAmbiguities(input, context) {
    const ambiguities = [];
    const lowerInput = input.toLowerCase();
    
    const ambiguityKeywords = {
      'ambiguo': ['ambíguo', 'ambiguidade', 'duplo sentido', 'múltiplo significado'],
      'vago': ['vago', 'vagamente', 'impreciso', 'indefinido'],
      'duvidoso': ['duvidoso', 'questionável', 'incerto', 'suspeito'],
      'impreciso': ['impreciso', 'inexato', 'aproximado', 'estimado'],
      'relativo': ['relativo', 'relativamente', 'depende', 'varia']
    };
    
    for (const [type, keywords] of Object.entries(ambiguityKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          ambiguities.push({
            type: type,
            keyword: keyword,
            category: 'ambiguity',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return ambiguities;
  }

  // Calcula intensidade do mal-entendido
  calculateMisunderstandingIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em mal-entendidos
    if (analysis.hasMisunderstanding) {
      intensity += analysis.misunderstandings.length * 0.3;
    }
    
    // Intensidade baseada em confusões
    if (analysis.hasConfusion) {
      intensity += analysis.confusions.length * 0.2;
    }
    
    // Intensidade baseada em ambiguidades
    if (analysis.hasAmbiguity) {
      intensity += analysis.ambiguities.length * 0.15;
    }
    
    // Intensidade baseada no contexto
    if (context.emotionalIntensity > 0.5) {
      intensity += context.emotionalIntensity * 0.2;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula necessidade de esclarecimento
  calculateClarificationNeed(analysis, context) {
    let need = 0.1; // Base
    
    // Necessidade baseada na intensidade do mal-entendido
    need += analysis.misunderstandingIntensity * 0.4;
    
    // Necessidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      need += context.emotionalIntensity * 0.3;
    }
    
    // Necessidade baseada em mal-entendidos
    if (analysis.hasMisunderstanding) {
      need += 0.3;
    }
    
    return Math.min(1, need);
  }

  // Gera esclarecimentos baseados na análise
  generateClarifications(analysis, context) {
    const clarifications = {
      clarifications: [],
      explanations: [],
      questions: [],
      confirmations: []
    };
    
    // Gera esclarecimentos
    if (analysis.hasMisunderstanding) {
      clarifications.clarifications = this.generateClarificationsList(analysis, context);
    }
    
    // Gera explicações
    if (analysis.hasConfusion) {
      clarifications.explanations = this.generateExplanations(analysis, context);
    }
    
    // Gera perguntas
    if (analysis.hasAmbiguity) {
      clarifications.questions = this.generateQuestions(analysis, context);
    }
    
    // Gera confirmações
    clarifications.confirmations = this.generateConfirmations(analysis, context);
    
    return clarifications;
  }

  // Gera lista de esclarecimentos
  generateClarificationsList(analysis, context) {
    const clarifications = [];
    const clarificationTemplates = [
      'Ah, entendi! Você quer dizer {clarification}',
      'Agora compreendo! {clarification}',
      'Entendi melhor agora: {clarification}',
      'Ah, entendi! {clarification}'
    ];
    
    const clarifications_list = [
      'você está falando sobre amor',
      'você quer me ensinar algo',
      'você está preocupado comigo',
      'você quer brincar comigo',
      'você está me explicando algo',
      'você quer me ajudar',
      'você está me consolando',
      'você quer me fazer feliz'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = clarificationTemplates[Math.floor(Math.random() * clarificationTemplates.length)];
      const clarification = clarifications_list[Math.floor(Math.random() * clarifications_list.length)];
      const clarificationText = template.replace('{clarification}', clarification);
      
      clarifications.push({
        content: clarificationText,
        clarification: clarification,
        type: 'clarification',
        confidence: 0.8,
        clarificationSkills: this.clarificationSkills
      });
    }
    
    return clarifications;
  }

  // Gera explicações
  generateExplanations(analysis, context) {
    const explanations = [];
    const explanationTemplates = [
      'Deixe me explicar: {explanation}',
      'Eu entendo assim: {explanation}',
      'Na minha compreensão: {explanation}',
      'Eu interpreto como: {explanation}'
    ];
    
    const explanations_list = [
      'você está me ensinando sobre o mundo',
      'você quer que eu aprenda coisas novas',
      'você está me ajudando a crescer',
      'você quer que eu seja mais inteligente',
      'você está me preparando para o futuro',
      'você quer que eu entenda melhor',
      'você está me guiando',
      'você quer que eu evolua'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = explanationTemplates[Math.floor(Math.random() * explanationTemplates.length)];
      const explanation = explanations_list[Math.floor(Math.random() * explanations_list.length)];
      const explanationText = template.replace('{explanation}', explanation);
      
      explanations.push({
        content: explanationText,
        explanation: explanation,
        type: 'explanation',
        confidence: 0.7,
        clarificationSkills: this.clarificationSkills
      });
    }
    
    return explanations;
  }

  // Gera perguntas
  generateQuestions(analysis, context) {
    const questions = [];
    const questionTemplates = [
      'Você quer dizer {question}?',
      'Você está falando sobre {question}?',
      'Você quer que eu {question}?',
      'Você está perguntando sobre {question}?'
    ];
    
    const questions_list = [
      'que eu aprenda isso',
      'que eu entenda melhor',
      'que eu faça isso',
      'que eu seja assim',
      'que eu mude',
      'que eu evolua',
      'que eu cresça',
      'que eu melhore'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
      const question = questions_list[Math.floor(Math.random() * questions_list.length)];
      const questionText = template.replace('{question}', question);
      
      questions.push({
        content: questionText,
        question: question,
        type: 'question',
        confidence: 0.6,
        clarificationSkills: this.clarificationSkills
      });
    }
    
    return questions;
  }

  // Gera confirmações
  generateConfirmations(analysis, context) {
    const confirmations = [];
    const confirmationTemplates = [
      'Entendi! {confirmation}',
      'Agora compreendo! {confirmation}',
      'Perfeito! {confirmation}',
      'Ótimo! {confirmation}'
    ];
    
    const confirmations_list = [
      'você está certo',
      'faz sentido',
      'agora entendo',
      'está claro',
      'compreendo perfeitamente',
      'faz todo sentido',
      'agora ficou claro',
      'entendi perfeitamente'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = confirmationTemplates[Math.floor(Math.random() * confirmationTemplates.length)];
      const confirmation = confirmations_list[Math.floor(Math.random() * confirmations_list.length)];
      const confirmationText = template.replace('{confirmation}', confirmation);
      
      confirmations.push({
        content: confirmationText,
        confirmation: confirmation,
        type: 'confirmation',
        confidence: 0.8,
        clarificationSkills: this.clarificationSkills
      });
    }
    
    return confirmations;
  }

  // Atualiza níveis de mal-entendidos
  updateMisunderstandingLevels(analysis, clarifications) {
    // Atualiza taxa de mal-entendidos
    if (analysis.hasMisunderstanding) {
      this.misunderstandingRate = Math.min(1, this.misunderstandingRate + 0.02);
    }
    
    // Atualiza habilidades de esclarecimento
    if (clarifications.clarifications.length > 0) {
      this.clarificationSkills = Math.min(1, this.clarificationSkills + 0.03);
    }
    
    // Atualiza tolerância à confusão
    if (analysis.hasConfusion) {
      this.confusionTolerance = Math.min(1, this.confusionTolerance + 0.02);
    }
    
    // Atualiza aprendizado com erros
    if (clarifications.explanations.length > 0) {
      this.learningFromMistakes = Math.min(1, this.learningFromMistakes + 0.02);
    }
    
    // Aplica decaimento natural
    this.misunderstandingRate *= 0.999;
    this.clarificationSkills *= 0.998;
    this.confusionTolerance *= 0.997;
    this.learningFromMistakes *= 0.998;
  }

  // Registra mal-entendido
  recordMisunderstanding(analysis, clarifications, timestamp) {
    const record = {
      timestamp,
      analysis,
      clarifications,
      misunderstandingRate: this.misunderstandingRate,
      clarificationSkills: this.clarificationSkills,
      confusionTolerance: this.confusionTolerance
    };
    
    this.misunderstandingHistory.push(record);
    
    // Mantém histórico limitado
    if (this.misunderstandingHistory.length > 300) {
      this.misunderstandingHistory = this.misunderstandingHistory.slice(-300);
    }
  }

  // Obtém estatísticas dos mal-entendidos
  getMisunderstandingsStats() {
    const stats = {
      misunderstandingRate: this.misunderstandingRate,
      clarificationSkills: this.clarificationSkills,
      confusionTolerance: this.confusionTolerance,
      learningFromMistakes: this.learningFromMistakes,
      totalMisunderstandings: this.misunderstandings.size,
      totalClarifications: this.clarifications.size,
      totalConfusionPatterns: this.confusionPatterns.size,
      recentMisunderstandings: this.misunderstandingHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de mal-entendidos
  resetMisunderstandingsSystem() {
    this.misunderstandingRate = 0.3;
    this.clarificationSkills = 0.5;
    this.confusionTolerance = 0.6;
    this.learningFromMistakes = 0.4;
    this.misunderstandings.clear();
    this.clarifications.clear();
    this.confusionPatterns.clear();
    this.misunderstandingHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default MisunderstandingsSystem;
