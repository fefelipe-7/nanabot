// src/brain/curiosity.js - Sistema de Curiosidade da Nanabot
// Gerencia curiosidade, exploração e descoberta

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CuriositySystem {
  constructor() {
    this.curiosityLevel = 0.7;
    this.explorationDrive = 0.6;
    this.discoveryRate = 0.5;
    this.questions = new Map();
    this.topics = new Map();
    this.discoveries = new Map();
    this.explorations = new Map();
    this.curiosityHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadCuriosityState();
  }

  // Carrega estado da curiosidade
  loadCuriosityState() {
    try {
      const curiosityPath = path.resolve(__dirname, '../../data/curiosityState.json');
      if (fs.existsSync(curiosityPath)) {
        const data = fs.readFileSync(curiosityPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.curiosityLevel = state.curiosityLevel || 0.7;
        this.explorationDrive = state.explorationDrive || 0.6;
        this.discoveryRate = state.discoveryRate || 0.5;
        this.questions = new Map(state.questions || []);
        this.topics = new Map(state.topics || []);
        this.discoveries = new Map(state.discoveries || []);
        this.explorations = new Map(state.explorations || []);
        this.curiosityHistory = state.curiosityHistory || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado da curiosidade:', error);
    }
  }

  // Salva estado da curiosidade
  saveCuriosityState() {
    try {
      const curiosityPath = path.resolve(__dirname, '../../data/curiosityState.json');
      const state = {
        curiosityLevel: this.curiosityLevel,
        explorationDrive: this.explorationDrive,
        discoveryRate: this.discoveryRate,
        questions: Array.from(this.questions.entries()),
        topics: Array.from(this.topics.entries()),
        discoveries: Array.from(this.discoveries.entries()),
        explorations: Array.from(this.explorations.entries()),
        curiosityHistory: this.curiosityHistory.slice(-200), // Últimas 200 entradas
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(curiosityPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado da curiosidade:', error);
    }
  }

  // Processa entrada e gera curiosidade
  processCuriosity(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos curiosos
    const analysis = this.analyzeCuriousElements(input, context);
    
    // Gera curiosidade baseada na análise
    const curiosity = this.generateCuriosity(analysis, context);
    
    // Atualiza níveis de curiosidade
    this.updateCuriosityLevels(analysis, curiosity);
    
    // Registra no histórico
    this.recordCuriosity(analysis, curiosity, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveCuriosityState();
    
    return {
      analysis,
      curiosity,
      curiosityLevel: this.curiosityLevel,
      explorationDrive: this.explorationDrive,
      discoveryRate: this.discoveryRate
    };
  }

  // Analisa elementos curiosos na entrada
  analyzeCuriousElements(input, context) {
    const analysis = {
      hasQuestions: false,
      hasNewTopics: false,
      hasDiscoveries: false,
      hasExplorations: false,
      curiosityTriggers: [],
      newTopics: [],
      discoveries: [],
      explorations: [],
      questions: [],
      novelty: 0,
      complexity: 0,
      interest: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta perguntas
    if (lowerInput.includes('?')) {
      analysis.hasQuestions = true;
      analysis.questions = this.extractQuestions(input);
    }
    
    // Detecta tópicos novos
    const newTopics = this.detectNewTopics(input, context);
    if (newTopics.length > 0) {
      analysis.hasNewTopics = true;
      analysis.newTopics = newTopics;
    }
    
    // Detecta descobertas
    const discoveries = this.detectDiscoveries(input, context);
    if (discoveries.length > 0) {
      analysis.hasDiscoveries = true;
      analysis.discoveries = discoveries;
    }
    
    // Detecta explorações
    const explorations = this.detectExplorations(input, context);
    if (explorations.length > 0) {
      analysis.hasExplorations = true;
      analysis.explorations = explorations;
    }
    
    // Detecta gatilhos de curiosidade
    const triggers = this.detectCuriosityTriggers(input);
    analysis.curiosityTriggers = triggers;
    
    // Calcula novidade
    analysis.novelty = this.calculateNovelty(input, context);
    
    // Calcula complexidade
    analysis.complexity = this.calculateComplexity(input);
    
    // Calcula interesse
    analysis.interest = this.calculateInterest(input, context);
    
    return analysis;
  }

  // Extrai perguntas da entrada
  extractQuestions(input) {
    const questions = [];
    const sentences = input.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (sentence.includes('?')) {
        questions.push({
          content: sentence.trim(),
          type: this.classifyQuestion(sentence),
          confidence: 0.8
        });
      }
    }
    
    return questions;
  }

  // Classifica tipo de pergunta
  classifyQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('por que') || lowerQuestion.includes('porque')) {
      return 'why';
    }
    if (lowerQuestion.includes('como')) {
      return 'how';
    }
    if (lowerQuestion.includes('o que') || lowerQuestion.includes('que')) {
      return 'what';
    }
    if (lowerQuestion.includes('quando')) {
      return 'when';
    }
    if (lowerQuestion.includes('onde')) {
      return 'where';
    }
    if (lowerQuestion.includes('quem')) {
      return 'who';
    }
    
    return 'general';
  }

  // Detecta tópicos novos
  detectNewTopics(input, context) {
    const topics = [];
    const lowerInput = input.toLowerCase();
    
    const topicKeywords = {
      'animais': ['gato', 'cachorro', 'passarinho', 'peixe', 'animal'],
      'natureza': ['flor', 'árvore', 'sol', 'lua', 'estrela', 'mar'],
      'escola': ['escola', 'aula', 'professor', 'aprender', 'estudar'],
      'família': ['mamãe', 'papai', 'família', 'parentes', 'casa'],
      'brincadeiras': ['brincar', 'jogar', 'diversão', 'brinquedo'],
      'comida': ['comida', 'lanche', 'doce', 'fruta', 'biscoito'],
      'música': ['música', 'cantar', 'dançar', 'ritmo', 'som'],
      'histórias': ['história', 'conto', 'livro', 'aventura'],
      'tecnologia': ['computador', 'celular', 'internet', 'app'],
      'espaço': ['lua', 'estrela', 'planeta', 'espaço', 'universo']
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          if (!this.topics.has(topic)) {
            topics.push({
              topic: topic,
              keyword: keyword,
              confidence: 0.8,
              novelty: 1.0
            });
          }
        }
      }
    }
    
    return topics;
  }

  // Detecta descobertas
  detectDiscoveries(input, context) {
    const discoveries = [];
    const lowerInput = input.toLowerCase();
    
    const discoveryKeywords = [
      'descobri', 'achei', 'encontrei', 'vi', 'soube',
      'aprendi', 'entendi', 'percebi', 'notei', 'reparei'
    ];
    
    for (const keyword of discoveryKeywords) {
      if (lowerInput.includes(keyword)) {
        discoveries.push({
          keyword: keyword,
          type: 'discovery',
          confidence: 0.7,
          context: context
        });
      }
    }
    
    return discoveries;
  }

  // Detecta explorações
  detectExplorations(input, context) {
    const explorations = [];
    const lowerInput = input.toLowerCase();
    
    const explorationKeywords = [
      'explorar', 'descobrir', 'investigar', 'procurar',
      'encontrar', 'buscar', 'ver', 'conhecer', 'visitar'
    ];
    
    for (const keyword of explorationKeywords) {
      if (lowerInput.includes(keyword)) {
        explorations.push({
          keyword: keyword,
          type: 'exploration',
          confidence: 0.7,
          context: context
        });
      }
    }
    
    return explorations;
  }

  // Detecta gatilhos de curiosidade
  detectCuriosityTriggers(input) {
    const triggers = [];
    const lowerInput = input.toLowerCase();
    
    const curiosityTriggers = [
      'interessante', 'legal', 'bacana', 'cool', 'incrível',
      'uau', 'nossa', 'que legal', 'que bacana', 'que incrível',
      'não sabia', 'nunca vi', 'primeira vez', 'novo', 'diferente'
    ];
    
    for (const trigger of curiosityTriggers) {
      if (lowerInput.includes(trigger)) {
        triggers.push({
          trigger: trigger,
          type: 'curiosity_trigger',
          confidence: 0.8
        });
      }
    }
    
    return triggers;
  }

  // Calcula novidade
  calculateNovelty(input, context) {
    let novelty = 0.1; // Base
    
    // Novidade baseada em tópicos novos
    const newTopics = this.detectNewTopics(input, context);
    novelty += newTopics.length * 0.2;
    
    // Novidade baseada em descobertas
    const discoveries = this.detectDiscoveries(input, context);
    novelty += discoveries.length * 0.3;
    
    // Novidade baseada em explorações
    const explorations = this.detectExplorations(input, context);
    novelty += explorations.length * 0.2;
    
    // Novidade baseada em gatilhos de curiosidade
    const triggers = this.detectCuriosityTriggers(input);
    novelty += triggers.length * 0.1;
    
    return Math.min(1, novelty);
  }

  // Calcula complexidade
  calculateComplexity(input) {
    const words = input.split(' ').length;
    const sentences = input.split(/[.!?]+/).length;
    const questions = (input.match(/\?/g) || []).length;
    const exclamations = (input.match(/!/g) || []).length;
    
    return Math.min(1, (words / 20) * 0.4 + (sentences / 5) * 0.3 + (questions / 3) * 0.2 + (exclamations / 3) * 0.1);
  }

  // Calcula interesse
  calculateInterest(input, context) {
    let interest = 0.1; // Base
    
    // Interesse baseado no contexto social
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      interest += 0.3;
    }
    
    // Interesse baseado na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      interest += 0.2;
    }
    
    // Interesse baseado na novidade
    const novelty = this.calculateNovelty(input, context);
    interest += novelty * 0.3;
    
    // Interesse baseado na complexidade
    const complexity = this.calculateComplexity(input);
    interest += complexity * 0.2;
    
    return Math.min(1, interest);
  }

  // Gera curiosidade baseada na análise
  generateCuriosity(analysis, context) {
    const curiosity = {
      questions: [],
      explorations: [],
      discoveries: [],
      interests: [],
      curiosities: []
    };
    
    // Gera perguntas
    if (analysis.hasQuestions) {
      curiosity.questions = this.generateQuestions(analysis, context);
    }
    
    // Gera explorações
    if (analysis.hasExplorations) {
      curiosity.explorations = this.generateExplorations(analysis, context);
    }
    
    // Gera descobertas
    if (analysis.hasDiscoveries) {
      curiosity.discoveries = this.generateDiscoveries(analysis, context);
    }
    
    // Gera interesses
    curiosity.interests = this.generateInterests(analysis, context);
    
    // Gera curiosidades
    curiosity.curiosities = this.generateCuriosities(analysis, context);
    
    return curiosity;
  }

  // Gera perguntas
  generateQuestions(analysis, context) {
    const questions = [];
    const questionTemplates = [
      'Por que {tópico}?',
      'Como {tópico} funciona?',
      'O que é {tópico}?',
      'Quando {tópico} acontece?',
      'Onde {tópico} fica?',
      'Quem {tópico}?'
    ];
    
    const topics = ['o sol brilha', 'as flores crescem', 'os pássaros voam', 'a lua aparece', 'as estrelas brilham'];
    
    for (let i = 0; i < 2; i++) {
      const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const question = template.replace('{tópico}', topic);
      
      questions.push({
        content: question,
        type: 'generated_question',
        confidence: 0.7,
        curiosity: this.curiosityLevel
      });
    }
    
    return questions;
  }

  // Gera explorações
  generateExplorations(analysis, context) {
    const explorations = [];
    const explorationTemplates = [
      'Vamos explorar {lugar}?',
      'Que tal descobrir {coisa}?',
      'Vamos investigar {tópico}?',
      'Vamos procurar {objeto}?'
    ];
    
    const places = ['o jardim', 'a cozinha', 'o quarto', 'a sala', 'o parque'];
    const things = ['como funciona', 'o que tem', 'o que acontece', 'o que é'];
    const topics = ['as plantas', 'os animais', 'as cores', 'os sons'];
    const objects = ['flores', 'brinquedos', 'livros', 'coisas interessantes'];
    
    for (let i = 0; i < 2; i++) {
      const template = explorationTemplates[Math.floor(Math.random() * explorationTemplates.length)];
      let exploration = template;
      
      exploration = exploration.replace('{lugar}', places[Math.floor(Math.random() * places.length)]);
      exploration = exploration.replace('{coisa}', things[Math.floor(Math.random() * things.length)]);
      exploration = exploration.replace('{tópico}', topics[Math.floor(Math.random() * topics.length)]);
      exploration = exploration.replace('{objeto}', objects[Math.floor(Math.random() * objects.length)]);
      
      explorations.push({
        content: exploration,
        type: 'generated_exploration',
        confidence: 0.7,
        curiosity: this.curiosityLevel
      });
    }
    
    return explorations;
  }

  // Gera descobertas
  generateDiscoveries(analysis, context) {
    const discoveries = [];
    const discoveryTemplates = [
      'Descobri que {descoberta}!',
      'Achei {coisa} interessante!',
      'Encontrei {objeto} legal!',
      'Vi {coisa} pela primeira vez!'
    ];
    
    const discoveries_list = [
      'as flores têm cores diferentes',
      'os pássaros cantam de manhã',
      'o sol aquece a terra',
      'a lua aparece à noite',
      'as estrelas brilham no céu'
    ];
    
    const things = ['algo', 'uma coisa', 'um objeto', 'um lugar'];
    const objects = ['uma flor', 'um pássaro', 'uma pedra', 'uma folha'];
    
    for (let i = 0; i < 2; i++) {
      const template = discoveryTemplates[Math.floor(Math.random() * discoveryTemplates.length)];
      let discovery = template;
      
      discovery = discovery.replace('{descoberta}', discoveries_list[Math.floor(Math.random() * discoveries_list.length)]);
      discovery = discovery.replace('{coisa}', things[Math.floor(Math.random() * things.length)]);
      discovery = discovery.replace('{objeto}', objects[Math.floor(Math.random() * objects.length)]);
      
      discoveries.push({
        content: discovery,
        type: 'generated_discovery',
        confidence: 0.7,
        curiosity: this.curiosityLevel
      });
    }
    
    return discoveries;
  }

  // Gera interesses
  generateInterests(analysis, context) {
    const interests = [];
    const interestTemplates = [
      'Tenho interesse em {tópico}',
      'Gosto de {atividade}',
      'Acho {coisa} interessante',
      'Quero saber mais sobre {tópico}'
    ];
    
    const topics = ['animais', 'plantas', 'cores', 'música', 'histórias'];
    const activities = ['aprender', 'descobrir', 'explorar', 'investigar'];
    const things = ['coisas novas', 'descobertas', 'aprendizado', 'exploração'];
    
    for (let i = 0; i < 2; i++) {
      const template = interestTemplates[Math.floor(Math.random() * interestTemplates.length)];
      let interest = template;
      
      interest = interest.replace('{tópico}', topics[Math.floor(Math.random() * topics.length)]);
      interest = interest.replace('{atividade}', activities[Math.floor(Math.random() * activities.length)]);
      interest = interest.replace('{coisa}', things[Math.floor(Math.random() * things.length)]);
      
      interests.push({
        content: interest,
        type: 'generated_interest',
        confidence: 0.6,
        curiosity: this.curiosityLevel
      });
    }
    
    return interests;
  }

  // Gera curiosidades
  generateCuriosities(analysis, context) {
    const curiosities = [];
    const curiosityTemplates = [
      'Fico curiosa sobre {tópico}',
      'Quero entender {coisa}',
      'Tenho curiosidade de {atividade}',
      'Me pergunto sobre {tópico}'
    ];
    
    const topics = ['como as coisas funcionam', 'por que as coisas acontecem', 'o que tem no mundo'];
    const things = ['como funciona', 'por que é assim', 'o que acontece'];
    const activities = ['saber mais', 'descobrir', 'aprender', 'explorar'];
    
    for (let i = 0; i < 2; i++) {
      const template = curiosityTemplates[Math.floor(Math.random() * curiosityTemplates.length)];
      let curiosity = template;
      
      curiosity = curiosity.replace('{tópico}', topics[Math.floor(Math.random() * topics.length)]);
      curiosity = curiosity.replace('{coisa}', things[Math.floor(Math.random() * things.length)]);
      curiosity = curiosity.replace('{atividade}', activities[Math.floor(Math.random() * activities.length)]);
      
      curiosities.push({
        content: curiosity,
        type: 'generated_curiosity',
        confidence: 0.6,
        curiosity: this.curiosityLevel
      });
    }
    
    return curiosities;
  }

  // Atualiza níveis de curiosidade
  updateCuriosityLevels(analysis, curiosity) {
    // Atualiza nível de curiosidade
    if (analysis.hasQuestions) {
      this.curiosityLevel = Math.min(1, this.curiosityLevel + 0.05);
    }
    
    // Atualiza drive de exploração
    if (analysis.hasExplorations) {
      this.explorationDrive = Math.min(1, this.explorationDrive + 0.03);
    }
    
    // Atualiza taxa de descoberta
    if (analysis.hasDiscoveries) {
      this.discoveryRate = Math.min(1, this.discoveryRate + 0.04);
    }
    
    // Aplica decaimento natural
    this.curiosityLevel *= 0.999;
    this.explorationDrive *= 0.998;
    this.discoveryRate *= 0.997;
  }

  // Registra curiosidade
  recordCuriosity(analysis, curiosity, timestamp) {
    const record = {
      timestamp,
      analysis,
      curiosity,
      curiosityLevel: this.curiosityLevel,
      explorationDrive: this.explorationDrive,
      discoveryRate: this.discoveryRate
    };
    
    this.curiosityHistory.push(record);
    
    // Mantém histórico limitado
    if (this.curiosityHistory.length > 300) {
      this.curiosityHistory = this.curiosityHistory.slice(-300);
    }
  }

  // Obtém estatísticas da curiosidade
  getCuriosityStats() {
    const stats = {
      curiosityLevel: this.curiosityLevel,
      explorationDrive: this.explorationDrive,
      discoveryRate: this.discoveryRate,
      totalQuestions: this.questions.size,
      totalTopics: this.topics.size,
      totalDiscoveries: this.discoveries.size,
      totalExplorations: this.explorations.size,
      recentCuriosity: this.curiosityHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de curiosidade
  resetCuriositySystem() {
    this.curiosityLevel = 0.7;
    this.explorationDrive = 0.6;
    this.discoveryRate = 0.5;
    this.questions.clear();
    this.topics.clear();
    this.discoveries.clear();
    this.explorations.clear();
    this.curiosityHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default CuriositySystem;

