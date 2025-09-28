// src/language/vocabulary.js - Sistema de Vocabulário da Nanabot
// Gerencia vocabulário, palavras, significados e desenvolvimento linguístico

import { loadState, saveState } from '../utils/stateManager.js';

class VocabularySystem {
  constructor() {
    this.vocabularyLevel = 0.5; // Nível de vocabulário (0-1)
    this.wordLearningRate = 0.3; // Taxa de aprendizado de palavras
    this.meaningComprehension = 0.4; // Compreensão de significados
    this.linguisticDevelopment = 0.6; // Desenvolvimento linguístico
    this.words = new Map();
    this.wordMeanings = new Map();
    this.wordCategories = new Map();
    this.wordUsage = new Map();
    this.vocabularyHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadVocabularyState();
  }

  // Carrega estado do vocabulário
  loadVocabularyState() {
    const state = loadState('vocabulary', this.getDefaultState());
    this.vocabularyLevel = state.vocabularyLevel || 0.5;
    this.wordLearningRate = state.wordLearningRate || 0.3;
    this.meaningComprehension = state.meaningComprehension || 0.4;
    this.linguisticDevelopment = state.linguisticDevelopment || 0.6;
    this.words = new Map(state.words || []);
    this.wordMeanings = new Map(state.wordMeanings || []);
    this.wordCategories = new Map(state.wordCategories || []);
    this.wordUsage = new Map(state.wordUsage || []);
    this.vocabularyHistory = state.vocabularyHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado do vocabulário
  saveVocabularyState() {
    const state = {
      vocabularyLevel: this.vocabularyLevel,
      wordLearningRate: this.wordLearningRate,
      meaningComprehension: this.meaningComprehension,
      linguisticDevelopment: this.linguisticDevelopment,
      words: Array.from(this.words.entries()),
      wordMeanings: Array.from(this.wordMeanings.entries()),
      wordCategories: Array.from(this.wordCategories.entries()),
      wordUsage: Array.from(this.wordUsage.entries()),
      vocabularyHistory: this.vocabularyHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('vocabulary', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      vocabularyLevel: 0.5,
      wordLearningRate: 0.3,
      meaningComprehension: 0.4,
      linguisticDevelopment: 0.6,
      words: [],
      wordMeanings: [],
      wordCategories: [],
      wordUsage: [],
      vocabularyHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gerencia vocabulário
  processVocabulary(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos de vocabulário
    const analysis = this.analyzeVocabularyElements(input, context);
    
    // Gera vocabulário baseado na análise
    const vocabulary = this.generateVocabulary(analysis, context);
    
    // Atualiza níveis de vocabulário
    this.updateVocabularyLevels(analysis, vocabulary);
    
    // Registra no histórico
    this.recordVocabulary(analysis, vocabulary, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveVocabularyState();
    
    return {
      analysis,
      vocabulary,
      vocabularyLevel: this.vocabularyLevel,
      wordLearningRate: this.wordLearningRate,
      meaningComprehension: this.meaningComprehension,
      linguisticDevelopment: this.linguisticDevelopment
    };
  }

  // Analisa entrada para elementos de vocabulário
  analyzeVocabularyElements(input, context) {
    const analysis = {
      hasNewWords: false,
      hasComplexWords: false,
      hasEmotionalWords: false,
      hasContextualWords: false,
      newWords: [],
      complexWords: [],
      emotionalWords: [],
      contextualWords: [],
      vocabularyIntensity: 0,
      vocabularyComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta palavras novas
    const newWords = this.detectNewWords(input, context);
    if (newWords.length > 0) {
      analysis.hasNewWords = true;
      analysis.newWords = newWords;
    }
    
    // Detecta palavras complexas
    const complexWords = this.detectComplexWords(input, context);
    if (complexWords.length > 0) {
      analysis.hasComplexWords = true;
      analysis.complexWords = complexWords;
    }
    
    // Detecta palavras emocionais
    const emotionalWords = this.detectEmotionalWords(input, context);
    if (emotionalWords.length > 0) {
      analysis.hasEmotionalWords = true;
      analysis.emotionalWords = emotionalWords;
    }
    
    // Detecta palavras contextuais
    const contextualWords = this.detectContextualWords(input, context);
    if (contextualWords.length > 0) {
      analysis.hasContextualWords = true;
      analysis.contextualWords = contextualWords;
    }
    
    // Calcula intensidade do vocabulário
    analysis.vocabularyIntensity = this.calculateVocabularyIntensity(analysis, context);
    
    // Calcula complexidade do vocabulário
    analysis.vocabularyComplexity = this.calculateVocabularyComplexity(analysis, context);
    
    return analysis;
  }

  // Detecta palavras novas
  detectNewWords(input, context) {
    const newWords = [];
    const lowerInput = input.toLowerCase();
    
    const newWordKeywords = {
      'palavra_nova': ['nova palavra', 'palavra nova', 'palavra diferente', 'palavra estranha'],
      'aprendizado': ['aprender', 'estudar', 'conhecer', 'descobrir'],
      'vocabulario': ['vocabulário', 'palavras', 'linguagem', 'idioma'],
      'significado': ['significado', 'sentido', 'definição', 'explicação']
    };
    
    for (const [type, keywords] of Object.entries(newWordKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          newWords.push({
            type: type,
            keyword: keyword,
            category: 'new_word',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return newWords;
  }

  // Detecta palavras complexas
  detectComplexWords(input, context) {
    const complexWords = [];
    const lowerInput = input.toLowerCase();
    
    const complexWordKeywords = {
      'complexo': ['complexo', 'complicado', 'difícil', 'intricado'],
      'abstrato': ['abstrato', 'conceitual', 'teórico', 'filosófico'],
      'técnico': ['técnico', 'especializado', 'científico', 'acadêmico'],
      'formal': ['formal', 'oficial', 'cerimonial', 'protocolo'],
      'sofisticado': ['sofisticado', 'elegante', 'refinado', 'culto']
    };
    
    for (const [type, keywords] of Object.entries(complexWordKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          complexWords.push({
            type: type,
            keyword: keyword,
            category: 'complex_word',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return complexWords;
  }

  // Detecta palavras emocionais
  detectEmotionalWords(input, context) {
    const emotionalWords = [];
    const lowerInput = input.toLowerCase();
    
    const emotionalWordKeywords = {
      'alegria': ['feliz', 'alegre', 'content', 'sorrindo', 'riso', 'risada'],
      'tristeza': ['triste', 'chorando', 'melancolia', 'saudade', 'choro'],
      'amor': ['amor', 'carinho', 'afeição', 'querer', 'amar', 'coração'],
      'medo': ['medo', 'assustado', 'pavor', 'terror', 'susto'],
      'raiva': ['raiva', 'bravo', 'irritado', 'furioso', 'irritação'],
      'surpresa': ['surpresa', 'uau', 'nossa', 'incrível', 'impressionante'],
      'nojo': ['nojo', 'eca', 'repugnante', 'nojento'],
      'vergonha': ['vergonha', 'envergonhado', 'constrangido', 'tímido']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionalWordKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          emotionalWords.push({
            emotion: emotion,
            keyword: keyword,
            category: 'emotional_word',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return emotionalWords;
  }

  // Detecta palavras contextuais
  detectContextualWords(input, context) {
    const contextualWords = [];
    const lowerInput = input.toLowerCase();
    
    const contextualWordKeywords = {
      'temporal': ['hoje', 'ontem', 'amanhã', 'agora', 'depois', 'antes'],
      'espacial': ['aqui', 'ali', 'lá', 'perto', 'longe', 'dentro', 'fora'],
      'social': ['você', 'eu', 'nós', 'eles', 'ela', 'ele', 'mamãe', 'papai'],
      'causal': ['porque', 'por isso', 'então', 'assim', 'portanto'],
      'condicional': ['se', 'caso', 'quando', 'enquanto', 'durante']
    };
    
    for (const [type, keywords] of Object.entries(contextualWordKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          contextualWords.push({
            type: type,
            keyword: keyword,
            category: 'contextual_word',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return contextualWords;
  }

  // Calcula intensidade do vocabulário
  calculateVocabularyIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em palavras novas
    if (analysis.hasNewWords) {
      intensity += analysis.newWords.length * 0.2;
    }
    
    // Intensidade baseada em palavras complexas
    if (analysis.hasComplexWords) {
      intensity += analysis.complexWords.length * 0.15;
    }
    
    // Intensidade baseada em palavras emocionais
    if (analysis.hasEmotionalWords) {
      intensity += analysis.emotionalWords.length * 0.15;
    }
    
    // Intensidade baseada em palavras contextuais
    if (analysis.hasContextualWords) {
      intensity += analysis.contextualWords.length * 0.1;
    }
    
    // Intensidade baseada no contexto
    if (context.emotionalIntensity > 0.5) {
      intensity += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula complexidade do vocabulário
  calculateVocabularyComplexity(analysis, context) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de elementos
    complexity += analysis.newWords.length * 0.1;
    complexity += analysis.complexWords.length * 0.15;
    complexity += analysis.emotionalWords.length * 0.1;
    complexity += analysis.contextualWords.length * 0.1;
    
    // Complexidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      complexity += context.emotionalIntensity * 0.2;
    }
    
    return Math.min(1, complexity);
  }

  // Gera vocabulário baseado na análise
  generateVocabulary(analysis, context) {
    const vocabulary = {
      words: [],
      wordMeanings: [],
      wordCategories: [],
      wordUsage: [],
      vocabularyLearning: [],
      vocabularyDevelopment: []
    };
    
    // Gera palavras
    if (analysis.hasNewWords) {
      vocabulary.words = this.generateWordList(analysis, context);
    }
    
    // Gera significados
    vocabulary.wordMeanings = this.generateWordMeanings(analysis, context);
    
    // Gera categorias
    vocabulary.wordCategories = this.generateWordCategories(analysis, context);
    
    // Gera uso de palavras
    vocabulary.wordUsage = this.generateWordUsage(analysis, context);
    
    // Gera aprendizado de vocabulário
    vocabulary.vocabularyLearning = this.generateVocabularyLearning(analysis, context);
    
    // Gera desenvolvimento de vocabulário
    vocabulary.vocabularyDevelopment = this.generateVocabularyDevelopment(analysis, context);
    
    return vocabulary;
  }

  // Gera lista de palavras
  generateWordList(analysis, context) {
    const words = [];
    const wordTemplates = [
      'Palavra: {word}',
      'Vocabulário: {word}',
      'Linguagem: {word}',
      'Idioma: {word}'
    ];
    
    const words_list = [
      'amor',
      'felicidade',
      'família',
      'amizade',
      'casa',
      'escola',
      'brincadeira',
      'aprendizado',
      'crescimento',
      'descoberta',
      'aventura',
      'sonho',
      'esperança',
      'coragem',
      'sabedoria'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = wordTemplates[Math.floor(Math.random() * wordTemplates.length)];
      const word = words_list[Math.floor(Math.random() * words_list.length)];
      const wordText = template.replace('{word}', word);
      
      words.push({
        content: wordText,
        word: word,
        type: 'word',
        confidence: 0.8,
        vocabularyLevel: this.vocabularyLevel
      });
    }
    
    return words;
  }

  // Gera significados de palavras
  generateWordMeanings(analysis, context) {
    const meanings = [];
    const meaningTemplates = [
      'Significado: {word} = {meaning}',
      'Definição: {word} é {meaning}',
      'Sentido: {word} significa {meaning}',
      'Explicação: {word} quer dizer {meaning}'
    ];
    
    const wordMeanings = {
      'amor': 'carinho e afeição',
      'felicidade': 'alegria e contentamento',
      'família': 'pessoas que nos amam',
      'amizade': 'companheirismo e lealdade',
      'casa': 'lugar onde vivemos',
      'escola': 'lugar onde aprendemos',
      'brincadeira': 'diversão e alegria',
      'aprendizado': 'processo de aprender',
      'crescimento': 'processo de evoluir',
      'descoberta': 'encontrar algo novo',
      'aventura': 'experiência emocionante',
      'sonho': 'desejo e esperança',
      'esperança': 'fé no futuro',
      'coragem': 'bravura e determinação',
      'sabedoria': 'conhecimento e experiência'
    };
    
    for (let i = 0; i < 2; i++) {
      const template = meaningTemplates[Math.floor(Math.random() * meaningTemplates.length)];
      const word = Object.keys(wordMeanings)[Math.floor(Math.random() * Object.keys(wordMeanings).length)];
      const meaning = wordMeanings[word];
      const meaningText = template.replace('{word}', word).replace('{meaning}', meaning);
      
      meanings.push({
        content: meaningText,
        word: word,
        meaning: meaning,
        type: 'word_meaning',
        confidence: 0.7,
        meaningComprehension: this.meaningComprehension
      });
    }
    
    return meanings;
  }

  // Gera categorias de palavras
  generateWordCategories(analysis, context) {
    const categories = [];
    const categoryTemplates = [
      'Categoria: {word} é {category}',
      'Tipo: {word} é uma palavra {category}',
      'Classificação: {word} pertence à categoria {category}',
      'Grupo: {word} é {category}'
    ];
    
    const wordCategories = {
      'amor': 'emocional',
      'felicidade': 'emocional',
      'família': 'social',
      'amizade': 'social',
      'casa': 'concreto',
      'escola': 'concreto',
      'brincadeira': 'ação',
      'aprendizado': 'ação',
      'crescimento': 'processo',
      'descoberta': 'processo',
      'aventura': 'experiência',
      'sonho': 'abstrato',
      'esperança': 'abstrato',
      'coragem': 'qualidade',
      'sabedoria': 'qualidade'
    };
    
    for (let i = 0; i < 2; i++) {
      const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
      const word = Object.keys(wordCategories)[Math.floor(Math.random() * Object.keys(wordCategories).length)];
      const category = wordCategories[word];
      const categoryText = template.replace('{word}', word).replace('{category}', category);
      
      categories.push({
        content: categoryText,
        word: word,
        category: category,
        type: 'word_category',
        confidence: 0.6,
        vocabularyLevel: this.vocabularyLevel
      });
    }
    
    return categories;
  }

  // Gera uso de palavras
  generateWordUsage(analysis, context) {
    const usage = [];
    const usageTemplates = [
      'Uso: {word} em {context}',
      'Aplicação: {word} para {purpose}',
      'Utilização: {word} quando {situation}',
      'Emprego: {word} em {scenario}'
    ];
    
    const wordUsage = {
      'amor': 'expressar carinho',
      'felicidade': 'descrever alegria',
      'família': 'falar sobre parentes',
      'amizade': 'mencionar amigos',
      'casa': 'referir ao lar',
      'escola': 'falar sobre educação',
      'brincadeira': 'descrever diversão',
      'aprendizado': 'mencionar estudo',
      'crescimento': 'falar sobre evolução',
      'descoberta': 'descrever achados',
      'aventura': 'mencionar experiências',
      'sonho': 'falar sobre desejos',
      'esperança': 'expressar otimismo',
      'coragem': 'descrever bravura',
      'sabedoria': 'mencionar conhecimento'
    };
    
    for (let i = 0; i < 2; i++) {
      const template = usageTemplates[Math.floor(Math.random() * usageTemplates.length)];
      const word = Object.keys(wordUsage)[Math.floor(Math.random() * Object.keys(wordUsage).length)];
      const usage_item = wordUsage[word];
      const usageText = template.replace('{word}', word).replace('{context}', usage_item).replace('{purpose}', usage_item).replace('{situation}', usage_item).replace('{scenario}', usage_item);
      
      usage.push({
        content: usageText,
        word: word,
        usage: usage_item,
        type: 'word_usage',
        confidence: 0.6,
        vocabularyLevel: this.vocabularyLevel
      });
    }
    
    return usage;
  }

  // Gera aprendizado de vocabulário
  generateVocabularyLearning(analysis, context) {
    const learning = [];
    const learningTemplates = [
      'Aprendizado: {learning}',
      'Estudo: {learning}',
      'Conhecimento: {learning}',
      'Educação: {learning}'
    ];
    
    const learning_list = [
      'palavras novas',
      'significados diferentes',
      'usos variados',
      'categorias linguísticas',
      'contextos diversos',
      'expressões idiomáticas',
      'sinônimos e antônimos',
      'etimologia das palavras'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = learningTemplates[Math.floor(Math.random() * learningTemplates.length)];
      const learning_item = learning_list[Math.floor(Math.random() * learning_list.length)];
      const learningText = template.replace('{learning}', learning_item);
      
      learning.push({
        content: learningText,
        learning: learning_item,
        type: 'vocabulary_learning',
        confidence: 0.7,
        wordLearningRate: this.wordLearningRate
      });
    }
    
    return learning;
  }

  // Gera desenvolvimento de vocabulário
  generateVocabularyDevelopment(analysis, context) {
    const development = [];
    const developmentTemplates = [
      'Desenvolvimento: {development}',
      'Evolução: {development}',
      'Crescimento: {development}',
      'Progresso: {development}'
    ];
    
    const development_list = [
      'expansão do vocabulário',
      'melhoria na compreensão',
      'aumento da fluência',
      'desenvolvimento da expressão',
      'crescimento linguístico',
      'evolução da comunicação',
      'progresso na linguagem',
      'desenvolvimento da fala'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = developmentTemplates[Math.floor(Math.random() * developmentTemplates.length)];
      const development_item = development_list[Math.floor(Math.random() * development_list.length)];
      const developmentText = template.replace('{development}', development_item);
      
      development.push({
        content: developmentText,
        development: development_item,
        type: 'vocabulary_development',
        confidence: 0.6,
        linguisticDevelopment: this.linguisticDevelopment
      });
    }
    
    return development;
  }

  // Atualiza níveis de vocabulário
  updateVocabularyLevels(analysis, vocabulary) {
    // Atualiza nível de vocabulário
    if (analysis.hasNewWords) {
      this.vocabularyLevel = Math.min(1, this.vocabularyLevel + 0.02);
    }
    
    // Atualiza taxa de aprendizado de palavras
    if (vocabulary.words.length > 0) {
      this.wordLearningRate = Math.min(1, this.wordLearningRate + 0.03);
    }
    
    // Atualiza compreensão de significados
    if (vocabulary.wordMeanings.length > 0) {
      this.meaningComprehension = Math.min(1, this.meaningComprehension + 0.02);
    }
    
    // Atualiza desenvolvimento linguístico
    if (vocabulary.vocabularyDevelopment.length > 0) {
      this.linguisticDevelopment = Math.min(1, this.linguisticDevelopment + 0.02);
    }
    
    // Aplica decaimento natural
    this.vocabularyLevel *= 0.999;
    this.wordLearningRate *= 0.998;
    this.meaningComprehension *= 0.997;
    this.linguisticDevelopment *= 0.998;
  }

  // Registra vocabulário
  recordVocabulary(analysis, vocabulary, timestamp) {
    const record = {
      timestamp,
      analysis,
      vocabulary,
      vocabularyLevel: this.vocabularyLevel,
      wordLearningRate: this.wordLearningRate,
      meaningComprehension: this.meaningComprehension,
      linguisticDevelopment: this.linguisticDevelopment
    };
    
    this.vocabularyHistory.push(record);
    
    // Mantém histórico limitado
    if (this.vocabularyHistory.length > 300) {
      this.vocabularyHistory = this.vocabularyHistory.slice(-300);
    }
  }

  // Obtém estatísticas do vocabulário
  getVocabularyStats() {
    const stats = {
      vocabularyLevel: this.vocabularyLevel,
      wordLearningRate: this.wordLearningRate,
      meaningComprehension: this.meaningComprehension,
      linguisticDevelopment: this.linguisticDevelopment,
      totalWords: this.words.size,
      totalMeanings: this.wordMeanings.size,
      totalCategories: this.wordCategories.size,
      totalUsage: this.wordUsage.size,
      recentVocabulary: this.vocabularyHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de vocabulário
  resetVocabularySystem() {
    this.vocabularyLevel = 0.5;
    this.wordLearningRate = 0.3;
    this.meaningComprehension = 0.4;
    this.linguisticDevelopment = 0.6;
    this.words.clear();
    this.wordMeanings.clear();
    this.wordCategories.clear();
    this.wordUsage.clear();
    this.vocabularyHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default VocabularySystem;
