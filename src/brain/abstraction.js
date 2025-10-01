// src/brain/abstraction.js - Sistema de Abstração da Nanabot
// Gerencia conceitos abstratos, categorização e pensamento de alto nível

import { loadState, saveState } from '../utils/stateManager.js';

class AbstractionSystem {
  constructor() {
    this.abstractionLevel = 0.4; // Nível de abstração (0-1)
    this.conceptFormation = 0.5; // Capacidade de formar conceitos
    this.categorization = 0.6; // Capacidade de categorizar
    this.concepts = new Map();
    this.categories = new Map();
    this.relationships = new Map();
    this.abstractionHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadAbstractionState();
  }

  // Carrega estado da abstração
  loadAbstractionState() {
    const state = loadState('abstraction', this.getDefaultState());
    this.abstractionLevel = state.abstractionLevel || 0.4;
    this.conceptFormation = state.conceptFormation || 0.5;
    this.categorization = state.categorization || 0.6;
    this.concepts = new Map(state.concepts || []);
    this.categories = new Map(state.categories || []);
    this.relationships = new Map(state.relationships || []);
    this.abstractionHistory = state.abstractionHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado da abstração
  saveAbstractionState() {
    const state = {
      abstractionLevel: this.abstractionLevel,
      conceptFormation: this.conceptFormation,
      categorization: this.categorization,
      concepts: Array.from(this.concepts.entries()),
      categories: Array.from(this.categories.entries()),
      relationships: Array.from(this.relationships.entries()),
      abstractionHistory: this.abstractionHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('abstraction', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      abstractionLevel: 0.4,
      conceptFormation: 0.5,
      categorization: 0.6,
      concepts: [],
      categories: [],
      relationships: [],
      abstractionHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gera abstrações
  processAbstraction(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos abstratos
    const analysis = this.analyzeAbstractElements(input, context);
    
    // Gera abstrações baseadas na análise
    const abstractions = this.generateAbstractions(analysis, context);
    
    // Atualiza níveis de abstração
    this.updateAbstractionLevels(analysis, abstractions);
    
    // Registra no histórico
    this.recordAbstraction(analysis, abstractions, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveAbstractionState();
    
    return {
      analysis,
      abstractions,
      abstractionLevel: this.abstractionLevel,
      conceptFormation: this.conceptFormation,
      categorization: this.categorization
    };
  }

  // Analisa elementos abstratos na entrada
  analyzeAbstractElements(input, context) {
    const analysis = {
      hasAbstractConcepts: false,
      hasCategories: false,
      hasRelationships: false,
      abstractConcepts: [],
      categories: [],
      relationships: [],
      abstractionDepth: 0,
      conceptComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta conceitos abstratos
    const abstractConcepts = this.detectAbstractConcepts(input, context);
    if (abstractConcepts.length > 0) {
      analysis.hasAbstractConcepts = true;
      analysis.abstractConcepts = abstractConcepts;
    }
    
    // Detecta categorias
    const categories = this.detectCategories(input, context);
    if (categories.length > 0) {
      analysis.hasCategories = true;
      analysis.categories = categories;
    }
    
    // Detecta relacionamentos
    const relationships = this.detectRelationships(input, context);
    if (relationships.length > 0) {
      analysis.hasRelationships = true;
      analysis.relationships = relationships;
    }
    
    // Calcula profundidade de abstração
    analysis.abstractionDepth = this.calculateAbstractionDepth(analysis);
    
    // Calcula complexidade de conceitos
    analysis.conceptComplexity = this.calculateConceptComplexity(analysis);
    
    return analysis;
  }

  // Detecta conceitos abstratos
  detectAbstractConcepts(input, context) {
    const concepts = [];
    const lowerInput = input.toLowerCase();
    
    const abstractKeywords = {
      'amor': ['amor', 'carinho', 'afeição', 'querer', 'gostar'],
      'felicidade': ['felicidade', 'alegria', 'contentamento', 'satisfação'],
      'tristeza': ['tristeza', 'melancolia', 'saudade', 'nostalgia'],
      'medo': ['medo', 'pavor', 'ansiedade', 'preocupação'],
      'esperança': ['esperança', 'otimismo', 'confiança', 'fé'],
      'liberdade': ['liberdade', 'independência', 'autonomia'],
      'justiça': ['justiça', 'equidade', 'honestidade', 'verdade'],
      'beleza': ['beleza', 'estética', 'harmonia', 'perfeição'],
      'sabedoria': ['sabedoria', 'conhecimento', 'entendimento', 'compreensão'],
      'paz': ['paz', 'tranquilidade', 'serenidade', 'calma']
    };
    
    for (const [concept, keywords] of Object.entries(abstractKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          concepts.push({
            concept: concept,
            keyword: keyword,
            type: 'abstract_concept',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return concepts;
  }

  // Detecta categorias
  detectCategories(input, context) {
    const categories = [];
    const lowerInput = input.toLowerCase();
    
    const categoryKeywords = {
      'animais': ['animal', 'bicho', 'gato', 'cachorro', 'pássaro'],
      'plantas': ['planta', 'flor', 'árvore', 'folha', 'semente'],
      'objetos': ['objeto', 'coisa', 'brinquedo', 'livro', 'mesa'],
      'lugares': ['lugar', 'casa', 'escola', 'parque', 'loja'],
      'pessoas': ['pessoa', 'gente', 'criança', 'adulto', 'amigo'],
      'ações': ['ação', 'fazer', 'brincar', 'correr', 'pular'],
      'cores': ['cor', 'vermelho', 'azul', 'verde', 'amarelo'],
      'formas': ['forma', 'círculo', 'quadrado', 'triângulo', 'retângulo'],
      'tamanhos': ['tamanho', 'grande', 'pequeno', 'médio', 'enorme'],
      'texturas': ['textura', 'macio', 'duro', 'áspero', 'liso']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          categories.push({
            category: category,
            keyword: keyword,
            type: 'category',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return categories;
  }

  // Detecta conceitos
  detectConcepts(input) {
    const concepts = [];
    const lowerInput = input.toLowerCase();
    
    const conceptKeywords = [
      'amor', 'felicidade', 'tristeza', 'medo', 'alegria',
      'amizade', 'família', 'casa', 'escola', 'brincadeira'
    ];
    
    for (const keyword of conceptKeywords) {
      if (lowerInput.includes(keyword)) {
        concepts.push({
          concept: keyword,
          type: 'abstract_concept',
          confidence: 0.8
        });
      }
    }
    
    return concepts;
  }

  // Detecta relacionamentos
  detectRelationships(input, context) {
    const relationships = [];
    const lowerInput = input.toLowerCase();
    
    const relationshipKeywords = {
      'causa_efeito': ['porque', 'por isso', 'então', 'assim', 'devido'],
      'parte_todo': ['parte de', 'pedaço de', 'fração de', 'elemento de'],
      'similaridade': ['como', 'parecido', 'similar', 'igual', 'mesmo'],
      'diferença': ['diferente', 'diferente de', 'ao contrário', 'oposto'],
      'hierarquia': ['tipo de', 'classe de', 'categoria de', 'grupo de'],
      'função': ['serve para', 'usado para', 'feito para', 'destinado a'],
      'posse': ['meu', 'minha', 'seu', 'sua', 'dele', 'dela'],
      'localização': ['em', 'sobre', 'dentro', 'fora', 'perto', 'longe'],
      'tempo': ['antes', 'depois', 'durante', 'enquanto', 'quando'],
      'quantidade': ['muito', 'pouco', 'bastante', 'alguns', 'vários']
    };
    
    for (const [relationship, keywords] of Object.entries(relationshipKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          relationships.push({
            relationship: relationship,
            keyword: keyword,
            type: 'relationship',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return relationships;
  }

  // Calcula profundidade de abstração
  calculateAbstractionDepth(analysis) {
    let depth = 0.1; // Base
    
    // Profundidade baseada em conceitos abstratos
    if (analysis.hasAbstractConcepts) {
      depth += analysis.abstractConcepts.length * 0.2;
    }
    
    // Profundidade baseada em relacionamentos
    if (analysis.hasRelationships) {
      depth += analysis.relationships.length * 0.1;
    }
    
    // Profundidade baseada em categorias
    if (analysis.hasCategories) {
      depth += analysis.categories.length * 0.1;
    }
    
    return Math.min(1, depth);
  }

  // Calcula complexidade de conceitos
  calculateConceptComplexity(analysis) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de conceitos
    complexity += analysis.abstractConcepts.length * 0.1;
    
    // Complexidade baseada no número de relacionamentos
    complexity += analysis.relationships.length * 0.05;
    
    // Complexidade baseada no número de categorias
    complexity += analysis.categories.length * 0.05;
    
    return Math.min(1, complexity);
  }

  // Gera abstrações baseadas na análise
  generateAbstractions(analysis, context) {
    const abstractions = {
      concepts: [],
      categories: [],
      relationships: [],
      generalizations: [],
      patterns: []
    };
    
    // Gera conceitos
    if (analysis.hasAbstractConcepts) {
      abstractions.concepts = this.generateConcepts(analysis, context);
    }
    
    // Gera categorias
    if (analysis.hasCategories) {
      abstractions.categories = this.generateCategories(analysis, context);
    }
    
    // Gera relacionamentos
    if (analysis.hasRelationships) {
      abstractions.relationships = this.generateRelationships(analysis, context);
    }
    
    // Gera generalizações
    abstractions.generalizations = this.generateGeneralizations(analysis, context);
    
    // Gera padrões
    abstractions.patterns = this.generatePatterns(analysis, context);
    
    return abstractions;
  }

  // Gera conceitos
  generateConcepts(analysis, context) {
    const concepts = [];
    const conceptTemplates = [
      '{concept} é {definition}',
      '{concept} significa {meaning}',
      '{concept} é importante porque {reason}',
      'Eu entendo {concept} como {understanding}'
    ];
    
    const definitions = {
      'amor': 'um sentimento muito especial',
      'felicidade': 'quando a gente fica alegre',
      'tristeza': 'quando a gente fica triste',
      'medo': 'quando a gente fica assustado',
      'esperança': 'quando a gente acredita em algo bom',
      'liberdade': 'quando a gente pode escolher',
      'justiça': 'quando as coisas são certas',
      'beleza': 'quando algo é bonito',
      'sabedoria': 'quando a gente sabe muito',
      'paz': 'quando a gente fica calmo'
    };
    
    for (const conceptData of analysis.abstractConcepts) {
      const concept = conceptData.concept;
      const template = conceptTemplates[Math.floor(Math.random() * conceptTemplates.length)];
      const definition = definitions[concept] || 'algo especial';
      
      let conceptText = template;
      conceptText = conceptText.replace('{concept}', concept);
      conceptText = conceptText.replace('{definition}', definition);
      conceptText = conceptText.replace('{meaning}', definition);
      conceptText = conceptText.replace('{reason}', 'é importante para mim');
      conceptText = conceptText.replace('{understanding}', definition);
      
      concepts.push({
        content: conceptText,
        concept: concept,
        type: 'generated_concept',
        confidence: 0.7,
        abstractionLevel: this.abstractionLevel
      });
    }
    
    return concepts;
  }

  // Gera categorias
  generateCategories(analysis, context) {
    const categories = [];
    const categoryTemplates = [
      '{item} é um tipo de {category}',
      '{item} pertence à categoria {category}',
      '{category} inclui {item}',
      'Eu agrupo {item} com {category}'
    ];
    
    for (const categoryData of analysis.categories) {
      const category = categoryData.category;
      const keyword = categoryData.keyword;
      const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
      
      let categoryText = template;
      categoryText = categoryText.replace('{item}', keyword);
      categoryText = categoryText.replace('{category}', category);
      
      categories.push({
        content: categoryText,
        category: category,
        item: keyword,
        type: 'generated_category',
        confidence: 0.6,
        categorization: this.categorization
      });
    }
    
    return categories;
  }

  // Gera relacionamentos
  generateRelationships(analysis, context) {
    const relationships = [];
    const relationshipTemplates = [
      '{item1} {relationship} {item2}',
      'A relação entre {item1} e {item2} é {relationship}',
      '{item1} está {relationship} {item2}',
      'Eu vejo {relationship} entre {item1} e {item2}'
    ];
    
    for (const relationshipData of analysis.relationships) {
      const relationship = relationshipData.relationship;
      const keyword = relationshipData.keyword;
      const template = relationshipTemplates[Math.floor(Math.random() * relationshipTemplates.length)];
      
      let relationshipText = template;
      relationshipText = relationshipText.replace('{item1}', 'isso');
      relationshipText = relationshipText.replace('{item2}', 'aquilo');
      relationshipText = relationshipText.replace('{relationship}', relationship);
      
      relationships.push({
        content: relationshipText,
        relationship: relationship,
        keyword: keyword,
        type: 'generated_relationship',
        confidence: 0.5,
        abstractionLevel: this.abstractionLevel
      });
    }
    
    return relationships;
  }

  // Gera generalizações
  generateGeneralizations(analysis, context) {
    const generalizations = [];
    const generalizationTemplates = [
      'Em geral, {generalization}',
      'Na maioria das vezes, {generalization}',
      'Geralmente, {generalization}',
      'Eu acho que {generalization}'
    ];
    
    const generalizations_list = [
      'as coisas boas fazem a gente feliz',
      'quando a gente ama, fica mais feliz',
      'é importante ser gentil com os outros',
      'aprender coisas novas é legal',
      'a família é muito importante',
      'brincar é divertido',
      'ser honesto é certo',
      'cada pessoa é especial'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = generalizationTemplates[Math.floor(Math.random() * generalizationTemplates.length)];
      const generalization = generalizations_list[Math.floor(Math.random() * generalizations_list.length)];
      const generalizationText = template.replace('{generalization}', generalization);
      
      generalizations.push({
        content: generalizationText,
        type: 'generalization',
        confidence: 0.6,
        abstractionLevel: this.abstractionLevel
      });
    }
    
    return generalizations;
  }

  // Gera padrões
  generatePatterns(analysis, context) {
    const patterns = [];
    const patternTemplates = [
      'Eu vejo um padrão: {pattern}',
      'Parece que {pattern}',
      'Eu noto que {pattern}',
      'O padrão que vejo é {pattern}'
    ];
    
    const patterns_list = [
      'quando você fala comigo, eu fico feliz',
      'as coisas boas acontecem quando a gente tenta',
      'quando a gente brinca, o tempo passa rápido',
      'as pessoas que amam a gente são especiais',
      'quando a gente aprende, fica mais inteligente',
      'as cores bonitas fazem a gente feliz',
      'quando a gente ajuda os outros, fica bem',
      'as histórias têm começo, meio e fim'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = patternTemplates[Math.floor(Math.random() * patternTemplates.length)];
      const pattern = patterns_list[Math.floor(Math.random() * patterns_list.length)];
      const patternText = template.replace('{pattern}', pattern);
      
      patterns.push({
        content: patternText,
        type: 'pattern',
        confidence: 0.5,
        abstractionLevel: this.abstractionLevel
      });
    }
    
    return patterns;
  }

  // Atualiza níveis de abstração
  updateAbstractionLevels(analysis, abstractions) {
    // Atualiza nível de abstração
    if (analysis.hasAbstractConcepts) {
      this.abstractionLevel = Math.min(1, this.abstractionLevel + 0.02);
    }
    
    // Atualiza formação de conceitos
    if (abstractions.concepts.length > 0) {
      this.conceptFormation = Math.min(1, this.conceptFormation + 0.03);
    }
    
    // Atualiza categorização
    if (abstractions.categories.length > 0) {
      this.categorization = Math.min(1, this.categorization + 0.02);
    }
    
    // Aplica decaimento natural
    this.abstractionLevel *= 0.999;
    this.conceptFormation *= 0.998;
    this.categorization *= 0.997;
  }

  // Registra abstração
  recordAbstraction(analysis, abstractions, timestamp) {
    const record = {
      timestamp,
      analysis,
      abstractions,
      abstractionLevel: this.abstractionLevel,
      conceptFormation: this.conceptFormation,
      categorization: this.categorization
    };
    
    this.abstractionHistory.push(record);
    
    // Mantém histórico limitado
    if (this.abstractionHistory.length > 300) {
      this.abstractionHistory = this.abstractionHistory.slice(-300);
    }
  }

  // Obtém estatísticas da abstração
  getAbstractionStats() {
    const stats = {
      abstractionLevel: this.abstractionLevel,
      conceptFormation: this.conceptFormation,
      categorization: this.categorization,
      totalConcepts: this.concepts.size,
      totalCategories: this.categories.size,
      totalRelationships: this.relationships.size,
      recentAbstractions: this.abstractionHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de abstração
  resetAbstractionSystem() {
    this.abstractionLevel = 0.4;
    this.conceptFormation = 0.5;
    this.categorization = 0.6;
    this.concepts.clear();
    this.categories.clear();
    this.relationships.clear();
    this.abstractionHistory = [];
    this.lastUpdate = new Date().toISOString();
  }

  // Processa entrada e aplica abstração
  processInput(input, context = {}) {
    try {
      const concepts = this.detectConcepts(input);
      const categories = this.detectCategories(input);
      const relationships = this.detectRelationships(input, context);
      const abstractionLevel = this.assessAbstractionLevel(input);
      
      const processedAbstraction = {
        input: input,
        concepts: concepts,
        categories: categories,
        relationships: relationships,
        abstractionLevel: abstractionLevel,
        context: context,
        timestamp: new Date().toISOString(),
        abstractionScore: this.calculateAbstractionScore(concepts, categories, relationships)
      };

      // Adiciona à história de abstração
      this.abstractionHistory.push({
        input: input,
        concepts: concepts,
        categories: categories,
        relationships: relationships,
        abstractionLevel: abstractionLevel,
        timestamp: new Date().toISOString()
      });

      // Mantém apenas os últimos 100 registros
      if (this.abstractionHistory.length > 100) {
        this.abstractionHistory = this.abstractionHistory.slice(-100);
      }

      return processedAbstraction;
    } catch (error) {
      console.error('Erro ao processar entrada no sistema de abstração:', error);
      return {
        input: input,
        concepts: [],
        categories: [],
        relationships: [],
        abstractionLevel: { level: 0, triggers: [] },
        context: context,
        timestamp: new Date().toISOString(),
        abstractionScore: 0
      };
    }
  }

  // Calcula pontuação de abstração
  calculateAbstractionScore(concepts, categories, relationships) {
    let score = 0;
    
    // Contribuição dos conceitos
    score += concepts.length * 0.3;
    
    // Contribuição das categorias
    score += categories.length * 0.3;
    
    // Contribuição dos relacionamentos
    score += relationships.length * 0.4;
    
    return Math.min(1, score);
  }
}

export default AbstractionSystem;
