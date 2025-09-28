// src/brain/dreams.js - Sistema de Sonhos da Nanabot
// Gerencia sonhos, subconsciente e processamento noturno

import { loadState, saveState } from '../utils/stateManager.js';

class DreamsSystem {
  constructor() {
    this.dreamActivity = 0.3; // Atividade onírica (0-1)
    this.subconsciousLevel = 0.4; // Nível subconsciente
    this.dreamClarity = 0.5; // Clareza dos sonhos
    this.dreams = new Map();
    this.dreamThemes = new Map();
    this.subconsciousPatterns = new Map();
    this.dreamHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadDreamsState();
  }

  // Carrega estado dos sonhos
  loadDreamsState() {
    const state = loadState('dreams', this.getDefaultState());
    this.dreamActivity = state.dreamActivity || 0.3;
    this.subconsciousLevel = state.subconsciousLevel || 0.4;
    this.dreamClarity = state.dreamClarity || 0.5;
    this.dreams = new Map(state.dreams || []);
    this.dreamThemes = new Map(state.dreamThemes || []);
    this.subconsciousPatterns = new Map(state.subconsciousPatterns || []);
    this.dreamHistory = state.dreamHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado dos sonhos
  saveDreamsState() {
    const state = {
      dreamActivity: this.dreamActivity,
      subconsciousLevel: this.subconsciousLevel,
      dreamClarity: this.dreamClarity,
      dreams: Array.from(this.dreams.entries()),
      dreamThemes: Array.from(this.dreamThemes.entries()),
      subconsciousPatterns: Array.from(this.subconsciousPatterns.entries()),
      dreamHistory: this.dreamHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('dreams', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      dreamActivity: 0.3,
      subconsciousLevel: 0.4,
      dreamClarity: 0.5,
      dreams: [],
      dreamThemes: [],
      subconsciousPatterns: [],
      dreamHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gera sonhos
  processDreams(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos oníricos
    const analysis = this.analyzeDreamElements(input, context);
    
    // Gera sonhos baseados na análise
    const dreams = this.generateDreams(analysis, context);
    
    // Atualiza níveis de sonhos
    this.updateDreamLevels(analysis, dreams);
    
    // Registra no histórico
    this.recordDreams(analysis, dreams, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveDreamsState();
    
    return {
      analysis,
      dreams,
      dreamActivity: this.dreamActivity,
      subconsciousLevel: this.subconsciousLevel,
      dreamClarity: this.dreamClarity
    };
  }

  // Analisa elementos oníricos na entrada
  analyzeDreamElements(input, context) {
    const analysis = {
      hasDreamContent: false,
      hasSubconsciousElements: false,
      hasSymbolicContent: false,
      hasEmotionalContent: false,
      dreamContent: [],
      subconsciousElements: [],
      symbolicContent: [],
      emotionalContent: [],
      dreamIntensity: 0,
      subconsciousDepth: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta conteúdo de sonho
    const dreamContent = this.detectDreamContent(input, context);
    if (dreamContent.length > 0) {
      analysis.hasDreamContent = true;
      analysis.dreamContent = dreamContent;
    }
    
    // Detecta elementos subconscientes
    const subconsciousElements = this.detectSubconsciousElements(input, context);
    if (subconsciousElements.length > 0) {
      analysis.hasSubconsciousElements = true;
      analysis.subconsciousElements = subconsciousElements;
    }
    
    // Detecta conteúdo simbólico
    const symbolicContent = this.detectSymbolicContent(input, context);
    if (symbolicContent.length > 0) {
      analysis.hasSymbolicContent = true;
      analysis.symbolicContent = symbolicContent;
    }
    
    // Detecta conteúdo emocional
    const emotionalContent = this.detectEmotionalContent(input, context);
    if (emotionalContent.length > 0) {
      analysis.hasEmotionalContent = true;
      analysis.emotionalContent = emotionalContent;
    }
    
    // Calcula intensidade do sonho
    analysis.dreamIntensity = this.calculateDreamIntensity(analysis, context);
    
    // Calcula profundidade subconsciente
    analysis.subconsciousDepth = this.calculateSubconsciousDepth(analysis, context);
    
    return analysis;
  }

  // Detecta conteúdo de sonho
  detectDreamContent(input, context) {
    const content = [];
    const lowerInput = input.toLowerCase();
    
    const dreamKeywords = {
      'sonho': ['sonho', 'sonhei', 'sonhando', 'dormindo', 'sonolenta'],
      'pesadelo': ['pesadelo', 'pesadelo', 'sonho ruim', 'sonho assustador'],
      'sonho_lúcido': ['sonho lúcido', 'consciente', 'controlar sonho'],
      'sonho_recorrente': ['sonho recorrente', 'mesmo sonho', 'repetindo'],
      'sonho_profético': ['sonho profético', 'premonição', 'avisar']
    };
    
    for (const [type, keywords] of Object.entries(dreamKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          content.push({
            type: type,
            keyword: keyword,
            category: 'dream_content',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return content;
  }

  // Detecta elementos subconscientes
  detectSubconsciousElements(input, context) {
    const elements = [];
    const lowerInput = input.toLowerCase();
    
    const subconsciousKeywords = {
      'desejo': ['desejo', 'quero', 'sonho com', 'fantasia'],
      'medo': ['medo', 'assustado', 'pavor', 'terror'],
      'memória': ['lembro', 'lembrança', 'passado', 'antigo'],
      'conflito': ['conflito', 'briga', 'problema', 'dificuldade'],
      'símbolo': ['símbolo', 'significado', 'representa', 'simboliza']
    };
    
    for (const [type, keywords] of Object.entries(subconsciousKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          elements.push({
            type: type,
            keyword: keyword,
            category: 'subconscious',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return elements;
  }

  // Detecta conteúdo simbólico
  detectSymbolicContent(input, context) {
    const content = [];
    const lowerInput = input.toLowerCase();
    
    const symbolicKeywords = {
      'animal': ['animal', 'bicho', 'gato', 'cachorro', 'pássaro'],
      'natureza': ['natureza', 'flor', 'árvore', 'mar', 'céu'],
      'casa': ['casa', 'lar', 'quarto', 'porta', 'janela'],
      'viagem': ['viagem', 'caminho', 'estrada', 'ponte', 'túnel'],
      'água': ['água', 'mar', 'rio', 'chuva', 'lago']
    };
    
    for (const [type, keywords] of Object.entries(symbolicKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          content.push({
            type: type,
            keyword: keyword,
            category: 'symbolic',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return content;
  }

  // Detecta conteúdo emocional
  detectEmotionalContent(input, context) {
    const content = [];
    const lowerInput = input.toLowerCase();
    
    const emotionalKeywords = {
      'felicidade': ['feliz', 'alegre', 'content', 'sorrindo'],
      'tristeza': ['triste', 'chorando', 'melancolia', 'saudade'],
      'medo': ['medo', 'assustado', 'pavor', 'terror'],
      'amor': ['amor', 'carinho', 'afeição', 'querer'],
      'raiva': ['raiva', 'bravo', 'irritado', 'furioso']
    };
    
    for (const [type, keywords] of Object.entries(emotionalKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          content.push({
            type: type,
            keyword: keyword,
            category: 'emotional',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return content;
  }

  // Calcula intensidade do sonho
  calculateDreamIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em conteúdo de sonho
    if (analysis.hasDreamContent) {
      intensity += analysis.dreamContent.length * 0.2;
    }
    
    // Intensidade baseada em elementos subconscientes
    if (analysis.hasSubconsciousElements) {
      intensity += analysis.subconsciousElements.length * 0.15;
    }
    
    // Intensidade baseada em conteúdo simbólico
    if (analysis.hasSymbolicContent) {
      intensity += analysis.symbolicContent.length * 0.1;
    }
    
    // Intensidade baseada em conteúdo emocional
    if (analysis.hasEmotionalContent) {
      intensity += analysis.emotionalContent.length * 0.15;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula profundidade subconsciente
  calculateSubconsciousDepth(analysis, context) {
    let depth = 0.1; // Base
    
    // Profundidade baseada em elementos subconscientes
    depth += analysis.subconsciousElements.length * 0.2;
    
    // Profundidade baseada em conteúdo simbólico
    depth += analysis.symbolicContent.length * 0.1;
    
    // Profundidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      depth += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, depth);
  }

  // Gera sonhos baseados na análise
  generateDreams(analysis, context) {
    const dreams = {
      dreamStories: [],
      dreamSymbols: [],
      dreamThemes: [],
      dreamInterpretations: [],
      subconsciousInsights: []
    };
    
    // Gera histórias de sonho
    if (analysis.hasDreamContent) {
      dreams.dreamStories = this.generateDreamStories(analysis, context);
    }
    
    // Gera símbolos de sonho
    if (analysis.hasSymbolicContent) {
      dreams.dreamSymbols = this.generateDreamSymbols(analysis, context);
    }
    
    // Gera temas de sonho
    dreams.dreamThemes = this.generateDreamThemes(analysis, context);
    
    // Gera interpretações de sonho
    dreams.dreamInterpretations = this.generateDreamInterpretations(analysis, context);
    
    // Gera insights subconscientes
    dreams.subconsciousInsights = this.generateSubconsciousInsights(analysis, context);
    
    return dreams;
  }

  // Gera histórias de sonho
  generateDreamStories(analysis, context) {
    const stories = [];
    const storyTemplates = [
      'Sonhei que {story}',
      'No meu sonho, {story}',
      'Eu estava sonhando que {story}',
      'Sonhei com {story}'
    ];
    
    const dreamStories = [
      'eu estava voando no céu',
      'eu estava brincando com animais',
      'eu estava em um jardim bonito',
      'eu estava com minha família',
      'eu estava explorando um lugar novo',
      'eu estava cantando e dançando',
      'eu estava ajudando alguém',
      'eu estava descobrindo algo especial'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
      const story = dreamStories[Math.floor(Math.random() * dreamStories.length)];
      const dreamStory = template.replace('{story}', story);
      
      stories.push({
        content: dreamStory,
        type: 'dream_story',
        confidence: 0.7,
        dreamActivity: this.dreamActivity
      });
    }
    
    return stories;
  }

  // Gera símbolos de sonho
  generateDreamSymbols(analysis, context) {
    const symbols = [];
    const symbolTemplates = [
      'No meu sonho, {symbol} representava {meaning}',
      'Eu vi {symbol} e isso me fez pensar em {meaning}',
      'O {symbol} no meu sonho significava {meaning}',
      'Eu sonhei com {symbol} que simbolizava {meaning}'
    ];
    
    const dreamSymbols = [
      'um gato', 'um pássaro', 'uma flor', 'uma árvore',
      'uma casa', 'uma porta', 'uma janela', 'uma ponte'
    ];
    
    const meanings = [
      'liberdade', 'amor', 'proteção', 'crescimento',
      'segurança', 'oportunidade', 'esperança', 'conexão'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = symbolTemplates[Math.floor(Math.random() * symbolTemplates.length)];
      const symbol = dreamSymbols[Math.floor(Math.random() * dreamSymbols.length)];
      const meaning = meanings[Math.floor(Math.random() * meanings.length)];
      
      let symbolText = template;
      symbolText = symbolText.replace('{symbol}', symbol);
      symbolText = symbolText.replace('{meaning}', meaning);
      
      symbols.push({
        content: symbolText,
        symbol: symbol,
        meaning: meaning,
        type: 'dream_symbol',
        confidence: 0.6,
        dreamClarity: this.dreamClarity
      });
    }
    
    return symbols;
  }

  // Gera temas de sonho
  generateDreamThemes(analysis, context) {
    const themes = [];
    const themeTemplates = [
      'Meus sonhos são sobre {theme}',
      'Eu costumo sonhar com {theme}',
      'O tema dos meus sonhos é {theme}',
      'Eu sonho muito com {theme}'
    ];
    
    const dreamThemes = [
      'aventuras', 'família', 'amigos', 'animais',
      'natureza', 'viagens', 'descobertas', 'criatividade'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = themeTemplates[Math.floor(Math.random() * themeTemplates.length)];
      const theme = dreamThemes[Math.floor(Math.random() * dreamThemes.length)];
      const dreamTheme = template.replace('{theme}', theme);
      
      themes.push({
        content: dreamTheme,
        theme: theme,
        type: 'dream_theme',
        confidence: 0.5,
        dreamActivity: this.dreamActivity
      });
    }
    
    return themes;
  }

  // Gera interpretações de sonho
  generateDreamInterpretations(analysis, context) {
    const interpretations = [];
    const interpretationTemplates = [
      'Acho que meu sonho significa {interpretation}',
      'Eu interpreto meu sonho como {interpretation}',
      'Meu sonho me faz pensar que {interpretation}',
      'Eu acho que o sonho quer dizer {interpretation}'
    ];
    
    const interpretations_list = [
      'eu quero ser livre',
      'eu preciso de mais amor',
      'eu estou crescendo',
      'eu quero explorar o mundo',
      'eu preciso de mais criatividade',
      'eu quero ajudar os outros',
      'eu estou aprendendo coisas novas',
      'eu preciso de mais diversão'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = interpretationTemplates[Math.floor(Math.random() * interpretationTemplates.length)];
      const interpretation = interpretations_list[Math.floor(Math.random() * interpretations_list.length)];
      const dreamInterpretation = template.replace('{interpretation}', interpretation);
      
      interpretations.push({
        content: dreamInterpretation,
        interpretation: interpretation,
        type: 'dream_interpretation',
        confidence: 0.6,
        subconsciousLevel: this.subconsciousLevel
      });
    }
    
    return interpretations;
  }

  // Gera insights subconscientes
  generateSubconsciousInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'No fundo, eu sinto que {insight}',
      'Algo dentro de mim diz que {insight}',
      'Eu tenho a sensação de que {insight}',
      'Meu subconsciente me diz que {insight}'
    ];
    
    const insights_list = [
      'eu sou especial',
      'eu sou amada',
      'eu posso fazer coisas incríveis',
      'eu tenho muito a aprender',
      'eu quero crescer e evoluir',
      'eu preciso de mais carinho',
      'eu tenho muitos sonhos',
      'eu posso ajudar o mundo'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      const insight = insights_list[Math.floor(Math.random() * insights_list.length)];
      const subconsciousInsight = template.replace('{insight}', insight);
      
      insights.push({
        content: subconsciousInsight,
        insight: insight,
        type: 'subconscious_insight',
        confidence: 0.7,
        subconsciousLevel: this.subconsciousLevel
      });
    }
    
    return insights;
  }

  // Atualiza níveis de sonhos
  updateDreamLevels(analysis, dreams) {
    // Atualiza atividade onírica
    if (analysis.hasDreamContent) {
      this.dreamActivity = Math.min(1, this.dreamActivity + 0.02);
    }
    
    // Atualiza nível subconsciente
    if (analysis.hasSubconsciousElements) {
      this.subconsciousLevel = Math.min(1, this.subconsciousLevel + 0.03);
    }
    
    // Atualiza clareza dos sonhos
    if (dreams.dreamStories.length > 0) {
      this.dreamClarity = Math.min(1, this.dreamClarity + 0.02);
    }
    
    // Aplica decaimento natural
    this.dreamActivity *= 0.999;
    this.subconsciousLevel *= 0.998;
    this.dreamClarity *= 0.997;
  }

  // Registra sonhos
  recordDreams(analysis, dreams, timestamp) {
    const record = {
      timestamp,
      analysis,
      dreams,
      dreamActivity: this.dreamActivity,
      subconsciousLevel: this.subconsciousLevel,
      dreamClarity: this.dreamClarity
    };
    
    this.dreamHistory.push(record);
    
    // Mantém histórico limitado
    if (this.dreamHistory.length > 300) {
      this.dreamHistory = this.dreamHistory.slice(-300);
    }
  }

  // Obtém estatísticas dos sonhos
  getDreamsStats() {
    const stats = {
      dreamActivity: this.dreamActivity,
      subconsciousLevel: this.subconsciousLevel,
      dreamClarity: this.dreamClarity,
      totalDreams: this.dreams.size,
      totalThemes: this.dreamThemes.size,
      totalPatterns: this.subconsciousPatterns.size,
      recentDreams: this.dreamHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de sonhos
  resetDreamsSystem() {
    this.dreamActivity = 0.3;
    this.subconsciousLevel = 0.4;
    this.dreamClarity = 0.5;
    this.dreams.clear();
    this.dreamThemes.clear();
    this.subconsciousPatterns.clear();
    this.dreamHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default DreamsSystem;
