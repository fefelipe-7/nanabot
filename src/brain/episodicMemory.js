// src/brain/episodicMemory.js - Sistema de Memória Episódica da Nanabot
// Gerencia memórias de eventos, experiências e narrativas pessoais

import { loadState, saveState } from '../utils/stateManager.js';

class EpisodicMemorySystem {
  constructor() {
    this.memoryCapacity = 1000; // Capacidade máxima de memórias
    this.episodicMemories = new Map();
    this.memoryCategories = new Map();
    this.memoryAssociations = new Map();
    this.memoryTimeline = [];
    this.memoryStrength = new Map();
    this.lastUpdate = new Date().toISOString();
    this.loadEpisodicMemoryState();
  }

  // Carrega estado da memória episódica
  loadEpisodicMemoryState() {
    const state = loadState('episodicMemory', this.getDefaultState());
    this.memoryCapacity = state.memoryCapacity || 1000;
    this.episodicMemories = new Map(state.episodicMemories || []);
    this.memoryCategories = new Map(state.memoryCategories || []);
    this.memoryAssociations = new Map(state.memoryAssociations || []);
    this.memoryTimeline = state.memoryTimeline || [];
    this.memoryStrength = new Map(state.memoryStrength || []);
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado da memória episódica
  saveEpisodicMemoryState() {
    const state = {
      memoryCapacity: this.memoryCapacity,
      episodicMemories: Array.from(this.episodicMemories.entries()),
      memoryCategories: Array.from(this.memoryCategories.entries()),
      memoryAssociations: Array.from(this.memoryAssociations.entries()),
      memoryTimeline: this.memoryTimeline.slice(-500),
      memoryStrength: Array.from(this.memoryStrength.entries()),
      lastUpdate: this.lastUpdate
    };
    saveState('episodicMemory', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      memoryCapacity: 1000,
      episodicMemories: [],
      memoryCategories: [],
      memoryAssociations: [],
      memoryTimeline: [],
      memoryStrength: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gerencia memória episódica
  processEpisodicMemory(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos episódicos
    const analysis = this.analyzeEpisodicElements(input, context);
    
    // Cria nova memória episódica
    const memory = this.createEpisodicMemory(analysis, context, timestamp);
    
    // Atualiza memórias existentes
    this.updateExistingMemories(analysis, context);
    
    // Registra no histórico
    this.recordEpisodicMemory(analysis, memory, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveEpisodicMemoryState();
    
    return {
      analysis,
      memory,
      totalMemories: this.episodicMemories.size,
      memoryTimeline: this.memoryTimeline.slice(-10)
    };
  }

  // Analisa elementos episódicos na entrada
  analyzeEpisodicElements(input, context) {
    const analysis = {
      hasEvent: false,
      hasExperience: false,
      hasNarrative: false,
      hasEmotionalContent: false,
      events: [],
      experiences: [],
      narratives: [],
      emotionalContent: [],
      memoryImportance: 0,
      memoryVividness: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta eventos
    const events = this.detectEvents(input, context);
    if (events.length > 0) {
      analysis.hasEvent = true;
      analysis.events = events;
    }
    
    // Detecta experiências
    const experiences = this.detectExperiences(input, context);
    if (experiences.length > 0) {
      analysis.hasExperience = true;
      analysis.experiences = experiences;
    }
    
    // Detecta narrativas
    const narratives = this.detectNarratives(input, context);
    if (narratives.length > 0) {
      analysis.hasNarrative = true;
      analysis.narratives = narratives;
    }
    
    // Detecta conteúdo emocional
    const emotionalContent = this.detectEmotionalContent(input, context);
    if (emotionalContent.length > 0) {
      analysis.hasEmotionalContent = true;
      analysis.emotionalContent = emotionalContent;
    }
    
    // Calcula importância da memória
    analysis.memoryImportance = this.calculateMemoryImportance(analysis, context);
    
    // Calcula vivacidade da memória
    analysis.memoryVividness = this.calculateMemoryVividness(analysis, context);
    
    return analysis;
  }

  // Detecta eventos
  detectEvents(input, context) {
    const events = [];
    const lowerInput = input.toLowerCase();
    
    const eventKeywords = {
      'aconteceu': ['aconteceu', 'ocorreu', 'passou', 'sucedeu'],
      'fiz': ['fiz', 'fizemos', 'fizeram', 'realizei'],
      'fui': ['fui', 'fomos', 'foram', 'estive'],
      'vi': ['vi', 'vimos', 'viram', 'presenciei'],
      'ouvi': ['ouvi', 'ouvimos', 'ouviram', 'escutei'],
      'senti': ['senti', 'sentimos', 'sentir', 'experimentei'],
      'pensei': ['pensei', 'pensamos', 'pensar', 'refleti']
    };
    
    for (const [type, keywords] of Object.entries(eventKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          events.push({
            type: type,
            keyword: keyword,
            category: 'event',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return events;
  }

  // Detecta experiências
  detectExperiences(input, context) {
    const experiences = [];
    const lowerInput = input.toLowerCase();
    
    const experienceKeywords = {
      'aprendi': ['aprendi', 'aprendemos', 'aprender', 'descobri'],
      'entendi': ['entendi', 'entendemos', 'entender', 'compreendi'],
      'descobri': ['descobri', 'descobrimos', 'descobrir', 'achei'],
      'experimentei': ['experimentei', 'experimentamos', 'experimentar', 'testei'],
      'vivi': ['vivi', 'vivemos', 'viver', 'experienciei'],
      'passei': ['passei', 'passamos', 'passar', 'tive']
    };
    
    for (const [type, keywords] of Object.entries(experienceKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          experiences.push({
            type: type,
            keyword: keyword,
            category: 'experience',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return experiences;
  }

  // Detecta narrativas
  detectNarratives(input, context) {
    const narratives = [];
    const lowerInput = input.toLowerCase();
    
    const narrativeKeywords = {
      'história': ['história', 'conto', 'narrativa', 'relato'],
      'lembro': ['lembro', 'lembramos', 'lembrar', 'recordo'],
      'era': ['era', 'eram', 'estava', 'estavam'],
      'quando': ['quando', 'enquanto', 'durante', 'no momento'],
      'então': ['então', 'depois', 'em seguida', 'logo após'],
      'finalmente': ['finalmente', 'por fim', 'no final', 'concluindo']
    };
    
    for (const [type, keywords] of Object.entries(narrativeKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          narratives.push({
            type: type,
            keyword: keyword,
            category: 'narrative',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return narratives;
  }

  // Detecta conteúdo emocional
  detectEmotionalContent(input, context) {
    const content = [];
    const lowerInput = input.toLowerCase();
    
    const emotionalKeywords = {
      'feliz': ['feliz', 'alegre', 'content', 'sorrindo'],
      'triste': ['triste', 'chorando', 'melancolia', 'saudade'],
      'medo': ['medo', 'assustado', 'pavor', 'terror'],
      'amor': ['amor', 'carinho', 'afeição', 'querer'],
      'raiva': ['raiva', 'bravo', 'irritado', 'furioso'],
      'surpresa': ['surpresa', 'uau', 'nossa', 'incrível']
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

  // Calcula importância da memória
  calculateMemoryImportance(analysis, context) {
    let importance = 0.1; // Base
    
    // Importância baseada em eventos
    if (analysis.hasEvent) {
      importance += analysis.events.length * 0.2;
    }
    
    // Importância baseada em experiências
    if (analysis.hasExperience) {
      importance += analysis.experiences.length * 0.3;
    }
    
    // Importância baseada em narrativas
    if (analysis.hasNarrative) {
      importance += analysis.narratives.length * 0.1;
    }
    
    // Importância baseada em conteúdo emocional
    if (analysis.hasEmotionalContent) {
      importance += analysis.emotionalContent.length * 0.2;
    }
    
    // Importância baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      importance += 0.3;
    }
    
    // Importância baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      importance += context.emotionalIntensity * 0.2;
    }
    
    return Math.min(1, importance);
  }

  // Calcula vivacidade da memória
  calculateMemoryVividness(analysis, context) {
    let vividness = 0.1; // Base
    
    // Vivacidade baseada em eventos
    if (analysis.hasEvent) {
      vividness += analysis.events.length * 0.15;
    }
    
    // Vivacidade baseada em experiências
    if (analysis.hasExperience) {
      vividness += analysis.experiences.length * 0.2;
    }
    
    // Vivacidade baseada em narrativas
    if (analysis.hasNarrative) {
      vividness += analysis.narratives.length * 0.1;
    }
    
    // Vivacidade baseada em conteúdo emocional
    if (analysis.hasEmotionalContent) {
      vividness += analysis.emotionalContent.length * 0.25;
    }
    
    // Vivacidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      vividness += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, vividness);
  }

  // Cria nova memória episódica
  createEpisodicMemory(analysis, context, timestamp) {
    const memoryId = this.generateMemoryId();
    
    const memory = {
      id: memoryId,
      content: analysis,
      context: context,
      timestamp: timestamp,
      importance: analysis.memoryImportance,
      vividness: analysis.memoryVividness,
      category: this.determineMemoryCategory(analysis),
      associations: [],
      strength: 1.0,
      accessCount: 0,
      lastAccessed: timestamp
    };
    
    // Adiciona à memória episódica
    this.episodicMemories.set(memoryId, memory);
    
    // Adiciona à linha do tempo
    this.memoryTimeline.push({
      id: memoryId,
      timestamp: timestamp,
      category: memory.category,
      importance: memory.importance
    });
    
    // Adiciona à categoria
    this.addToCategory(memory);
    
    // Cria associações
    this.createAssociations(memory);
    
    // Aplica limite de capacidade
    this.enforceMemoryLimit();
    
    return memory;
  }

  // Gera ID único para memória
  generateMemoryId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `episodic_${timestamp}_${random}`;
  }

  // Determina categoria da memória
  determineMemoryCategory(analysis) {
    if (analysis.hasEvent) return 'event';
    if (analysis.hasExperience) return 'experience';
    if (analysis.hasNarrative) return 'narrative';
    if (analysis.hasEmotionalContent) return 'emotional';
    return 'general';
  }

  // Adiciona memória à categoria
  addToCategory(memory) {
    const category = memory.category;
    
    if (!this.memoryCategories.has(category)) {
      this.memoryCategories.set(category, []);
    }
    
    this.memoryCategories.get(category).push(memory.id);
  }

  // Cria associações
  createAssociations(memory) {
    const associations = [];
    
    // Associações baseadas em palavras-chave
    const keywords = this.extractKeywords(memory.content);
    for (const keyword of keywords) {
      associations.push({
        type: 'keyword',
        value: keyword,
        strength: 0.5
      });
    }
    
    // Associações baseadas em contexto
    if (memory.context.userRole) {
      associations.push({
        type: 'user',
        value: memory.context.userRole,
        strength: 0.8
      });
    }
    
    // Associações baseadas em emoções
    if (memory.content.emotionalContent.length > 0) {
      for (const emotion of memory.content.emotionalContent) {
        associations.push({
          type: 'emotion',
          value: emotion.type,
          strength: 0.7
        });
      }
    }
    
    memory.associations = associations;
  }

  // Extrai palavras-chave
  extractKeywords(content) {
    const keywords = [];
    
    // Extrai palavras de eventos
    for (const event of content.events) {
      keywords.push(event.keyword);
    }
    
    // Extrai palavras de experiências
    for (const experience of content.experiences) {
      keywords.push(experience.keyword);
    }
    
    // Extrai palavras de narrativas
    for (const narrative of content.narratives) {
      keywords.push(narrative.keyword);
    }
    
    // Extrai palavras emocionais
    for (const emotion of content.emotionalContent) {
      keywords.push(emotion.keyword);
    }
    
    return keywords;
  }

  // Aplica limite de capacidade
  enforceMemoryLimit() {
    if (this.episodicMemories.size > this.memoryCapacity) {
      // Remove memórias mais antigas e menos importantes
      const memories = Array.from(this.episodicMemories.values());
      memories.sort((a, b) => {
        const scoreA = a.importance * a.strength * a.accessCount;
        const scoreB = b.importance * b.strength * b.accessCount;
        return scoreA - scoreB;
      });
      
      const toRemove = memories.slice(0, this.episodicMemories.size - this.memoryCapacity);
      for (const memory of toRemove) {
        this.episodicMemories.delete(memory.id);
        this.removeFromCategory(memory);
        this.removeFromTimeline(memory.id);
      }
    }
  }

  // Remove memória da categoria
  removeFromCategory(memory) {
    const category = memory.category;
    if (this.memoryCategories.has(category)) {
      const categoryMemories = this.memoryCategories.get(category);
      const index = categoryMemories.indexOf(memory.id);
      if (index > -1) {
        categoryMemories.splice(index, 1);
      }
    }
  }

  // Remove memória da linha do tempo
  removeFromTimeline(memoryId) {
    const index = this.memoryTimeline.findIndex(item => item.id === memoryId);
    if (index > -1) {
      this.memoryTimeline.splice(index, 1);
    }
  }

  // Atualiza memórias existentes
  updateExistingMemories(analysis, context) {
    // Atualiza força das memórias baseada na similaridade
    for (const [id, memory] of this.episodicMemories) {
      const similarity = this.calculateSimilarity(analysis, memory.content);
      if (similarity > 0.5) {
        memory.strength = Math.min(1, memory.strength + similarity * 0.1);
        memory.accessCount++;
        memory.lastAccessed = new Date().toISOString();
      }
    }
  }

  // Calcula similaridade entre análises
  calculateSimilarity(analysis1, analysis2) {
    let similarity = 0;
    
    // Similaridade baseada em eventos
    const events1 = analysis1.events.map(e => e.keyword);
    const events2 = analysis2.events.map(e => e.keyword);
    const commonEvents = events1.filter(e => events2.includes(e));
    similarity += commonEvents.length / Math.max(1, Math.max(events1.length, events2.length)) * 0.3;
    
    // Similaridade baseada em experiências
    const experiences1 = analysis1.experiences.map(e => e.keyword);
    const experiences2 = analysis2.experiences.map(e => e.keyword);
    const commonExperiences = experiences1.filter(e => experiences2.includes(e));
    similarity += commonExperiences.length / Math.max(1, Math.max(experiences1.length, experiences2.length)) * 0.3;
    
    // Similaridade baseada em conteúdo emocional
    const emotions1 = analysis1.emotionalContent.map(e => e.type);
    const emotions2 = analysis2.emotionalContent.map(e => e.type);
    const commonEmotions = emotions1.filter(e => emotions2.includes(e));
    similarity += commonEmotions.length / Math.max(1, Math.max(emotions1.length, emotions2.length)) * 0.4;
    
    return Math.min(1, similarity);
  }

  // Registra memória episódica
  recordEpisodicMemory(analysis, memory, timestamp) {
    const record = {
      timestamp,
      analysis,
      memory,
      totalMemories: this.episodicMemories.size,
      memoryCategories: this.memoryCategories.size
    };
    
    // Mantém histórico limitado
    if (this.memoryTimeline.length > 1000) {
      this.memoryTimeline = this.memoryTimeline.slice(-1000);
    }
  }

  // Obtém estatísticas da memória episódica
  getEpisodicMemoryStats() {
    const stats = {
      totalMemories: this.episodicMemories.size,
      memoryCategories: this.memoryCategories.size,
      memoryTimeline: this.memoryTimeline.length,
      recentMemories: this.memoryTimeline.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de memória episódica
  resetEpisodicMemorySystem() {
    this.episodicMemories.clear();
    this.memoryCategories.clear();
    this.memoryAssociations.clear();
    this.memoryTimeline = [];
    this.memoryStrength.clear();
    this.lastUpdate = new Date().toISOString();
  }
}

export default EpisodicMemorySystem;
