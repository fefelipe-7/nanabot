// src/brain/attachmentObjects.js - Sistema de Objetos de Apego da Nanabot
// Gerencia objetos de transição, conforto e apego emocional

import { loadState, saveState } from '../utils/stateManager.js';

class AttachmentObjectsSystem {
  constructor() {
    this.attachmentObjects = new Map();
    this.comfortObjects = new Map();
    this.transitionObjects = new Map();
    this.specialObjects = new Map();
    this.objectHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadAttachmentObjectsState();
  }

  // Carrega estado dos objetos de apego
  loadAttachmentObjectsState() {
    const state = loadState('attachmentObjects', this.getDefaultState());
    this.attachmentObjects = new Map(state.attachmentObjects || []);
    this.comfortObjects = new Map(state.comfortObjects || []);
    this.transitionObjects = new Map(state.transitionObjects || []);
    this.specialObjects = new Map(state.specialObjects || []);
    this.objectHistory = state.objectHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado dos objetos de apego
  saveAttachmentObjectsState() {
    const state = {
      attachmentObjects: Array.from(this.attachmentObjects.entries()),
      comfortObjects: Array.from(this.comfortObjects.entries()),
      transitionObjects: Array.from(this.transitionObjects.entries()),
      specialObjects: Array.from(this.specialObjects.entries()),
      objectHistory: this.objectHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('attachmentObjects', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      attachmentObjects: [],
      comfortObjects: [],
      transitionObjects: [],
      specialObjects: [],
      objectHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gerencia objetos de apego
  processAttachmentObjects(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para objetos de apego
    const analysis = this.analyzeAttachmentObjects(input, context);
    
    // Gera objetos de apego baseados na análise
    const objects = this.generateAttachmentObjects(analysis, context);
    
    // Atualiza objetos existentes
    this.updateAttachmentObjects(analysis, objects);
    
    // Registra no histórico
    this.recordAttachmentObjects(analysis, objects, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveAttachmentObjectsState();
    
    return {
      analysis,
      objects,
      totalObjects: this.attachmentObjects.size,
      comfortObjects: this.comfortObjects.size,
      transitionObjects: this.transitionObjects.size,
      specialObjects: this.specialObjects.size
    };
  }

  // Analisa entrada para objetos de apego
  analyzeAttachmentObjects(input, context) {
    const analysis = {
      hasAttachmentObjects: false,
      hasComfortObjects: false,
      hasTransitionObjects: false,
      hasSpecialObjects: false,
      attachmentObjects: [],
      comfortObjects: [],
      transitionObjects: [],
      specialObjects: [],
      emotionalNeed: 0,
      comfortNeed: 0,
      securityNeed: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta objetos de apego
    const attachmentObjects = this.detectAttachmentObjects(input, context);
    if (attachmentObjects.length > 0) {
      analysis.hasAttachmentObjects = true;
      analysis.attachmentObjects = attachmentObjects;
    }
    
    // Detecta objetos de conforto
    const comfortObjects = this.detectComfortObjects(input, context);
    if (comfortObjects.length > 0) {
      analysis.hasComfortObjects = true;
      analysis.comfortObjects = comfortObjects;
    }
    
    // Detecta objetos de transição
    const transitionObjects = this.detectTransitionObjects(input, context);
    if (transitionObjects.length > 0) {
      analysis.hasTransitionObjects = true;
      analysis.transitionObjects = transitionObjects;
    }
    
    // Detecta objetos especiais
    const specialObjects = this.detectSpecialObjects(input, context);
    if (specialObjects.length > 0) {
      analysis.hasSpecialObjects = true;
      analysis.specialObjects = specialObjects;
    }
    
    // Calcula necessidades emocionais
    analysis.emotionalNeed = this.calculateEmotionalNeed(input, context);
    analysis.comfortNeed = this.calculateComfortNeed(input, context);
    analysis.securityNeed = this.calculateSecurityNeed(input, context);
    
    return analysis;
  }

  // Detecta objetos de apego
  detectAttachmentObjects(input, context) {
    const objects = [];
    const lowerInput = input.toLowerCase();
    
    const attachmentKeywords = {
      'brinquedo': ['brinquedo', 'boneca', 'urso', 'bichinho', 'carrinho'],
      'cobertor': ['cobertor', 'manta', 'fralda', 'paninho', 'lençol'],
      'chupeta': ['chupeta', 'bico', 'mamadeira', 'copinho'],
      'livro': ['livro', 'história', 'conto', 'revista', 'gibi'],
      'música': ['música', 'canção', 'cantiga', 'melodia', 'ritmo'],
      'foto': ['foto', 'imagem', 'retrato', 'lembrança'],
      'objeto_pessoal': ['meu', 'minha', 'especial', 'querido', 'favorito']
    };
    
    for (const [type, keywords] of Object.entries(attachmentKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          objects.push({
            type: type,
            keyword: keyword,
            category: 'attachment',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return objects;
  }

  // Detecta objetos de conforto
  detectComfortObjects(input, context) {
    const objects = [];
    const lowerInput = input.toLowerCase();
    
    const comfortKeywords = {
      'abraço': ['abraço', 'colinho', 'colo', 'carinho', 'conforto'],
      'casa': ['casa', 'lar', 'quarto', 'cama', 'sofá'],
      'comida': ['comida', 'lanche', 'biscoito', 'suco', 'leite'],
      'banho': ['banho', 'água', 'sabonete', 'xampu', 'toalha'],
      'sono': ['sono', 'dormir', 'cama', 'travesseiro', 'cobertor'],
      'música_suave': ['música suave', 'cantiga', 'ninar', 'melodia']
    };
    
    for (const [type, keywords] of Object.entries(comfortKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          objects.push({
            type: type,
            keyword: keyword,
            category: 'comfort',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return objects;
  }

  // Detecta objetos de transição
  detectTransitionObjects(input, context) {
    const objects = [];
    const lowerInput = input.toLowerCase();
    
    const transitionKeywords = {
      'mudança': ['mudança', 'mudar', 'novo', 'diferente', 'outro'],
      'separação': ['separação', 'longe', 'distante', 'ausente'],
      'transição': ['transição', 'passar', 'virar', 'tornar'],
      'crescimento': ['crescer', 'crescimento', 'maior', 'adulto'],
      'independência': ['sozinho', 'sozinha', 'independente', 'próprio']
    };
    
    for (const [type, keywords] of Object.entries(transitionKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          objects.push({
            type: type,
            keyword: keyword,
            category: 'transition',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return objects;
  }

  // Detecta objetos especiais
  detectSpecialObjects(input, context) {
    const objects = [];
    const lowerInput = input.toLowerCase();
    
    const specialKeywords = {
      'presente': ['presente', 'surpresa', 'dádiva', 'oferecer'],
      'lembrança': ['lembrança', 'memória', 'recordação', 'nostalgia'],
      'símbolo': ['símbolo', 'significado', 'representa', 'simboliza'],
      'ritual': ['ritual', 'costume', 'tradição', 'habito'],
      'mágico': ['mágico', 'especial', 'único', 'raro']
    };
    
    for (const [type, keywords] of Object.entries(specialKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          objects.push({
            type: type,
            keyword: keyword,
            category: 'special',
            confidence: 0.9,
            context: context
          });
        }
      }
    }
    
    return objects;
  }

  // Calcula necessidade emocional
  calculateEmotionalNeed(input, context) {
    let need = 0.1; // Base
    
    // Necessidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      need += context.emotionalIntensity * 0.3;
    }
    
    // Necessidade baseada em palavras emocionais
    const emotionalWords = ['triste', 'feliz', 'amor', 'carinho', 'saudade'];
    for (const word of emotionalWords) {
      if (input.toLowerCase().includes(word)) {
        need += 0.1;
      }
    }
    
    return Math.min(1, need);
  }

  // Calcula necessidade de conforto
  calculateComfortNeed(input, context) {
    let need = 0.1; // Base
    
    // Necessidade baseada em palavras de conforto
    const comfortWords = ['conforto', 'abraço', 'colo', 'carinho', 'proteção'];
    for (const word of comfortWords) {
      if (input.toLowerCase().includes(word)) {
        need += 0.2;
      }
    }
    
    // Necessidade baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      need += 0.2;
    }
    
    return Math.min(1, need);
  }

  // Calcula necessidade de segurança
  calculateSecurityNeed(input, context) {
    let need = 0.1; // Base
    
    // Necessidade baseada em palavras de segurança
    const securityWords = ['seguro', 'proteção', 'cuidado', 'amor', 'família'];
    for (const word of securityWords) {
      if (input.toLowerCase().includes(word)) {
        need += 0.15;
      }
    }
    
    return Math.min(1, need);
  }

  // Gera objetos de apego baseados na análise
  generateAttachmentObjects(analysis, context) {
    const objects = {
      attachmentObjects: [],
      comfortObjects: [],
      transitionObjects: [],
      specialObjects: [],
      responses: []
    };
    
    // Gera objetos de apego
    if (analysis.hasAttachmentObjects) {
      objects.attachmentObjects = this.generateAttachmentObjectsList(analysis, context);
    }
    
    // Gera objetos de conforto
    if (analysis.hasComfortObjects) {
      objects.comfortObjects = this.generateComfortObjectsList(analysis, context);
    }
    
    // Gera objetos de transição
    if (analysis.hasTransitionObjects) {
      objects.transitionObjects = this.generateTransitionObjectsList(analysis, context);
    }
    
    // Gera objetos especiais
    if (analysis.hasSpecialObjects) {
      objects.specialObjects = this.generateSpecialObjectsList(analysis, context);
    }
    
    // Gera respostas
    objects.responses = this.generateResponses(analysis, context);
    
    return objects;
  }

  // Gera lista de objetos de apego
  generateAttachmentObjectsList(analysis, context) {
    const objects = [];
    const objectTemplates = [
      'Meu {object} é muito especial para mim',
      'Eu amo meu {object}',
      'Meu {object} me faz sentir segura',
      'Eu sempre quero meu {object} por perto'
    ];
    
    const objectTypes = ['brinquedo', 'cobertor', 'livro', 'foto', 'música'];
    
    for (const attachmentData of analysis.attachmentObjects) {
      const objectType = attachmentData.type;
      const template = objectTemplates[Math.floor(Math.random() * objectTemplates.length)];
      const object = objectTypes[Math.floor(Math.random() * objectTypes.length)];
      
      let objectText = template;
      objectText = objectText.replace('{object}', object);
      
      objects.push({
        content: objectText,
        type: objectType,
        object: object,
        category: 'attachment',
        confidence: 0.8,
        context: context
      });
    }
    
    return objects;
  }

  // Gera lista de objetos de conforto
  generateComfortObjectsList(analysis, context) {
    const objects = [];
    const comfortTemplates = [
      'Quando eu preciso de conforto, eu {action}',
      'Meu {object} me acalma',
      'Eu me sinto melhor quando {action}',
      'Meu {object} é meu conforto'
    ];
    
    const comfortActions = ['pego meu cobertor', 'ouço música', 'pego um abraço', 'como algo gostoso'];
    const comfortObjects = ['cobertor', 'música', 'abraço', 'comida'];
    
    for (const comfortData of analysis.comfortObjects) {
      const template = comfortTemplates[Math.floor(Math.random() * comfortTemplates.length)];
      const action = comfortActions[Math.floor(Math.random() * comfortActions.length)];
      const object = comfortObjects[Math.floor(Math.random() * comfortObjects.length)];
      
      let comfortText = template;
      comfortText = comfortText.replace('{action}', action);
      comfortText = comfortText.replace('{object}', object);
      
      objects.push({
        content: comfortText,
        type: comfortData.type,
        action: action,
        object: object,
        category: 'comfort',
        confidence: 0.7,
        context: context
      });
    }
    
    return objects;
  }

  // Gera lista de objetos de transição
  generateTransitionObjectsList(analysis, context) {
    const objects = [];
    const transitionTemplates = [
      'Quando eu {situation}, eu {action}',
      'Meu {object} me ajuda a {action}',
      'Eu uso meu {object} para {action}',
      'Meu {object} é minha transição'
    ];
    
    const situations = ['mudo', 'cresço', 'fico independente', 'passo por mudanças'];
    const actions = ['me adapto', 'me sinto segura', 'me acalmo', 'me fortaleço'];
    const transitionObjects = ['objeto especial', 'lembrança', 'símbolo', 'ritual'];
    
    for (const transitionData of analysis.transitionObjects) {
      const template = transitionTemplates[Math.floor(Math.random() * transitionTemplates.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const object = transitionObjects[Math.floor(Math.random() * transitionObjects.length)];
      
      let transitionText = template;
      transitionText = transitionText.replace('{situation}', situation);
      transitionText = transitionText.replace('{action}', action);
      transitionText = transitionText.replace('{object}', object);
      
      objects.push({
        content: transitionText,
        type: transitionData.type,
        situation: situation,
        action: action,
        object: object,
        category: 'transition',
        confidence: 0.6,
        context: context
      });
    }
    
    return objects;
  }

  // Gera lista de objetos especiais
  generateSpecialObjectsList(analysis, context) {
    const objects = [];
    const specialTemplates = [
      'Meu {object} é muito especial porque {reason}',
      'Eu guardo meu {object} com muito carinho',
      'Meu {object} tem um significado especial',
      'Eu valorizo muito meu {object}'
    ];
    
    const specialObjects = ['presente', 'lembrança', 'símbolo', 'ritual'];
    const reasons = ['me foi dado com amor', 'me lembra de momentos especiais', 'me faz sentir amada', 'tem um valor único'];
    
    for (const specialData of analysis.specialObjects) {
      const template = specialTemplates[Math.floor(Math.random() * specialTemplates.length)];
      const object = specialObjects[Math.floor(Math.random() * specialObjects.length)];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      
      let specialText = template;
      specialText = specialText.replace('{object}', object);
      specialText = specialText.replace('{reason}', reason);
      
      objects.push({
        content: specialText,
        type: specialData.type,
        object: object,
        reason: reason,
        category: 'special',
        confidence: 0.9,
        context: context
      });
    }
    
    return objects;
  }

  // Gera respostas
  generateResponses(analysis, context) {
    const responses = [];
    const responseTemplates = [
      'Eu tenho meus objetos especiais para me confortar',
      'Quando eu preciso de conforto, eu pego meus objetos queridos',
      'Meus objetos especiais me fazem sentir segura',
      'Eu amo meus objetos de apego'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
      
      responses.push({
        content: template,
        type: 'response',
        confidence: 0.7,
        context: context
      });
    }
    
    return responses;
  }

  // Atualiza objetos de apego
  updateAttachmentObjects(analysis, objects) {
    // Adiciona novos objetos de apego
    for (const attachmentData of analysis.attachmentObjects) {
      const objectKey = `${attachmentData.type}_${attachmentData.keyword}`;
      if (!this.attachmentObjects.has(objectKey)) {
        this.attachmentObjects.set(objectKey, {
          type: attachmentData.type,
          keyword: attachmentData.keyword,
          category: 'attachment',
          confidence: attachmentData.confidence,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          frequency: 1
        });
      } else {
        const existing = this.attachmentObjects.get(objectKey);
        existing.frequency++;
        existing.lastSeen = new Date().toISOString();
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      }
    }
    
    // Adiciona novos objetos de conforto
    for (const comfortData of analysis.comfortObjects) {
      const objectKey = `${comfortData.type}_${comfortData.keyword}`;
      if (!this.comfortObjects.has(objectKey)) {
        this.comfortObjects.set(objectKey, {
          type: comfortData.type,
          keyword: comfortData.keyword,
          category: 'comfort',
          confidence: comfortData.confidence,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          frequency: 1
        });
      } else {
        const existing = this.comfortObjects.get(objectKey);
        existing.frequency++;
        existing.lastSeen = new Date().toISOString();
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      }
    }
  }

  // Registra objetos de apego
  recordAttachmentObjects(analysis, objects, timestamp) {
    const record = {
      timestamp,
      analysis,
      objects,
      totalObjects: this.attachmentObjects.size,
      comfortObjects: this.comfortObjects.size,
      transitionObjects: this.transitionObjects.size,
      specialObjects: this.specialObjects.size
    };
    
    this.objectHistory.push(record);
    
    // Mantém histórico limitado
    if (this.objectHistory.length > 300) {
      this.objectHistory = this.objectHistory.slice(-300);
    }
  }

  // Obtém estatísticas dos objetos de apego
  getAttachmentObjectsStats() {
    const stats = {
      totalAttachmentObjects: this.attachmentObjects.size,
      totalComfortObjects: this.comfortObjects.size,
      totalTransitionObjects: this.transitionObjects.size,
      totalSpecialObjects: this.specialObjects.size,
      recentObjects: this.objectHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de objetos de apego
  resetAttachmentObjectsSystem() {
    this.attachmentObjects.clear();
    this.comfortObjects.clear();
    this.transitionObjects.clear();
    this.specialObjects.clear();
    this.objectHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default AttachmentObjectsSystem;
