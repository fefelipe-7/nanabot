// src/brain/imagination.js - Sistema de Imaginação da Nanabot
// Gerencia criatividade, imaginação e pensamento abstrato

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImaginationSystem {
  constructor() {
    this.imaginationLevel = 0.7;
    this.creativity = 0.6;
    this.abstractThinking = 0.5;
    this.mentalImages = new Map();
    this.stories = new Map();
    this.scenarios = new Map();
    this.metaphors = new Map();
    this.dreams = new Map();
    this.imaginationHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadImaginationState();
  }

  // Carrega estado da imaginação
  loadImaginationState() {
    try {
      const imaginationPath = path.resolve(__dirname, '../../data/imaginationState.json');
      if (fs.existsSync(imaginationPath)) {
        const data = fs.readFileSync(imaginationPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.imaginationLevel = state.imaginationLevel || 0.7;
        this.creativity = state.creativity || 0.6;
        this.abstractThinking = state.abstractThinking || 0.5;
        this.mentalImages = new Map(state.mentalImages || []);
        this.stories = new Map(state.stories || []);
        this.scenarios = new Map(state.scenarios || []);
        this.metaphors = new Map(state.metaphors || []);
        this.dreams = new Map(state.dreams || []);
        this.imaginationHistory = state.imaginationHistory || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado da imaginação:', error);
    }
  }

  // Salva estado da imaginação
  saveImaginationState() {
    try {
      const imaginationPath = path.resolve(__dirname, '../../data/imaginationState.json');
      const state = {
        imaginationLevel: this.imaginationLevel,
        creativity: this.creativity,
        abstractThinking: this.abstractThinking,
        mentalImages: Array.from(this.mentalImages.entries()),
        stories: Array.from(this.stories.entries()),
        scenarios: Array.from(this.scenarios.entries()),
        metaphors: Array.from(this.metaphors.entries()),
        dreams: Array.from(this.dreams.entries()),
        imaginationHistory: this.imaginationHistory.slice(-200), // Últimas 200 entradas
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(imaginationPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado da imaginação:', error);
    }
  }

  // Processa entrada e gera imaginação
  processImagination(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos imaginativos
    const analysis = this.analyzeImaginativeElements(input, context);
    
    // Gera imaginação baseada na análise
    const imagination = this.generateImagination(analysis, context);
    
    // Atualiza níveis de imaginação
    this.updateImaginationLevels(analysis, imagination);
    
    // Registra no histórico
    this.recordImagination(analysis, imagination, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveImaginationState();
    
    return {
      analysis,
      imagination,
      imaginationLevel: this.imaginationLevel,
      creativity: this.creativity,
      abstractThinking: this.abstractThinking
    };
  }

  // Analisa elementos imaginativos na entrada
  analyzeImaginativeElements(input, context) {
    const analysis = {
      hasImaginationTriggers: false,
      creativityLevel: 0,
      abstractElements: [],
      emotionalIntensity: context.emotionalIntensity || 0,
      socialContext: context.userRole || 'unknown',
      timeContext: this.getTimeContext(),
      imaginativeWords: [],
      metaphors: [],
      stories: [],
      scenarios: []
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta palavras que despertam imaginação
    const imaginationTriggers = [
      'imaginar', 'sonhar', 'fantasiar', 'criar', 'inventar',
      'e se', 'que tal', 'vamos', 'brincar', 'faz de conta',
      'história', 'conto', 'aventura', 'mágico', 'fada',
      'dragão', 'princesa', 'castelo', 'floresta', 'montanha'
    ];
    
    for (const trigger of imaginationTriggers) {
      if (lowerInput.includes(trigger)) {
        analysis.hasImaginationTriggers = true;
        analysis.imaginativeWords.push(trigger);
        analysis.creativityLevel += 0.1;
      }
    }
    
    // Detecta elementos abstratos
    const abstractElements = [
      'amor', 'felicidade', 'tristeza', 'esperança', 'sonho',
      'liberdade', 'paz', 'beleza', 'verdade', 'justiça'
    ];
    
    for (const element of abstractElements) {
      if (lowerInput.includes(element)) {
        analysis.abstractElements.push(element);
        analysis.creativityLevel += 0.05;
      }
    }
    
    // Detecta metáforas
    const metaphors = this.detectMetaphors(input);
    analysis.metaphors = metaphors;
    
    // Detecta histórias
    const stories = this.detectStories(input);
    analysis.stories = stories;
    
    // Detecta cenários
    const scenarios = this.detectScenarios(input);
    analysis.scenarios = scenarios;
    
    return analysis;
  }

  // Detecta metáforas
  detectMetaphors(input) {
    const metaphors = [];
    const lowerInput = input.toLowerCase();
    
    const metaphorPatterns = [
      { pattern: /como (um|uma) (.+)/, type: 'simile' },
      { pattern: /é (um|uma) (.+)/, type: 'metaphor' },
      { pattern: /parece (um|uma) (.+)/, type: 'comparison' }
    ];
    
    for (const pattern of metaphorPatterns) {
      const match = lowerInput.match(pattern.pattern);
      if (match) {
        metaphors.push({
          type: pattern.type,
          content: match[0],
          subject: match[2],
          confidence: 0.8
        });
      }
    }
    
    return metaphors;
  }

  // Detecta histórias
  detectStories(input) {
    const stories = [];
    const lowerInput = input.toLowerCase();
    
    const storyTriggers = [
      'era uma vez', 'história', 'conto', 'aventura',
      'princesa', 'príncipe', 'dragão', 'fada', 'bruxa'
    ];
    
    for (const trigger of storyTriggers) {
      if (lowerInput.includes(trigger)) {
        stories.push({
          trigger: trigger,
          type: 'story_request',
          confidence: 0.7
        });
      }
    }
    
    return stories;
  }

  // Detecta cenários
  detectScenarios(input) {
    const scenarios = [];
    const lowerInput = input.toLowerCase();
    
    const scenarioTriggers = [
      'e se', 'que tal', 'imagine', 'vamos',
      'brincar de', 'faz de conta', 'como se'
    ];
    
    for (const trigger of scenarioTriggers) {
      if (lowerInput.includes(trigger)) {
        scenarios.push({
          trigger: trigger,
          type: 'scenario_request',
          confidence: 0.8
        });
      }
    }
    
    return scenarios;
  }

  // Avalia criatividade da entrada
  assessCreativity(input) {
    const creativeWords = [
      'criativo', 'imaginativo', 'artístico', 'original', 'único',
      'inventivo', 'inspirado', 'colorido', 'mágico', 'fantástico'
    ];
    
    const creativeLevel = creativeWords.some(word => 
      input.toLowerCase().includes(word)
    ) ? 0.8 : 0.3;
    
    return {
      level: creativeLevel,
      triggers: creativeWords.filter(word => 
        input.toLowerCase().includes(word)
      )
    };
  }

  // Gera imaginação baseada na análise
  generateImagination(analysis, context) {
    const imagination = {
      mentalImages: [],
      stories: [],
      scenarios: [],
      metaphors: [],
      dreams: [],
      creativeIdeas: []
    };
    
    // Gera imagens mentais
    if (analysis.hasImaginationTriggers) {
      imagination.mentalImages = this.generateMentalImages(analysis, context);
    }
    
    // Gera histórias
    if (analysis.stories.length > 0) {
      imagination.stories = this.generateStories(analysis, context);
    }
    
    // Gera cenários
    if (analysis.scenarios.length > 0) {
      imagination.scenarios = this.generateScenarios(analysis, context);
    }
    
    // Gera metáforas
    if (analysis.metaphors.length > 0) {
      imagination.metaphors = this.generateMetaphors(analysis, context);
    }
    
    // Gera ideias criativas
    imagination.creativeIdeas = this.generateCreativeIdeas(analysis, context);
    
    return imagination;
  }

  // Gera imagens mentais
  generateMentalImages(analysis, context) {
    const images = [];
    const imageTemplates = [
      'Uma {cor} {objeto} {ação} no {lugar}',
      'Um {personagem} {ação} com {objeto}',
      'Uma {cena} {emocional} com {elemento}',
      'Um {lugar} {mágico} cheio de {coisas}'
    ];
    
    const colors = ['azul', 'vermelho', 'verde', 'amarelo', 'roxo', 'rosa'];
    const objects = ['flor', 'árvore', 'casa', 'carro', 'avião', 'barco'];
    const actions = ['voando', 'dançando', 'cantando', 'brincando', 'correndo'];
    const places = ['céu', 'mar', 'floresta', 'montanha', 'cidade', 'campo'];
    const characters = ['princesa', 'príncipe', 'fada', 'dragão', 'unicórnio'];
    const scenes = ['cena', 'momento', 'situação', 'história'];
    const emotional = ['feliz', 'triste', 'mágico', 'especial', 'bonito'];
    const elements = ['luz', 'cor', 'música', 'amor', 'alegria'];
    const magical = ['mágico', 'encantado', 'especial', 'único'];
    const things = ['flores', 'estrelas', 'sonhos', 'cores', 'música'];
    
    for (let i = 0; i < 3; i++) {
      const template = imageTemplates[Math.floor(Math.random() * imageTemplates.length)];
      let image = template;
      
      image = image.replace('{cor}', colors[Math.floor(Math.random() * colors.length)]);
      image = image.replace('{objeto}', objects[Math.floor(Math.random() * objects.length)]);
      image = image.replace('{ação}', actions[Math.floor(Math.random() * actions.length)]);
      image = image.replace('{lugar}', places[Math.floor(Math.random() * places.length)]);
      image = image.replace('{personagem}', characters[Math.floor(Math.random() * characters.length)]);
      image = image.replace('{cena}', scenes[Math.floor(Math.random() * scenes.length)]);
      image = image.replace('{emocional}', emotional[Math.floor(Math.random() * emotional.length)]);
      image = image.replace('{elemento}', elements[Math.floor(Math.random() * elements.length)]);
      image = image.replace('{mágico}', magical[Math.floor(Math.random() * magical.length)]);
      image = image.replace('{coisas}', things[Math.floor(Math.random() * things.length)]);
      
      images.push({
        content: image,
        type: 'mental_image',
        confidence: 0.7,
        creativity: this.creativity
      });
    }
    
    return images;
  }

  // Gera histórias
  generateStories(analysis, context) {
    const stories = [];
    const storyTemplates = [
      'Era uma vez uma {personagem} que {ação} em um {lugar} {mágico}',
      'Há muito tempo, em um {lugar} distante, vivia um {personagem} que {ação}',
      'Em um {lugar} {mágico}, uma {personagem} {ação} e descobriu {descoberta}',
      'Uma vez, uma {personagem} {ação} e encontrou {encontro}'
    ];
    
    const characters = ['princesa', 'príncipe', 'fada', 'dragão', 'unicórnio', 'criança'];
    const actions = ['morava', 'brincava', 'cantava', 'dançava', 'voava', 'corria'];
    const places = ['castelo', 'floresta', 'montanha', 'cidade', 'vila', 'reino'];
    const magical = ['mágico', 'encantado', 'especial', 'único', 'bonito'];
    const discoveries = ['um tesouro', 'um amigo', 'um segredo', 'um poder', 'um sonho'];
    const encounters = ['um amigo especial', 'um animal mágico', 'um lugar bonito', 'um presente'];
    
    for (let i = 0; i < 2; i++) {
      const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
      let story = template;
      
      story = story.replace('{personagem}', characters[Math.floor(Math.random() * characters.length)]);
      story = story.replace('{ação}', actions[Math.floor(Math.random() * actions.length)]);
      story = story.replace('{lugar}', places[Math.floor(Math.random() * places.length)]);
      story = story.replace('{mágico}', magical[Math.floor(Math.random() * magical.length)]);
      story = story.replace('{descoberta}', discoveries[Math.floor(Math.random() * discoveries.length)]);
      story = story.replace('{encontro}', encounters[Math.floor(Math.random() * encounters.length)]);
      
      stories.push({
        content: story,
        type: 'story',
        confidence: 0.8,
        creativity: this.creativity
      });
    }
    
    return stories;
  }

  // Gera cenários
  generateScenarios(analysis, context) {
    const scenarios = [];
    const scenarioTemplates = [
      'E se a gente {ação} como {personagem}?',
      'Que tal a gente {ação} em um {lugar} {mágico}?',
      'Vamos brincar de {brincadeira} com {elemento}?',
      'Imagine se a gente {ação} e {resultado}?'
    ];
    
    const actions = ['voasse', 'nadasse', 'corresse', 'dançasse', 'cantasse'];
    const characters = ['princesa', 'príncipe', 'fada', 'dragão', 'unicórnio'];
    const places = ['castelo', 'floresta', 'mar', 'céu', 'montanha'];
    const magical = ['mágico', 'encantado', 'especial', 'bonito'];
    const games = ['esconde-esconde', 'pega-pega', 'faz de conta', 'história'];
    const elements = ['flores', 'estrelas', 'música', 'cores', 'sonhos'];
    const results = ['encontrássemos um tesouro', 'fizéssemos um amigo', 'descobríssemos algo especial'];
    
    for (let i = 0; i < 2; i++) {
      const template = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)];
      let scenario = template;
      
      scenario = scenario.replace('{ação}', actions[Math.floor(Math.random() * actions.length)]);
      scenario = scenario.replace('{personagem}', characters[Math.floor(Math.random() * characters.length)]);
      scenario = scenario.replace('{lugar}', places[Math.floor(Math.random() * places.length)]);
      scenario = scenario.replace('{mágico}', magical[Math.floor(Math.random() * magical.length)]);
      scenario = scenario.replace('{brincadeira}', games[Math.floor(Math.random() * games.length)]);
      scenario = scenario.replace('{elemento}', elements[Math.floor(Math.random() * elements.length)]);
      scenario = scenario.replace('{resultado}', results[Math.floor(Math.random() * results.length)]);
      
      scenarios.push({
        content: scenario,
        type: 'scenario',
        confidence: 0.8,
        creativity: this.creativity
      });
    }
    
    return scenarios;
  }

  // Gera metáforas
  generateMetaphors(analysis, context) {
    const metaphors = [];
    const metaphorTemplates = [
      'Você é como {comparação} porque {razão}',
      'Isso é {comparação} porque {razão}',
      'Me sinto como {comparação} quando {situação}',
      'É como {comparação} que {ação}'
    ];
    
    const comparisons = ['uma flor', 'uma estrela', 'um sol', 'uma lua', 'um arco-íris', 'uma borboleta'];
    const reasons = ['você me faz feliz', 'você é especial', 'você brilha', 'você é bonito'];
    const situations = ['você está perto', 'você me abraça', 'você sorri', 'você me ama'];
    const actions = ['brilha no céu', 'voa no ar', 'cresce no jardim', 'dança no vento'];
    
    for (let i = 0; i < 2; i++) {
      const template = metaphorTemplates[Math.floor(Math.random() * metaphorTemplates.length)];
      let metaphor = template;
      
      metaphor = metaphor.replace('{comparação}', comparisons[Math.floor(Math.random() * comparisons.length)]);
      metaphor = metaphor.replace('{razão}', reasons[Math.floor(Math.random() * reasons.length)]);
      metaphor = metaphor.replace('{situação}', situations[Math.floor(Math.random() * situations.length)]);
      metaphor = metaphor.replace('{ação}', actions[Math.floor(Math.random() * actions.length)]);
      
      metaphors.push({
        content: metaphor,
        type: 'metaphor',
        confidence: 0.7,
        creativity: this.creativity
      });
    }
    
    return metaphors;
  }

  // Gera ideias criativas
  generateCreativeIdeas(analysis, context) {
    const ideas = [];
    const ideaTemplates = [
      'Que tal a gente {ideia}?',
      'E se a gente {ideia}?',
      'Vamos {ideia}?',
      'Que tal {ideia}?'
    ];
    
    const creativeIdeas = [
      'inventar uma brincadeira nova',
      'criar uma história juntos',
      'desenhar algo especial',
      'cantar uma música inventada',
      'dançar como se fossemos fadas',
      'brincar de faz de conta',
      'inventar um jogo novo',
      'criar um mundo imaginário'
    ];
    
    for (let i = 0; i < 3; i++) {
      const template = ideaTemplates[Math.floor(Math.random() * ideaTemplates.length)];
      const idea = creativeIdeas[Math.floor(Math.random() * creativeIdeas.length)];
      const content = template.replace('{ideia}', idea);
      
      ideas.push({
        content: content,
        type: 'creative_idea',
        confidence: 0.6,
        creativity: this.creativity
      });
    }
    
    return ideas;
  }

  // Atualiza níveis de imaginação
  updateImaginationLevels(analysis, imagination) {
    // Atualiza nível de imaginação
    if (analysis.hasImaginationTriggers) {
      this.imaginationLevel = Math.min(1, this.imaginationLevel + 0.05);
    }
    
    // Atualiza criatividade
    if (imagination.creativeIdeas.length > 0) {
      this.creativity = Math.min(1, this.creativity + 0.03);
    }
    
    // Atualiza pensamento abstrato
    if (analysis.abstractElements.length > 0) {
      this.abstractThinking = Math.min(1, this.abstractThinking + 0.02);
    }
    
    // Aplica decaimento natural
    this.imaginationLevel *= 0.999;
    this.creativity *= 0.998;
    this.abstractThinking *= 0.997;
  }

  // Registra imaginação
  recordImagination(analysis, imagination, timestamp) {
    const record = {
      timestamp,
      analysis,
      imagination,
      imaginationLevel: this.imaginationLevel,
      creativity: this.creativity,
      abstractThinking: this.abstractThinking
    };
    
    this.imaginationHistory.push(record);
    
    // Mantém histórico limitado
    if (this.imaginationHistory.length > 300) {
      this.imaginationHistory = this.imaginationHistory.slice(-300);
    }
  }

  // Obtém contexto de tempo
  getTimeContext() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  // Obtém estatísticas da imaginação
  getImaginationStats() {
    const stats = {
      imaginationLevel: this.imaginationLevel,
      creativity: this.creativity,
      abstractThinking: this.abstractThinking,
      totalMentalImages: this.mentalImages.size,
      totalStories: this.stories.size,
      totalScenarios: this.scenarios.size,
      totalMetaphors: this.metaphors.size,
      totalDreams: this.dreams.size,
      recentImagination: this.imaginationHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de imaginação
  resetImaginationSystem() {
    this.imaginationLevel = 0.7;
    this.creativity = 0.6;
    this.abstractThinking = 0.5;
    this.mentalImages.clear();
    this.stories.clear();
    this.scenarios.clear();
    this.metaphors.clear();
    this.dreams.clear();
    this.imaginationHistory = [];
    this.lastUpdate = new Date().toISOString();
  }

  // Processa entrada e gera imaginação
  processInput(input, context = {}) {
    try {
      const stories = this.detectStories(input);
      const scenarios = this.detectScenarios(input);
      const creativity = this.assessCreativity(input);
      
      const processedImagination = {
        input: input,
        stories: stories,
        scenarios: scenarios,
        creativity: creativity,
        context: context,
        timestamp: new Date().toISOString(),
        imaginationLevel: this.calculateImaginationLevel(stories, scenarios, creativity)
      };

      // Adiciona à história de imaginação
      this.imaginationHistory.push({
        input: input,
        stories: stories,
        scenarios: scenarios,
        creativity: creativity,
        timestamp: new Date().toISOString()
      });

      // Mantém apenas os últimos 100 registros
      if (this.imaginationHistory.length > 100) {
        this.imaginationHistory = this.imaginationHistory.slice(-100);
      }

      return processedImagination;
    } catch (error) {
      console.error('Erro ao processar entrada no sistema de imaginação:', error);
      return {
        input: input,
        stories: [],
        scenarios: [],
        creativity: { level: 0, triggers: [] },
        context: context,
        timestamp: new Date().toISOString(),
        imaginationLevel: 0
      };
    }
  }

  // Calcula nível de imaginação
  calculateImaginationLevel(stories, scenarios, creativity) {
    let level = 0;
    
    // Contribuição das histórias
    level += stories.length * 0.3;
    
    // Contribuição dos cenários
    level += scenarios.length * 0.4;
    
    // Contribuição da criatividade
    level += creativity.level * 0.3;
    
    return Math.min(1, level);
  }
}

export default ImaginationSystem;

