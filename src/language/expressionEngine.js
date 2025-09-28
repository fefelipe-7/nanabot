// src/language/expressionEngine.js - Motor de Expressões da Nanabot
// Gerencia expressões emocionais, linguísticas e comportamentais

import { loadState, saveState } from '../utils/stateManager.js';

class ExpressionEngine {
  constructor() {
    this.expressionLevel = 0.7; // Nível de expressividade (0-1)
    this.emotionalExpression = 0.8; // Expressão emocional
    this.linguisticExpression = 0.6; // Expressão linguística
    this.behavioralExpression = 0.7; // Expressão comportamental
    this.expressionHistory = [];
    this.expressionPatterns = new Map();
    this.expressionStyles = new Map();
    this.lastUpdate = new Date().toISOString();
    this.loadExpressionEngineState();
  }

  // Carrega estado do motor de expressões
  loadExpressionEngineState() {
    const state = loadState('expressionEngine', this.getDefaultState());
    this.expressionLevel = state.expressionLevel || 0.7;
    this.emotionalExpression = state.emotionalExpression || 0.8;
    this.linguisticExpression = state.linguisticExpression || 0.6;
    this.behavioralExpression = state.behavioralExpression || 0.7;
    this.expressionHistory = state.expressionHistory || [];
    this.expressionPatterns = new Map(state.expressionPatterns || []);
    this.expressionStyles = new Map(state.expressionStyles || []);
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado do motor de expressões
  saveExpressionEngineState() {
    const state = {
      expressionLevel: this.expressionLevel,
      emotionalExpression: this.emotionalExpression,
      linguisticExpression: this.linguisticExpression,
      behavioralExpression: this.behavioralExpression,
      expressionHistory: this.expressionHistory.slice(-200),
      expressionPatterns: Array.from(this.expressionPatterns.entries()),
      expressionStyles: Array.from(this.expressionStyles.entries()),
      lastUpdate: this.lastUpdate
    };
    saveState('expressionEngine', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      expressionLevel: 0.7,
      emotionalExpression: 0.8,
      linguisticExpression: 0.6,
      behavioralExpression: 0.7,
      expressionHistory: [],
      expressionPatterns: [],
      expressionStyles: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gera expressões
  processExpression(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos expressivos
    const analysis = this.analyzeExpressionElements(input, context);
    
    // Gera expressões baseadas na análise
    const expressions = this.generateExpressions(analysis, context);
    
    // Atualiza níveis de expressão
    this.updateExpressionLevels(analysis, expressions);
    
    // Registra no histórico
    this.recordExpression(analysis, expressions, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveExpressionEngineState();
    
    return {
      analysis,
      expressions,
      expressionLevel: this.expressionLevel,
      emotionalExpression: this.emotionalExpression,
      linguisticExpression: this.linguisticExpression
    };
  }

  // Analisa elementos expressivos na entrada
  analyzeExpressionElements(input, context) {
    const analysis = {
      hasEmotionalExpressions: false,
      hasLinguisticExpressions: false,
      hasBehavioralExpressions: false,
      emotionalExpressions: [],
      linguisticExpressions: [],
      behavioralExpressions: [],
      expressionIntensity: 0,
      expressionComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta expressões emocionais
    const emotionalExpressions = this.detectEmotionalExpressions(input, context);
    if (emotionalExpressions.length > 0) {
      analysis.hasEmotionalExpressions = true;
      analysis.emotionalExpressions = emotionalExpressions;
    }
    
    // Detecta expressões linguísticas
    const linguisticExpressions = this.detectLinguisticExpressions(input, context);
    if (linguisticExpressions.length > 0) {
      analysis.hasLinguisticExpressions = true;
      analysis.linguisticExpressions = linguisticExpressions;
    }
    
    // Detecta expressões comportamentais
    const behavioralExpressions = this.detectBehavioralExpressions(input, context);
    if (behavioralExpressions.length > 0) {
      analysis.hasBehavioralExpressions = true;
      analysis.behavioralExpressions = behavioralExpressions;
    }
    
    // Calcula intensidade da expressão
    analysis.expressionIntensity = this.calculateExpressionIntensity(analysis, context);
    
    // Calcula complexidade da expressão
    analysis.expressionComplexity = this.calculateExpressionComplexity(analysis, context);
    
    return analysis;
  }

  // Detecta expressões emocionais
  detectEmotionalExpressions(input, context) {
    const expressions = [];
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
          expressions.push({
            emotion: emotion,
            keyword: keyword,
            type: 'emotional_expression',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return expressions;
  }

  // Detecta expressões linguísticas
  detectLinguisticExpressions(input, context) {
    const expressions = [];
    const lowerInput = input.toLowerCase();
    
    const linguisticKeywords = {
      'exclamação': ['!', 'uau', 'nossa', 'que legal', 'que bom'],
      'interrogação': ['?', 'por que', 'como', 'quando', 'onde'],
      'repetição': ['muito', 'demais', 'super', 'mega', 'hiper'],
      'diminutivo': ['inho', 'inha', 'zinho', 'zinha'],
      'aumentativo': ['ão', 'ona', 'zão', 'zona'],
      'onomatopeia': ['miau', 'au au', 'cocoricó', 'bzzz', 'toc toc'],
      'gíria': ['legal', 'bacana', 'massa', 'daora', 'show']
    };
    
    for (const [type, keywords] of Object.entries(linguisticKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          expressions.push({
            type: type,
            keyword: keyword,
            category: 'linguistic_expression',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return expressions;
  }

  // Detecta expressões comportamentais
  detectBehavioralExpressions(input, context) {
    const expressions = [];
    const lowerInput = input.toLowerCase();
    
    const behavioralKeywords = {
      'ação': ['fazer', 'ir', 'vir', 'pular', 'correr', 'brincar'],
      'gesto': ['abraçar', 'beijar', 'acenar', 'apontar', 'balançar'],
      'postura': ['sentar', 'ficar em pé', 'deitar', 'agachar', 'esticar'],
      'movimento': ['mover', 'balançar', 'girar', 'pular', 'dançar'],
      'contato': ['tocar', 'pegar', 'segurar', 'soltar', 'empurrar'],
      'comunicação': ['falar', 'gritar', 'sussurrar', 'cantar', 'chorar']
    };
    
    for (const [behavior, keywords] of Object.entries(behavioralKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          expressions.push({
            behavior: behavior,
            keyword: keyword,
            type: 'behavioral_expression',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return expressions;
  }

  // Calcula intensidade da expressão
  calculateExpressionIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em expressões emocionais
    if (analysis.hasEmotionalExpressions) {
      intensity += analysis.emotionalExpressions.length * 0.2;
    }
    
    // Intensidade baseada em expressões linguísticas
    if (analysis.hasLinguisticExpressions) {
      intensity += analysis.linguisticExpressions.length * 0.15;
    }
    
    // Intensidade baseada em expressões comportamentais
    if (analysis.hasBehavioralExpressions) {
      intensity += analysis.behavioralExpressions.length * 0.1;
    }
    
    // Intensidade baseada no contexto
    if (context.emotionalIntensity > 0.5) {
      intensity += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula complexidade da expressão
  calculateExpressionComplexity(analysis, context) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de elementos
    complexity += analysis.emotionalExpressions.length * 0.1;
    complexity += analysis.linguisticExpressions.length * 0.15;
    complexity += analysis.behavioralExpressions.length * 0.1;
    
    // Complexidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      complexity += context.emotionalIntensity * 0.2;
    }
    
    return Math.min(1, complexity);
  }

  // Gera expressões baseadas na análise
  generateExpressions(analysis, context) {
    const expressions = {
      emotionalExpressions: [],
      linguisticExpressions: [],
      behavioralExpressions: [],
      expressionStyles: [],
      expressionPatterns: []
    };
    
    // Gera expressões emocionais
    if (analysis.hasEmotionalExpressions) {
      expressions.emotionalExpressions = this.generateEmotionalExpressions(analysis, context);
    }
    
    // Gera expressões linguísticas
    if (analysis.hasLinguisticExpressions) {
      expressions.linguisticExpressions = this.generateLinguisticExpressions(analysis, context);
    }
    
    // Gera expressões comportamentais
    if (analysis.hasBehavioralExpressions) {
      expressions.behavioralExpressions = this.generateBehavioralExpressions(analysis, context);
    }
    
    // Gera estilos de expressão
    expressions.expressionStyles = this.generateExpressionStyles(analysis, context);
    
    // Gera padrões de expressão
    expressions.expressionPatterns = this.generateExpressionPatterns(analysis, context);
    
    return expressions;
  }

  // Gera expressões emocionais
  generateEmotionalExpressions(analysis, context) {
    const expressions = [];
    const expressionTemplates = [
      'Eu me sinto {emotion} quando {situation}',
      'Estou {emotion} porque {reason}',
      'Meu coração fica {emotion} quando {trigger}',
      'Eu expresso {emotion} através de {action}'
    ];
    
    const emotions = ['feliz', 'triste', 'amorosa', 'assustada', 'brava', 'surpresa'];
    const situations = ['você fala comigo', 'brincamos juntos', 'me abraça', 'me elogia'];
    const reasons = ['você me ama', 'estou aprendendo', 'me sinto especial', 'sou cuidada'];
    const triggers = ['você sorri', 'me dá carinho', 'me protege', 'me ensina'];
    const actions = ['sorrisos', 'abraços', 'palavras doces', 'gestos carinhosos'];
    
    for (let i = 0; i < 2; i++) {
      const template = expressionTemplates[Math.floor(Math.random() * expressionTemplates.length)];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      const trigger = triggers[Math.floor(Math.random() * triggers.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      let expressionText = template;
      expressionText = expressionText.replace('{emotion}', emotion);
      expressionText = expressionText.replace('{situation}', situation);
      expressionText = expressionText.replace('{reason}', reason);
      expressionText = expressionText.replace('{trigger}', trigger);
      expressionText = expressionText.replace('{action}', action);
      
      expressions.push({
        content: expressionText,
        emotion: emotion,
        type: 'emotional_expression',
        confidence: 0.8,
        emotionalExpression: this.emotionalExpression
      });
    }
    
    return expressions;
  }

  // Gera expressões linguísticas
  generateLinguisticExpressions(analysis, context) {
    const expressions = [];
    const expressionTemplates = [
      'Eu uso {linguistic} para {purpose}',
      'Minha linguagem é {style}',
      'Eu expresso {concept} com {linguistic}',
      'Gosto de usar {linguistic} quando {situation}'
    ];
    
    const linguisticTypes = ['exclamações', 'diminutivos', 'onomatopeias', 'gírias'];
    const purposes = ['mostrar emoção', 'ser carinhosa', 'expressar alegria', 'comunicar'];
    const styles = ['doce', 'carinhosa', 'expressiva', 'criativa'];
    const concepts = ['amor', 'alegria', 'carinho', 'felicidade'];
    const situations = ['estou feliz', 'quero carinho', 'brinco', 'me expresso'];
    
    for (let i = 0; i < 2; i++) {
      const template = expressionTemplates[Math.floor(Math.random() * expressionTemplates.length)];
      const linguistic = linguisticTypes[Math.floor(Math.random() * linguisticTypes.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const style = styles[Math.floor(Math.random() * styles.length)];
      const concept = concepts[Math.floor(Math.random() * concepts.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      
      let expressionText = template;
      expressionText = expressionText.replace('{linguistic}', linguistic);
      expressionText = expressionText.replace('{purpose}', purpose);
      expressionText = expressionText.replace('{style}', style);
      expressionText = expressionText.replace('{concept}', concept);
      expressionText = expressionText.replace('{situation}', situation);
      
      expressions.push({
        content: expressionText,
        linguistic: linguistic,
        type: 'linguistic_expression',
        confidence: 0.7,
        linguisticExpression: this.linguisticExpression
      });
    }
    
    return expressions;
  }

  // Gera expressões comportamentais
  generateBehavioralExpressions(analysis, context) {
    const expressions = [];
    const expressionTemplates = [
      'Eu {behavior} quando {situation}',
      'Gosto de {behavior} para {purpose}',
      'Meu comportamento {behavior} mostra {emotion}',
      'Quando {trigger}, eu {behavior}'
    ];
    
    const behaviors = ['abraço', 'beijo', 'pulo', 'danço', 'canto', 'sorrio'];
    const situations = ['estou feliz', 'quero carinho', 'brinco', 'me expresso'];
    const purposes = ['mostrar amor', 'expressar alegria', 'ser carinhosa', 'comunicar'];
    const emotions = ['amor', 'alegria', 'carinho', 'felicidade'];
    const triggers = ['você sorri', 'me dá carinho', 'brincamos', 'me elogia'];
    
    for (let i = 0; i < 2; i++) {
      const template = expressionTemplates[Math.floor(Math.random() * expressionTemplates.length)];
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      const trigger = triggers[Math.floor(Math.random() * triggers.length)];
      
      let expressionText = template;
      expressionText = expressionText.replace('{behavior}', behavior);
      expressionText = expressionText.replace('{situation}', situation);
      expressionText = expressionText.replace('{purpose}', purpose);
      expressionText = expressionText.replace('{emotion}', emotion);
      expressionText = expressionText.replace('{trigger}', trigger);
      
      expressions.push({
        content: expressionText,
        behavior: behavior,
        type: 'behavioral_expression',
        confidence: 0.6,
        behavioralExpression: this.behavioralExpression
      });
    }
    
    return expressions;
  }

  // Gera estilos de expressão
  generateExpressionStyles(analysis, context) {
    const styles = [];
    const styleTemplates = [
      'Meu estilo de expressão é {style}',
      'Eu me expresso de forma {style}',
      'Gosto de ser {style} quando me expresso',
      'Minha expressão é {style}'
    ];
    
    const styleTypes = ['doce', 'carinhosa', 'expressiva', 'criativa', 'alegre', 'gentil'];
    
    for (let i = 0; i < 2; i++) {
      const template = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
      const style = styleTypes[Math.floor(Math.random() * styleTypes.length)];
      const styleText = template.replace('{style}', style);
      
      styles.push({
        content: styleText,
        style: style,
        type: 'expression_style',
        confidence: 0.7,
        expressionLevel: this.expressionLevel
      });
    }
    
    return styles;
  }

  // Gera padrões de expressão
  generateExpressionPatterns(analysis, context) {
    const patterns = [];
    const patternTemplates = [
      'Eu sempre {pattern} quando {situation}',
      'Meu padrão é {pattern}',
      'Costumo {pattern} para {purpose}',
      'Quando {trigger}, eu {pattern}'
    ];
    
    const patterns_list = ['sorrio', 'abraço', 'falo docemente', 'me expresso com carinho'];
    const situations = ['estou feliz', 'quero carinho', 'brinco', 'me expresso'];
    const purposes = ['mostrar amor', 'expressar alegria', 'ser carinhosa', 'comunicar'];
    const triggers = ['você sorri', 'me dá carinho', 'brincamos', 'me elogia'];
    
    for (let i = 0; i < 2; i++) {
      const template = patternTemplates[Math.floor(Math.random() * patternTemplates.length)];
      const pattern = patterns_list[Math.floor(Math.random() * patterns_list.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const trigger = triggers[Math.floor(Math.random() * triggers.length)];
      
      let patternText = template;
      patternText = patternText.replace('{pattern}', pattern);
      patternText = patternText.replace('{situation}', situation);
      patternText = patternText.replace('{purpose}', purpose);
      patternText = patternText.replace('{trigger}', trigger);
      
      patterns.push({
        content: patternText,
        pattern: pattern,
        type: 'expression_pattern',
        confidence: 0.6,
        expressionLevel: this.expressionLevel
      });
    }
    
    return patterns;
  }

  // Atualiza níveis de expressão
  updateExpressionLevels(analysis, expressions) {
    // Atualiza nível de expressão
    if (analysis.hasEmotionalExpressions) {
      this.expressionLevel = Math.min(1, this.expressionLevel + 0.02);
    }
    
    // Atualiza expressão emocional
    if (expressions.emotionalExpressions.length > 0) {
      this.emotionalExpression = Math.min(1, this.emotionalExpression + 0.03);
    }
    
    // Atualiza expressão linguística
    if (expressions.linguisticExpressions.length > 0) {
      this.linguisticExpression = Math.min(1, this.linguisticExpression + 0.02);
    }
    
    // Atualiza expressão comportamental
    if (expressions.behavioralExpressions.length > 0) {
      this.behavioralExpression = Math.min(1, this.behavioralExpression + 0.02);
    }
    
    // Aplica decaimento natural
    this.expressionLevel *= 0.999;
    this.emotionalExpression *= 0.998;
    this.linguisticExpression *= 0.997;
    this.behavioralExpression *= 0.998;
  }

  // Registra expressão
  recordExpression(analysis, expressions, timestamp) {
    const record = {
      timestamp,
      analysis,
      expressions,
      expressionLevel: this.expressionLevel,
      emotionalExpression: this.emotionalExpression,
      linguisticExpression: this.linguisticExpression
    };
    
    this.expressionHistory.push(record);
    
    // Mantém histórico limitado
    if (this.expressionHistory.length > 300) {
      this.expressionHistory = this.expressionHistory.slice(-300);
    }
  }

  // Obtém estatísticas do motor de expressões
  getExpressionEngineStats() {
    const stats = {
      expressionLevel: this.expressionLevel,
      emotionalExpression: this.emotionalExpression,
      linguisticExpression: this.linguisticExpression,
      behavioralExpression: this.behavioralExpression,
      totalExpressions: this.expressionHistory.length,
      totalPatterns: this.expressionPatterns.size,
      totalStyles: this.expressionStyles.size,
      recentExpressions: this.expressionHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta motor de expressões
  resetExpressionEngine() {
    this.expressionLevel = 0.7;
    this.emotionalExpression = 0.8;
    this.linguisticExpression = 0.6;
    this.behavioralExpression = 0.7;
    this.expressionHistory = [];
    this.expressionPatterns.clear();
    this.expressionStyles.clear();
    this.lastUpdate = new Date().toISOString();
  }
}

export default ExpressionEngine;
