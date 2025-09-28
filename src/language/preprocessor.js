// src/language/preprocessor.js - Pré-processador de Linguagem da Nanabot
// Processa e prepara entrada de linguagem antes do processamento principal

import { loadState, saveState } from '../utils/stateManager.js';

class LanguagePreprocessor {
  constructor() {
    this.preprocessingLevel = 0.8; // Nível de pré-processamento (0-1)
    this.normalizationSkills = 0.7; // Habilidades de normalização
    this.contextualizationSkills = 0.6; // Habilidades de contextualização
    this.linguisticAnalysis = 0.5; // Análise linguística
    this.preprocessingHistory = [];
    this.preprocessingPatterns = new Map();
    this.preprocessingRules = new Map();
    this.lastUpdate = new Date().toISOString();
    this.loadPreprocessorState();
  }

  // Carrega estado do pré-processador
  loadPreprocessorState() {
    const state = loadState('preprocessor', this.getDefaultState());
    this.preprocessingLevel = state.preprocessingLevel || 0.8;
    this.normalizationSkills = state.normalizationSkills || 0.7;
    this.contextualizationSkills = state.contextualizationSkills || 0.6;
    this.linguisticAnalysis = state.linguisticAnalysis || 0.5;
    this.preprocessingHistory = state.preprocessingHistory || [];
    this.preprocessingPatterns = new Map(state.preprocessingPatterns || []);
    this.preprocessingRules = new Map(state.preprocessingRules || []);
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado do pré-processador
  savePreprocessorState() {
    const state = {
      preprocessingLevel: this.preprocessingLevel,
      normalizationSkills: this.normalizationSkills,
      contextualizationSkills: this.contextualizationSkills,
      linguisticAnalysis: this.linguisticAnalysis,
      preprocessingHistory: this.preprocessingHistory.slice(-200),
      preprocessingPatterns: Array.from(this.preprocessingPatterns.entries()),
      preprocessingRules: Array.from(this.preprocessingRules.entries()),
      lastUpdate: this.lastUpdate
    };
    saveState('preprocessor', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      preprocessingLevel: 0.8,
      normalizationSkills: 0.7,
      contextalizationSkills: 0.6,
      linguisticAnalysis: 0.5,
      preprocessingHistory: [],
      preprocessingPatterns: [],
      preprocessingRules: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada de linguagem
  processLanguageInput(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos linguísticos
    const analysis = this.analyzeLanguageInput(input, context);
    
    // Normaliza entrada
    const normalizedInput = this.normalizeInput(input, analysis, context);
    
    // Contextualiza entrada
    const contextualizedInput = this.contextualizeInput(normalizedInput, analysis, context);
    
    // Gera processamento final
    const processedInput = this.generateProcessedInput(contextualizedInput, analysis, context);
    
    // Atualiza níveis de pré-processamento
    this.updatePreprocessingLevels(analysis, processedInput);
    
    // Registra no histórico
    this.recordPreprocessing(analysis, processedInput, timestamp);
    
    this.lastUpdate = timestamp;
    this.savePreprocessorState();
    
    return {
      originalInput: input,
      analysis,
      normalizedInput,
      contextualizedInput,
      processedInput,
      preprocessingLevel: this.preprocessingLevel,
      normalizationSkills: this.normalizationSkills,
      contextualizationSkills: this.contextualizationSkills
    };
  }

  // Analisa entrada de linguagem
  analyzeLanguageInput(input, context) {
    const analysis = {
      hasEmotionalContent: false,
      hasLinguisticComplexity: false,
      hasContextualElements: false,
      hasAmbiguity: false,
      emotionalContent: [],
      linguisticComplexity: [],
      contextualElements: [],
      ambiguities: [],
      preprocessingIntensity: 0,
      preprocessingComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta conteúdo emocional
    const emotionalContent = this.detectEmotionalContent(input, context);
    if (emotionalContent.length > 0) {
      analysis.hasEmotionalContent = true;
      analysis.emotionalContent = emotionalContent;
    }
    
    // Detecta complexidade linguística
    const linguisticComplexity = this.detectLinguisticComplexity(input, context);
    if (linguisticComplexity.length > 0) {
      analysis.hasLinguisticComplexity = true;
      analysis.linguisticComplexity = linguisticComplexity;
    }
    
    // Detecta elementos contextuais
    const contextualElements = this.detectContextualElements(input, context);
    if (contextualElements.length > 0) {
      analysis.hasContextualElements = true;
      analysis.contextualElements = contextualElements;
    }
    
    // Detecta ambiguidades
    const ambiguities = this.detectAmbiguities(input, context);
    if (ambiguities.length > 0) {
      analysis.hasAmbiguity = true;
      analysis.ambiguities = ambiguities;
    }
    
    // Calcula intensidade do pré-processamento
    analysis.preprocessingIntensity = this.calculatePreprocessingIntensity(analysis, context);
    
    // Calcula complexidade do pré-processamento
    analysis.preprocessingComplexity = this.calculatePreprocessingComplexity(analysis, context);
    
    return analysis;
  }

  // Detecta conteúdo emocional
  detectEmotionalContent(input, context) {
    const emotionalContent = [];
    const lowerInput = input.toLowerCase();
    
    const emotionalKeywords = {
      'alegria': ['feliz', 'alegre', 'content', 'sorrindo', 'riso', 'risada'],
      'tristeza': ['triste', 'chorando', 'melancolia', 'saudade', 'choro'],
      'amor': ['amor', 'carinho', 'afeição', 'querer', 'amar', 'coração'],
      'medo': ['medo', 'assustado', 'pavor', 'terror', 'susto'],
      'raiva': ['raiva', 'bravo', 'irritado', 'furioso', 'irritação'],
      'surpresa': ['surpresa', 'uau', 'nossa', 'incrível', 'impressionante'],
      'nojo': ['nojo', 'eca', 'repugnante', 'nojento'],
      'vergonha': ['vergonha', 'envergonhado', 'constrangido', 'tímido']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          emotionalContent.push({
            emotion: emotion,
            keyword: keyword,
            type: 'emotional_content',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return emotionalContent;
  }

  // Detecta complexidade linguística
  detectLinguisticComplexity(input, context) {
    const linguisticComplexity = [];
    const lowerInput = input.toLowerCase();
    
    const complexityKeywords = {
      'complexo': ['complexo', 'complicado', 'difícil', 'intricado'],
      'abstrato': ['abstrato', 'conceitual', 'teórico', 'filosófico'],
      'técnico': ['técnico', 'especializado', 'científico', 'acadêmico'],
      'formal': ['formal', 'oficial', 'cerimonial', 'protocolo'],
      'informal': ['informal', 'casual', 'relaxado', 'descontraído']
    };
    
    for (const [type, keywords] of Object.entries(complexityKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          linguisticComplexity.push({
            type: type,
            keyword: keyword,
            category: 'linguistic_complexity',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return linguisticComplexity;
  }

  // Detecta elementos contextuais
  detectContextualElements(input, context) {
    const contextualElements = [];
    const lowerInput = input.toLowerCase();
    
    const contextualKeywords = {
      'temporal': ['hoje', 'ontem', 'amanhã', 'agora', 'depois', 'antes'],
      'espacial': ['aqui', 'ali', 'lá', 'perto', 'longe', 'dentro', 'fora'],
      'social': ['você', 'eu', 'nós', 'eles', 'ela', 'ele', 'mamãe', 'papai'],
      'causal': ['porque', 'por isso', 'então', 'assim', 'portanto'],
      'condicional': ['se', 'caso', 'quando', 'enquanto', 'durante']
    };
    
    for (const [type, keywords] of Object.entries(contextualKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          contextualElements.push({
            type: type,
            keyword: keyword,
            category: 'contextual_element',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return contextualElements;
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

  // Calcula intensidade do pré-processamento
  calculatePreprocessingIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em conteúdo emocional
    if (analysis.hasEmotionalContent) {
      intensity += analysis.emotionalContent.length * 0.2;
    }
    
    // Intensidade baseada em complexidade linguística
    if (analysis.hasLinguisticComplexity) {
      intensity += analysis.linguisticComplexity.length * 0.15;
    }
    
    // Intensidade baseada em elementos contextuais
    if (analysis.hasContextualElements) {
      intensity += analysis.contextualElements.length * 0.1;
    }
    
    // Intensidade baseada no contexto
    if (context.emotionalIntensity > 0.5) {
      intensity += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula complexidade do pré-processamento
  calculatePreprocessingComplexity(analysis, context) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de elementos
    complexity += analysis.emotionalContent.length * 0.1;
    complexity += analysis.linguisticComplexity.length * 0.15;
    complexity += analysis.contextualElements.length * 0.1;
    complexity += analysis.ambiguities.length * 0.1;
    
    // Complexidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      complexity += context.emotionalIntensity * 0.2;
    }
    
    return Math.min(1, complexity);
  }

  // Normaliza entrada
  normalizeInput(input, analysis, context) {
    let normalizedInput = input;
    
    // Normaliza espaços
    normalizedInput = normalizedInput.replace(/\s+/g, ' ').trim();
    
    // Normaliza pontuação
    normalizedInput = normalizedInput.replace(/[!]{2,}/g, '!');
    normalizedInput = normalizedInput.replace(/[?]{2,}/g, '?');
    normalizedInput = normalizedInput.replace(/[.]{2,}/g, '.');
    
    // Normaliza maiúsculas/minúsculas
    normalizedInput = normalizedInput.toLowerCase();
    
    // Normaliza caracteres especiais
    normalizedInput = normalizedInput.replace(/[^\w\s!?.,;:]/g, '');
    
    return normalizedInput;
  }

  // Contextualiza entrada
  contextualizeInput(input, analysis, context) {
    let contextualizedInput = input;
    
    // Adiciona contexto temporal
    if (context.timestamp) {
      contextualizedInput = `[${context.timestamp}] ${contextualizedInput}`;
    }
    
    // Adiciona contexto social
    if (context.userRole) {
      contextualizedInput = `[${context.userRole}] ${contextualizedInput}`;
    }
    
    // Adiciona contexto emocional
    if (context.emotionalIntensity > 0.5) {
      contextualizedInput = `[emocional:${context.emotionalIntensity}] ${contextualizedInput}`;
    }
    
    return contextualizedInput;
  }

  // Gera processamento final
  generateProcessedInput(input, analysis, context) {
    const processedInput = {
      originalInput: input,
      normalizedInput: input,
      contextualizedInput: input,
      analysis: analysis,
      context: context,
      preprocessingLevel: this.preprocessingLevel,
      normalizationSkills: this.normalizationSkills,
      contextualizationSkills: this.contextualizationSkills,
      timestamp: new Date().toISOString()
    };
    
    return processedInput;
  }

  // Atualiza níveis de pré-processamento
  updatePreprocessingLevels(analysis, processedInput) {
    // Atualiza nível de pré-processamento
    if (analysis.hasEmotionalContent) {
      this.preprocessingLevel = Math.min(1, this.preprocessingLevel + 0.02);
    }
    
    // Atualiza habilidades de normalização
    if (analysis.hasLinguisticComplexity) {
      this.normalizationSkills = Math.min(1, this.normalizationSkills + 0.03);
    }
    
    // Atualiza habilidades de contextualização
    if (analysis.hasContextualElements) {
      this.contextualizationSkills = Math.min(1, this.contextualizationSkills + 0.02);
    }
    
    // Atualiza análise linguística
    if (analysis.hasAmbiguity) {
      this.linguisticAnalysis = Math.min(1, this.linguisticAnalysis + 0.02);
    }
    
    // Aplica decaimento natural
    this.preprocessingLevel *= 0.999;
    this.normalizationSkills *= 0.998;
    this.contextualizationSkills *= 0.997;
    this.linguisticAnalysis *= 0.998;
  }

  // Registra pré-processamento
  recordPreprocessing(analysis, processedInput, timestamp) {
    const record = {
      timestamp,
      analysis,
      processedInput,
      preprocessingLevel: this.preprocessingLevel,
      normalizationSkills: this.normalizationSkills,
      contextualizationSkills: this.contextualizationSkills
    };
    
    this.preprocessingHistory.push(record);
    
    // Mantém histórico limitado
    if (this.preprocessingHistory.length > 300) {
      this.preprocessingHistory = this.preprocessingHistory.slice(-300);
    }
  }

  // Obtém estatísticas do pré-processador
  getPreprocessorStats() {
    const stats = {
      preprocessingLevel: this.preprocessingLevel,
      normalizationSkills: this.normalizationSkills,
      contextualizationSkills: this.contextualizationSkills,
      linguisticAnalysis: this.linguisticAnalysis,
      totalPreprocessings: this.preprocessingHistory.length,
      totalPatterns: this.preprocessingPatterns.size,
      totalRules: this.preprocessingRules.size,
      recentPreprocessings: this.preprocessingHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta pré-processador
  resetPreprocessor() {
    this.preprocessingLevel = 0.8;
    this.normalizationSkills = 0.7;
    this.contextualizationSkills = 0.6;
    this.linguisticAnalysis = 0.5;
    this.preprocessingHistory = [];
    this.preprocessingPatterns.clear();
    this.preprocessingRules.clear();
    this.lastUpdate = new Date().toISOString();
  }
}

export default LanguagePreprocessor;
