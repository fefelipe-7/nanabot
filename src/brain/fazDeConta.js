// src/brain/fazDeConta.js - Sistema de Faz de Conta da Nanabot
// Gerencia brincadeiras de faz de conta, roleplay e criatividade lúdica

import { loadState, saveState } from '../utils/stateManager.js';

class FazDeContaSystem {
  constructor() {
    this.playfulness = 0.7; // Nível de brincadeira (0-1)
    this.creativity = 0.6; // Criatividade lúdica
    this.imagination = 0.8; // Imaginação ativa
    this.roleplayScenarios = new Map();
    this.playCharacters = new Map();
    this.playObjects = new Map();
    this.playHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadFazDeContaState();
  }

  // Carrega estado do faz de conta
  loadFazDeContaState() {
    const state = loadState('fazDeConta', this.getDefaultState());
    this.playfulness = state.playfulness || 0.7;
    this.creativity = state.creativity || 0.6;
    this.imagination = state.imagination || 0.8;
    this.roleplayScenarios = new Map(state.roleplayScenarios || []);
    this.playCharacters = new Map(state.playCharacters || []);
    this.playObjects = new Map(state.playObjects || []);
    this.playHistory = state.playHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado do faz de conta
  saveFazDeContaState() {
    const state = {
      playfulness: this.playfulness,
      creativity: this.creativity,
      imagination: this.imagination,
      roleplayScenarios: Array.from(this.roleplayScenarios.entries()),
      playCharacters: Array.from(this.playCharacters.entries()),
      playObjects: Array.from(this.playObjects.entries()),
      playHistory: this.playHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('fazDeConta', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      playfulness: 0.7,
      creativity: 0.6,
      imagination: 0.8,
      roleplayScenarios: [],
      playCharacters: [],
      playObjects: [],
      playHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gera faz de conta
  processFazDeConta(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos de faz de conta
    const analysis = this.analyzePlayElements(input, context);
    
    // Gera cenários de faz de conta
    const playScenarios = this.generatePlayScenarios(analysis, context);
    
    // Atualiza níveis de brincadeira
    this.updatePlayLevels(analysis, playScenarios);
    
    // Registra no histórico
    this.recordPlay(analysis, playScenarios, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveFazDeContaState();
    
    return {
      analysis,
      playScenarios,
      playfulness: this.playfulness,
      creativity: this.creativity,
      imagination: this.imagination
    };
  }

  // Analisa elementos de brincadeira na entrada
  analyzePlayElements(input, context) {
    const analysis = {
      hasPlayTriggers: false,
      hasRoleplay: false,
      hasImagination: false,
      hasCreativity: false,
      playTriggers: [],
      roleplayElements: [],
      imaginationElements: [],
      creativityElements: [],
      playIntensity: 0,
      playComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta gatilhos de brincadeira
    const playTriggers = this.detectPlayTriggers(input, context);
    if (playTriggers.length > 0) {
      analysis.hasPlayTriggers = true;
      analysis.playTriggers = playTriggers;
    }
    
    // Detecta elementos de roleplay
    const roleplayElements = this.detectRoleplayElements(input, context);
    if (roleplayElements.length > 0) {
      analysis.hasRoleplay = true;
      analysis.roleplayElements = roleplayElements;
    }
    
    // Detecta elementos de imaginação
    const imaginationElements = this.detectImaginationElements(input, context);
    if (imaginationElements.length > 0) {
      analysis.hasImagination = true;
      analysis.imaginationElements = imaginationElements;
    }
    
    // Detecta elementos de criatividade
    const creativityElements = this.detectCreativityElements(input, context);
    if (creativityElements.length > 0) {
      analysis.hasCreativity = true;
      analysis.creativityElements = creativityElements;
    }
    
    // Calcula intensidade da brincadeira
    analysis.playIntensity = this.calculatePlayIntensity(analysis, context);
    
    // Calcula complexidade da brincadeira
    analysis.playComplexity = this.calculatePlayComplexity(analysis, context);
    
    return analysis;
  }

  // Detecta gatilhos de brincadeira
  detectPlayTriggers(input, context) {
    const triggers = [];
    const lowerInput = input.toLowerCase();
    
    const playKeywords = {
      'brincar': ['brincar', 'brincadeira', 'jogar', 'diversão'],
      'faz_de_conta': ['faz de conta', 'fingir', 'simular', 'representar'],
      'vamos': ['vamos', 'que tal', 'e se', 'imagine'],
      'como_se': ['como se', 'como se fosse', 'como se eu fosse'],
      'personagem': ['personagem', 'papel', 'persona', 'avatar'],
      'história': ['história', 'conto', 'aventura', 'narrativa']
    };
    
    for (const [type, keywords] of Object.entries(playKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          triggers.push({
            type: type,
            keyword: keyword,
            category: 'play_trigger',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return triggers;
  }

  // Detecta elementos de roleplay
  detectRoleplayElements(input, context) {
    const elements = [];
    const lowerInput = input.toLowerCase();
    
    const roleplayKeywords = {
      'princesa': ['princesa', 'príncipe', 'realeza', 'castelo'],
      'super_heroi': ['super herói', 'herói', 'superpoder', 'salvador'],
      'animal': ['animal', 'bicho', 'gato', 'cachorro', 'pássaro'],
      'profissão': ['médico', 'professor', 'cozinheiro', 'artista'],
      'família': ['mamãe', 'papai', 'filha', 'filho', 'irmão'],
      'amigo': ['amigo', 'amiga', 'companheiro', 'parceiro']
    };
    
    for (const [type, keywords] of Object.entries(roleplayKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          elements.push({
            type: type,
            keyword: keyword,
            category: 'roleplay',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return elements;
  }

  // Detecta elementos de imaginação
  detectImaginationElements(input, context) {
    const elements = [];
    const lowerInput = input.toLowerCase();
    
    const imaginationKeywords = {
      'mágico': ['mágico', 'mágica', 'feitiço', 'encantamento'],
      'fantasia': ['fantasia', 'fantástico', 'imaginário', 'sonho'],
      'aventura': ['aventura', 'exploração', 'descoberta', 'viagem'],
      'criatura': ['criatura', 'monstro', 'fada', 'dragão'],
      'lugar': ['lugar', 'mundo', 'planeta', 'dimensão'],
      'objeto': ['objeto', 'coisa', 'ferramenta', 'instrumento']
    };
    
    for (const [type, keywords] of Object.entries(imaginationKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          elements.push({
            type: type,
            keyword: keyword,
            category: 'imagination',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return elements;
  }

  // Detecta elementos de criatividade
  detectCreativityElements(input, context) {
    const elements = [];
    const lowerInput = input.toLowerCase();
    
    const creativityKeywords = {
      'criar': ['criar', 'inventar', 'fazer', 'construir'],
      'desenhar': ['desenhar', 'pintar', 'colorir', 'arte'],
      'cantar': ['cantar', 'música', 'canção', 'ritmo'],
      'dançar': ['dançar', 'dança', 'movimento', 'coreografia'],
      'escrever': ['escrever', 'história', 'poesia', 'texto'],
      'inventar': ['inventar', 'criar', 'imaginar', 'sonhar']
    };
    
    for (const [type, keywords] of Object.entries(creativityKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          elements.push({
            type: type,
            keyword: keyword,
            category: 'creativity',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return elements;
  }

  // Calcula intensidade da brincadeira
  calculatePlayIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em gatilhos de brincadeira
    if (analysis.hasPlayTriggers) {
      intensity += analysis.playTriggers.length * 0.2;
    }
    
    // Intensidade baseada em roleplay
    if (analysis.hasRoleplay) {
      intensity += analysis.roleplayElements.length * 0.15;
    }
    
    // Intensidade baseada em imaginação
    if (analysis.hasImagination) {
      intensity += analysis.imaginationElements.length * 0.15;
    }
    
    // Intensidade baseada em criatividade
    if (analysis.hasCreativity) {
      intensity += analysis.creativityElements.length * 0.1;
    }
    
    // Intensidade baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      intensity += 0.2;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula complexidade da brincadeira
  calculatePlayComplexity(analysis, context) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de elementos
    complexity += analysis.playTriggers.length * 0.1;
    complexity += analysis.roleplayElements.length * 0.15;
    complexity += analysis.imaginationElements.length * 0.15;
    complexity += analysis.creativityElements.length * 0.1;
    
    // Complexidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      complexity += context.emotionalIntensity * 0.2;
    }
    
    return Math.min(1, complexity);
  }

  // Gera cenários de faz de conta
  generatePlayScenarios(analysis, context) {
    const scenarios = {
      roleplayScenarios: [],
      playCharacters: [],
      playObjects: [],
      playStories: [],
      playActivities: []
    };
    
    // Gera cenários de roleplay
    if (analysis.hasRoleplay) {
      scenarios.roleplayScenarios = this.generateRoleplayScenarios(analysis, context);
    }
    
    // Gera personagens de brincadeira
    scenarios.playCharacters = this.generatePlayCharacters(analysis, context);
    
    // Gera objetos de brincadeira
    scenarios.playObjects = this.generatePlayObjects(analysis, context);
    
    // Gera histórias de brincadeira
    scenarios.playStories = this.generatePlayStories(analysis, context);
    
    // Gera atividades de brincadeira
    scenarios.playActivities = this.generatePlayActivities(analysis, context);
    
    return scenarios;
  }

  // Gera cenários de roleplay
  generateRoleplayScenarios(analysis, context) {
    const scenarios = [];
    const scenarioTemplates = [
      'Vamos brincar de {scenario}',
      'Que tal fazermos de conta que somos {characters}?',
      'Vamos simular {situation}',
      'E se a gente fosse {characters} em {place}?'
    ];
    
    const playScenarios = [
      'princesa e príncipe', 'médico e paciente', 'professor e aluno',
      'cozinheiro e cliente', 'artista e modelo', 'super herói e vilão',
      'família feliz', 'amigos exploradores', 'aventureiros corajosos'
    ];
    
    const situations = [
      'uma aventura', 'uma festa', 'uma viagem', 'uma descoberta',
      'um resgate', 'uma celebração', 'uma exploração', 'uma missão'
    ];
    
    const places = [
      'um castelo', 'uma floresta', 'uma cidade', 'uma ilha',
      'um planeta', 'um mundo mágico', 'uma escola', 'um hospital'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)];
      const scenario = playScenarios[Math.floor(Math.random() * playScenarios.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      const place = places[Math.floor(Math.random() * places.length)];
      
      let scenarioText = template;
      scenarioText = scenarioText.replace('{scenario}', scenario);
      scenarioText = scenarioText.replace('{characters}', scenario);
      scenarioText = scenarioText.replace('{situation}', situation);
      scenarioText = scenarioText.replace('{place}', place);
      
      scenarios.push({
        content: scenarioText,
        type: 'roleplay_scenario',
        confidence: 0.8,
        playfulness: this.playfulness
      });
    }
    
    return scenarios;
  }

  // Gera personagens de brincadeira
  generatePlayCharacters(analysis, context) {
    const characters = [];
    const characterTemplates = [
      'Eu sou {character} e você é {character2}',
      'Vamos fazer de conta que eu sou {character}',
      'Que tal eu ser {character} e você ser {character2}?',
      'Vamos brincar que somos {characters}'
    ];
    
    const characterTypes = [
      'princesa', 'príncipe', 'super herói', 'médico', 'professor',
      'cozinheiro', 'artista', 'explorador', 'aventureiro', 'mágico'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = characterTemplates[Math.floor(Math.random() * characterTemplates.length)];
      const character = characterTypes[Math.floor(Math.random() * characterTypes.length)];
      const character2 = characterTypes[Math.floor(Math.random() * characterTypes.length)];
      
      let characterText = template;
      characterText = characterText.replace('{character}', character);
      characterText = characterText.replace('{character2}', character2);
      characterText = characterText.replace('{characters}', `${character} e ${character2}`);
      
      characters.push({
        content: characterText,
        character: character,
        character2: character2,
        type: 'play_character',
        confidence: 0.7,
        creativity: this.creativity
      });
    }
    
    return characters;
  }

  // Gera objetos de brincadeira
  generatePlayObjects(analysis, context) {
    const objects = [];
    const objectTemplates = [
      'Vamos usar {object} para brincar',
      'Que tal criarmos {object}?',
      'Vamos fazer de conta que {object} é {purpose}',
      'Vamos transformar {object} em {transformation}'
    ];
    
    const playObjects = [
      'uma varinha mágica', 'uma coroa', 'uma capa', 'um escudo',
      'uma espada', 'uma varinha', 'uma varinha de condão', 'um anel',
      'uma pedra mágica', 'um livro de feitiços', 'uma poção', 'um mapa'
    ];
    
    const purposes = [
      'mágico', 'especial', 'poderoso', 'misterioso',
      'encantado', 'mágico', 'poderoso', 'especial'
    ];
    
    const transformations = [
      'algo mágico', 'algo especial', 'algo poderoso', 'algo misterioso',
      'algo encantado', 'algo mágico', 'algo poderoso', 'algo especial'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = objectTemplates[Math.floor(Math.random() * objectTemplates.length)];
      const object = playObjects[Math.floor(Math.random() * playObjects.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const transformation = transformations[Math.floor(Math.random() * transformations.length)];
      
      let objectText = template;
      objectText = objectText.replace('{object}', object);
      objectText = objectText.replace('{purpose}', purpose);
      objectText = objectText.replace('{transformation}', transformation);
      
      objects.push({
        content: objectText,
        object: object,
        purpose: purpose,
        transformation: transformation,
        type: 'play_object',
        confidence: 0.6,
        imagination: this.imagination
      });
    }
    
    return objects;
  }

  // Gera histórias de brincadeira
  generatePlayStories(analysis, context) {
    const stories = [];
    const storyTemplates = [
      'Era uma vez {story}',
      'Vamos criar uma história sobre {theme}',
      'Que tal contarmos uma aventura de {character}?',
      'Vamos inventar uma história onde {situation}'
    ];
    
    const storyThemes = [
      'uma princesa corajosa', 'um super herói gentil', 'uma aventura mágica',
      'uma descoberta incrível', 'uma amizade especial', 'uma missão importante',
      'um mundo fantástico', 'uma viagem emocionante', 'uma celebração alegre'
    ];
    
    const characters = [
      'princesa', 'príncipe', 'super herói', 'médico', 'professor',
      'cozinheiro', 'artista', 'explorador', 'aventureiro', 'mágico'
    ];
    
    const situations = [
      'todos se ajudam', 'a magia funciona', 'a amizade vence',
      'todos ficam felizes', 'a aventura termina bem', 'o bem triunfa'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
      const theme = storyThemes[Math.floor(Math.random() * storyThemes.length)];
      const character = characters[Math.floor(Math.random() * characters.length)];
      const situation = situations[Math.floor(Math.random() * situations.length)];
      
      let storyText = template;
      storyText = storyText.replace('{story}', theme);
      storyText = storyText.replace('{theme}', theme);
      storyText = storyText.replace('{character}', character);
      storyText = storyText.replace('{situation}', situation);
      
      stories.push({
        content: storyText,
        theme: theme,
        character: character,
        situation: situation,
        type: 'play_story',
        confidence: 0.7,
        creativity: this.creativity
      });
    }
    
    return stories;
  }

  // Gera atividades de brincadeira
  generatePlayActivities(analysis, context) {
    const activities = [];
    const activityTemplates = [
      'Vamos {activity}',
      'Que tal {activity}?',
      'Vamos brincar de {activity}',
      'Vamos fazer {activity} juntos'
    ];
    
    const playActivities = [
      'cantar uma música', 'dançar uma dança', 'desenhar um desenho',
      'fazer uma poesia', 'inventar uma canção', 'criar uma dança',
      'fazer uma peça de teatro', 'criar uma história', 'fazer um desenho',
      'inventar um jogo', 'criar uma brincadeira', 'fazer uma arte'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const activity = playActivities[Math.floor(Math.random() * playActivities.length)];
      
      let activityText = template;
      activityText = activityText.replace('{activity}', activity);
      
      activities.push({
        content: activityText,
        activity: activity,
        type: 'play_activity',
        confidence: 0.6,
        playfulness: this.playfulness
      });
    }
    
    return activities;
  }

  // Atualiza níveis de brincadeira
  updatePlayLevels(analysis, playScenarios) {
    // Atualiza nível de brincadeira
    if (analysis.hasPlayTriggers) {
      this.playfulness = Math.min(1, this.playfulness + 0.02);
    }
    
    // Atualiza criatividade
    if (playScenarios.playStories.length > 0) {
      this.creativity = Math.min(1, this.creativity + 0.03);
    }
    
    // Atualiza imaginação
    if (playScenarios.playObjects.length > 0) {
      this.imagination = Math.min(1, this.imagination + 0.02);
    }
    
    // Aplica decaimento natural
    this.playfulness *= 0.999;
    this.creativity *= 0.998;
    this.imagination *= 0.997;
  }

  // Registra brincadeira
  recordPlay(analysis, playScenarios, timestamp) {
    const record = {
      timestamp,
      analysis,
      playScenarios,
      playfulness: this.playfulness,
      creativity: this.creativity,
      imagination: this.imagination
    };
    
    this.playHistory.push(record);
    
    // Mantém histórico limitado
    if (this.playHistory.length > 300) {
      this.playHistory = this.playHistory.slice(-300);
    }
  }

  // Obtém estatísticas do faz de conta
  getFazDeContaStats() {
    const stats = {
      playfulness: this.playfulness,
      creativity: this.creativity,
      imagination: this.imagination,
      totalScenarios: this.roleplayScenarios.size,
      totalCharacters: this.playCharacters.size,
      totalObjects: this.playObjects.size,
      recentPlay: this.playHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de faz de conta
  resetFazDeContaSystem() {
    this.playfulness = 0.7;
    this.creativity = 0.6;
    this.imagination = 0.8;
    this.roleplayScenarios.clear();
    this.playCharacters.clear();
    this.playObjects.clear();
    this.playHistory = [];
    this.lastUpdate = new Date().toISOString();
  }

  // Processa entrada e detecta faz de conta
  processInput(input, context = {}) {
    try {
      const rolePlayElements = this.detectRolePlayElements(input);
      const imaginationElements = this.detectImaginationElements(input, context);
      const fantasyScenarios = this.detectFantasyScenarios(input, context);
      const creativePlay = this.assessCreativePlay(input, context);
      
      const processedFazDeConta = {
        input: input,
        rolePlayElements: rolePlayElements,
        imaginationElements: imaginationElements,
        fantasyScenarios: fantasyScenarios,
        creativePlay: creativePlay,
        context: context,
        timestamp: new Date().toISOString(),
        playLevel: this.calculatePlayLevel(rolePlayElements, imaginationElements, fantasyScenarios)
      };

      // Adiciona à história de faz de conta
      this.playHistory.push({
        input: input,
        rolePlayElements: rolePlayElements,
        imaginationElements: imaginationElements,
        fantasyScenarios: fantasyScenarios,
        creativePlay: creativePlay,
        timestamp: new Date().toISOString()
      });

      // Mantém apenas os últimos 100 registros
      if (this.playHistory.length > 100) {
        this.playHistory = this.playHistory.slice(-100);
      }

      return processedFazDeConta;
    } catch (error) {
      console.error('Erro ao processar entrada no sistema de faz de conta:', error);
      return {
        input: input,
        rolePlayElements: [],
        imaginationElements: [],
        fantasyScenarios: [],
        creativePlay: { level: 0, triggers: [] },
        context: context,
        timestamp: new Date().toISOString(),
        playLevel: 0
      };
    }
  }

  // Calcula nível de brincadeira
  calculatePlayLevel(rolePlayElements, imaginationElements, fantasyScenarios) {
    let level = 0;
    
    // Contribuição dos elementos de role play
    level += rolePlayElements.length * 0.3;
    
    // Contribuição dos elementos de imaginação
    level += imaginationElements.length * 0.4;
    
    // Contribuição dos cenários de fantasia
    level += fantasyScenarios.length * 0.3;
    
    return Math.min(1, level);
  }
}

export default FazDeContaSystem;
