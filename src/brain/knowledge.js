// src/brain/knowledge.js - Sistema de Conhecimento da Nanabot
// Gerencia base de conhecimento, fatos e informações

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class KnowledgeSystem {
  constructor() {
    this.knowledgeBase = new Map();
    this.categories = this.initializeCategories();
    this.associations = new Map();
    this.confidence = new Map();
    this.sources = new Map();
    this.lastUpdate = new Date().toISOString();
    this.loadKnowledgeState();
  }

  // Inicializa categorias de conhecimento
  initializeCategories() {
    return {
      'pessoas': {
        keywords: ['mamãe', 'papai', 'família', 'amigo', 'pessoa'],
        importance: 0.9,
        decay: 0.95
      },
      'lugares': {
        keywords: ['casa', 'escola', 'parque', 'loja', 'lugar'],
        importance: 0.7,
        decay: 0.98
      },
      'objetos': {
        keywords: ['brinquedo', 'livro', 'comida', 'coisa', 'objeto'],
        importance: 0.6,
        decay: 0.99
      },
      'atividades': {
        keywords: ['brincar', 'estudar', 'dormir', 'comer', 'atividade'],
        importance: 0.8,
        decay: 0.97
      },
      'emoções': {
        keywords: ['feliz', 'triste', 'amor', 'medo', 'emoção'],
        importance: 0.9,
        decay: 0.96
      },
      'conceitos': {
        keywords: ['amor', 'amizade', 'família', 'aprender', 'conceito'],
        importance: 0.8,
        decay: 0.98
      },
      'fatos': {
        keywords: ['verdade', 'fato', 'informação', 'dado', 'conhecimento'],
        importance: 0.7,
        decay: 0.99
      },
      'regras': {
        keywords: ['regra', 'lei', 'norma', 'comportamento', 'dever'],
        importance: 0.8,
        decay: 0.97
      }
    };
  }

  // Carrega estado do conhecimento
  loadKnowledgeState() {
    try {
      const knowledgePath = path.resolve(__dirname, '../../data/knowledgeState.json');
      if (fs.existsSync(knowledgePath)) {
        const data = fs.readFileSync(knowledgePath, 'utf-8');
        const state = JSON.parse(data);
        
        this.knowledgeBase = new Map(state.knowledgeBase || []);
        this.associations = new Map(state.associations || []);
        this.confidence = new Map(state.confidence || []);
        this.sources = new Map(state.sources || []);
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado do conhecimento:', error);
    }
  }

  // Salva estado do conhecimento
  saveKnowledgeState() {
    try {
      const knowledgePath = path.resolve(__dirname, '../../data/knowledgeState.json');
      const state = {
        knowledgeBase: Array.from(this.knowledgeBase.entries()),
        associations: Array.from(this.associations.entries()),
        confidence: Array.from(this.confidence.entries()),
        sources: Array.from(this.sources.entries()),
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(knowledgePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado do conhecimento:', error);
    }
  }

  // Adiciona conhecimento
  addKnowledge(fact, category, confidence = 0.5, source = 'unknown') {
    const knowledgeId = this.generateKnowledgeId(fact);
    const timestamp = new Date().toISOString();
    
    const knowledge = {
      id: knowledgeId,
      fact: fact,
      category: category,
      confidence: confidence,
      source: source,
      timestamp: timestamp,
      lastAccessed: timestamp,
      accessCount: 0,
      importance: this.calculateImportance(fact, category),
      associations: []
    };
    
    this.knowledgeBase.set(knowledgeId, knowledge);
    this.confidence.set(knowledgeId, confidence);
    this.sources.set(knowledgeId, source);
    
    // Cria associações
    this.createAssociations(knowledgeId, fact, category);
    
    this.lastUpdate = timestamp;
    this.saveKnowledgeState();
    
    return knowledgeId;
  }

  // Gera ID único para conhecimento
  generateKnowledgeId(fact) {
    const timestamp = Date.now();
    const hash = this.simpleHash(fact);
    return `knowledge_${timestamp}_${hash}`;
  }

  // Hash simples para ID
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32-bit
    }
    return Math.abs(hash).toString(36);
  }

  // Calcula importância do conhecimento
  calculateImportance(fact, category) {
    const categoryInfo = this.categories[category];
    if (!categoryInfo) return 0.5;
    
    let importance = categoryInfo.importance;
    
    // Ajusta importância baseada no conteúdo
    if (fact.includes('mamãe') || fact.includes('papai')) {
      importance += 0.2;
    }
    if (fact.includes('amor') || fact.includes('carinho')) {
      importance += 0.1;
    }
    if (fact.includes('importante') || fact.includes('especial')) {
      importance += 0.1;
    }
    
    return Math.min(1, importance);
  }

  // Cria associações
  createAssociations(knowledgeId, fact, category) {
    const words = fact.toLowerCase().split(' ');
    
    for (const word of words) {
      if (word.length > 2) { // Ignora palavras muito curtas
        if (!this.associations.has(word)) {
          this.associations.set(word, new Set());
        }
        this.associations.get(word).add(knowledgeId);
      }
    }
    
    // Associações por categoria
    if (!this.associations.has(category)) {
      this.associations.set(category, new Set());
    }
    this.associations.get(category).add(knowledgeId);
  }

  // Busca conhecimento
  searchKnowledge(query, category = null, limit = 10) {
    const results = [];
    const queryWords = query.toLowerCase().split(' ');
    
    for (const [id, knowledge] of this.knowledgeBase) {
      if (category && knowledge.category !== category) continue;
      
      const relevance = this.calculateRelevance(knowledge, queryWords);
      if (relevance > 0.1) {
        results.push({
          id,
          knowledge,
          relevance,
          confidence: this.confidence.get(id) || 0.5
        });
      }
    }
    
    // Ordena por relevância e confiança
    results.sort((a, b) => {
      const scoreA = a.relevance * a.confidence;
      const scoreB = b.relevance * b.confidence;
      return scoreB - scoreA;
    });
    
    return results.slice(0, limit);
  }

  // Calcula relevância
  calculateRelevance(knowledge, queryWords) {
    const factWords = knowledge.fact.toLowerCase().split(' ');
    let relevance = 0;
    
    for (const queryWord of queryWords) {
      for (const factWord of factWords) {
        if (factWord.includes(queryWord) || queryWord.includes(factWord)) {
          relevance += 0.3;
        }
        if (factWord === queryWord) {
          relevance += 0.5;
        }
      }
    }
    
    // Bônus por categoria
    for (const queryWord of queryWords) {
      if (knowledge.category.includes(queryWord)) {
        relevance += 0.2;
      }
    }
    
    return Math.min(1, relevance);
  }

  // Obtém conhecimento por ID
  getKnowledgeById(id) {
    const knowledge = this.knowledgeBase.get(id);
    if (knowledge) {
      // Atualiza estatísticas de acesso
      knowledge.lastAccessed = new Date().toISOString();
      knowledge.accessCount++;
      this.saveKnowledgeState();
    }
    return knowledge;
  }

  // Obtém conhecimento por categoria
  getKnowledgeByCategory(category, limit = 20) {
    const results = [];
    
    for (const [id, knowledge] of this.knowledgeBase) {
      if (knowledge.category === category) {
        results.push({
          id,
          knowledge,
          confidence: this.confidence.get(id) || 0.5
        });
      }
    }
    
    // Ordena por importância e confiança
    results.sort((a, b) => {
      const scoreA = a.knowledge.importance * a.confidence;
      const scoreB = b.knowledge.importance * b.confidence;
      return scoreB - scoreA;
    });
    
    return results.slice(0, limit);
  }

  // Atualiza confiança
  updateConfidence(id, newConfidence, reason = '') {
    const knowledge = this.knowledgeBase.get(id);
    if (!knowledge) return false;
    
    const oldConfidence = this.confidence.get(id) || 0.5;
    const change = newConfidence - oldConfidence;
    
    // Atualiza confiança
    this.confidence.set(id, Math.max(0, Math.min(1, newConfidence)));
    knowledge.confidence = newConfidence;
    
    // Registra mudança
    if (!knowledge.confidenceHistory) {
      knowledge.confidenceHistory = [];
    }
    
    knowledge.confidenceHistory.push({
      timestamp: new Date().toISOString(),
      oldConfidence,
      newConfidence,
      change,
      reason
    });
    
    this.saveKnowledgeState();
    return true;
  }

  // Remove conhecimento
  removeKnowledge(id) {
    const knowledge = this.knowledgeBase.get(id);
    if (!knowledge) return false;
    
    // Remove associações
    this.removeAssociations(id, knowledge);
    
    // Remove das estruturas
    this.knowledgeBase.delete(id);
    this.confidence.delete(id);
    this.sources.delete(id);
    
    this.saveKnowledgeState();
    return true;
  }

  // Remove associações
  removeAssociations(id, knowledge) {
    const words = knowledge.fact.toLowerCase().split(' ');
    
    for (const word of words) {
      if (word.length > 2) {
        const associations = this.associations.get(word);
        if (associations) {
          associations.delete(id);
          if (associations.size === 0) {
            this.associations.delete(word);
          }
        }
      }
    }
    
    // Remove associação por categoria
    const categoryAssociations = this.associations.get(knowledge.category);
    if (categoryAssociations) {
      categoryAssociations.delete(id);
      if (categoryAssociations.size === 0) {
        this.associations.delete(knowledge.category);
      }
    }
  }

  // Obtém associações
  getAssociations(term) {
    const associations = this.associations.get(term.toLowerCase());
    if (!associations) return [];
    
    const results = [];
    for (const id of associations) {
      const knowledge = this.knowledgeBase.get(id);
      if (knowledge) {
        results.push({
          id,
          knowledge,
          confidence: this.confidence.get(id) || 0.5
        });
      }
    }
    
    return results;
  }

  // Aplica decaimento de conhecimento
  applyDecay() {
    const now = new Date();
    const decayThreshold = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
    
    for (const [id, knowledge] of this.knowledgeBase) {
      const lastAccessed = new Date(knowledge.lastAccessed);
      const timeSinceAccess = now.getTime() - lastAccessed.getTime();
      
      if (timeSinceAccess > decayThreshold) {
        const categoryInfo = this.categories[knowledge.category];
        if (categoryInfo) {
          const decayFactor = categoryInfo.decay;
          const currentConfidence = this.confidence.get(id) || 0.5;
          const newConfidence = currentConfidence * decayFactor;
          
          this.updateConfidence(id, newConfidence, 'Decaimento natural');
          
          // Remove conhecimento com confiança muito baixa
          if (newConfidence < 0.1) {
            this.removeKnowledge(id);
          }
        }
      }
    }
  }

  // Obtém estatísticas do conhecimento
  getKnowledgeStats() {
    const stats = {
      totalKnowledge: this.knowledgeBase.size,
      categories: {},
      averageConfidence: 0,
      totalAssociations: this.associations.size,
      recentKnowledge: [],
      mostAccessed: [],
      leastAccessed: []
    };
    
    if (this.knowledgeBase.size === 0) return stats;
    
    let totalConfidence = 0;
    const accessCounts = [];
    
    for (const [id, knowledge] of this.knowledgeBase) {
      // Estatísticas por categoria
      if (!stats.categories[knowledge.category]) {
        stats.categories[knowledge.category] = 0;
      }
      stats.categories[knowledge.category]++;
      
      // Confiança média
      const confidence = this.confidence.get(id) || 0.5;
      totalConfidence += confidence;
      
      // Contagem de acessos
      accessCounts.push({
        id,
        knowledge,
        accessCount: knowledge.accessCount,
        confidence
      });
    }
    
    stats.averageConfidence = totalConfidence / this.knowledgeBase.size;
    
    // Conhecimento mais acessado
    stats.mostAccessed = accessCounts
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);
    
    // Conhecimento menos acessado
    stats.leastAccessed = accessCounts
      .sort((a, b) => a.accessCount - b.accessCount)
      .slice(0, 10);
    
    // Conhecimento recente
    stats.recentKnowledge = Array.from(this.knowledgeBase.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    return stats;
  }

  // Obtém conhecimento aleatório
  getRandomKnowledge(category = null, minConfidence = 0.3) {
    const candidates = [];
    
    for (const [id, knowledge] of this.knowledgeBase) {
      if (category && knowledge.category !== category) continue;
      
      const confidence = this.confidence.get(id) || 0.5;
      if (confidence >= minConfidence) {
        candidates.push({ id, knowledge, confidence });
      }
    }
    
    if (candidates.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  // Obtém conhecimento relacionado
  getRelatedKnowledge(id, limit = 5) {
    const knowledge = this.knowledgeBase.get(id);
    if (!knowledge) return [];
    
    const related = [];
    const words = knowledge.fact.toLowerCase().split(' ');
    
    for (const word of words) {
      if (word.length > 2) {
        const associations = this.getAssociations(word);
        for (const association of associations) {
          if (association.id !== id) {
            related.push(association);
          }
        }
      }
    }
    
    // Remove duplicatas e ordena por relevância
    const unique = new Map();
    for (const item of related) {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    }
    
    return Array.from(unique.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  // Exporta conhecimento
  exportKnowledge(format = 'json') {
    const data = {
      knowledgeBase: Array.from(this.knowledgeBase.entries()),
      associations: Array.from(this.associations.entries()),
      confidence: Array.from(this.confidence.entries()),
      sources: Array.from(this.sources.entries()),
      categories: this.categories,
      lastUpdate: this.lastUpdate
    };
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    return data;
  }

  // Importa conhecimento
  importKnowledge(data) {
    try {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      
      this.knowledgeBase = new Map(data.knowledgeBase || []);
      this.associations = new Map(data.associations || []);
      this.confidence = new Map(data.confidence || []);
      this.sources = new Map(data.sources || []);
      
      if (data.categories) {
        this.categories = { ...this.categories, ...data.categories };
      }
      
      this.lastUpdate = new Date().toISOString();
      this.saveKnowledgeState();
      
      return true;
    } catch (error) {
      console.error('Erro ao importar conhecimento:', error);
      return false;
    }
  }

  // Reseta sistema de conhecimento
  resetKnowledgeSystem() {
    this.knowledgeBase.clear();
    this.associations.clear();
    this.confidence.clear();
    this.sources.clear();
    this.lastUpdate = new Date().toISOString();
  }

  // Processa entrada e extrai conhecimento
  processInput(input, context = {}) {
    try {
      const extractedKnowledge = this.extractKnowledge(input);
      const processedKnowledge = {
        input: input,
        extractedFacts: extractedKnowledge,
        context: context,
        timestamp: new Date().toISOString(),
        confidence: this.calculateOverallConfidence(extractedKnowledge)
      };

      // Adiciona conhecimento extraído
      extractedKnowledge.forEach(fact => {
        this.addKnowledge(fact.fact, fact.category, fact.confidence, 'user_input');
      });

      return processedKnowledge;
    } catch (error) {
      console.error('Erro ao processar entrada no sistema de conhecimento:', error);
      return {
        input: input,
        extractedFacts: [],
        context: context,
        timestamp: new Date().toISOString(),
        confidence: 0
      };
    }
  }

  // Extrai conhecimento da entrada
  extractKnowledge(input) {
    const facts = [];
    const words = input.toLowerCase().split(/\s+/);
    
    // Procura por padrões de conhecimento
    for (const [category, config] of Object.entries(this.categories)) {
      const matches = words.filter(word => 
        config.keywords.some(keyword => word.includes(keyword))
      );
      
      if (matches.length > 0) {
        facts.push({
          fact: input,
          category: category,
          confidence: Math.min(0.8, matches.length * 0.2),
          keywords: matches
        });
      }
    }
    
    return facts;
  }

  // Calcula confiança geral
  calculateOverallConfidence(facts) {
    if (facts.length === 0) return 0;
    const totalConfidence = facts.reduce((sum, fact) => sum + fact.confidence, 0);
    return totalConfidence / facts.length;
  }
}

export default KnowledgeSystem;

