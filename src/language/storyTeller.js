// src/language/storyTeller.js - Contador de Histórias da Nanabot
// Gerencia criação, narração e desenvolvimento de histórias

import { loadState, saveState } from '../utils/stateManager.js';

class StoryTeller {
  constructor() {
    this.storytellingLevel = 0.6; // Nível de contação de histórias (0-1)
    this.creativityLevel = 0.7; // Nível de criatividade
    this.narrativeSkills = 0.5; // Habilidades narrativas
    this.imaginationLevel = 0.8; // Nível de imaginação
    this.stories = new Map();
    this.storyTemplates = new Map();
    this.storyElements = new Map();
    this.storyHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadStoryTellerState();
  }

  // Carrega estado do contador de histórias
  loadStoryTellerState() {
    const state = loadState('storyTeller', this.getDefaultState());
    this.storytellingLevel = state.storytellingLevel || 0.6;
    this.creativityLevel = state.creativityLevel || 0.7;
    this.narrativeSkills = state.narrativeSkills || 0.5;
    this.imaginationLevel = state.imaginationLevel || 0.8;
    this.stories = new Map(state.stories || []);
    this.storyTemplates = new Map(state.storyTemplates || []);
    this.storyElements = new Map(state.storyElements || []);
    this.storyHistory = state.storyHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado do contador de histórias
  saveStoryTellerState() {
    const state = {
      storytellingLevel: this.storytellingLevel,
      creativityLevel: this.creativityLevel,
      narrativeSkills: this.narrativeSkills,
      imaginationLevel: this.imaginationLevel,
      stories: Array.from(this.stories.entries()),
      storyTemplates: Array.from(this.storyTemplates.entries()),
      storyElements: Array.from(this.storyElements.entries()),
      storyHistory: this.storyHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('storyTeller', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      storytellingLevel: 0.6,
      creativityLevel: 0.7,
      narrativeSkills: 0.5,
      imaginationLevel: 0.8,
      stories: [],
      storyTemplates: [],
      storyElements: [],
      storyHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gera histórias
  processStorytelling(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos de história
    const analysis = this.analyzeStoryElements(input, context);
    
    // Gera histórias baseadas na análise
    const stories = this.generateStories(analysis, context);
    
    // Atualiza níveis de contação de histórias
    this.updateStorytellingLevels(analysis, stories);
    
    // Registra no histórico
    this.recordStorytelling(analysis, stories, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveStoryTellerState();
    
    return {
      analysis,
      stories,
      storytellingLevel: this.storytellingLevel,
      creativityLevel: this.creativityLevel,
      narrativeSkills: this.narrativeSkills,
      imaginationLevel: this.imaginationLevel
    };
  }

  // Analisa entrada para elementos de história
  analyzeStoryElements(input, context) {
    const analysis = {
      hasStoryElements: false,
      hasCharacters: false,
      hasPlot: false,
      hasSetting: false,
      storyElements: [],
      characters: [],
      plot: [],
      setting: [],
      storytellingIntensity: 0,
      storytellingComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta elementos de história
    const storyElements = this.detectStoryElements(input, context);
    if (storyElements.length > 0) {
      analysis.hasStoryElements = true;
      analysis.storyElements = storyElements;
    }
    
    // Detecta personagens
    const characters = this.detectCharacters(input, context);
    if (characters.length > 0) {
      analysis.hasCharacters = true;
      analysis.characters = characters;
    }
    
    // Detecta enredo
    const plot = this.detectPlot(input, context);
    if (plot.length > 0) {
      analysis.hasPlot = true;
      analysis.plot = plot;
    }
    
    // Detecta cenário
    const setting = this.detectSetting(input, context);
    if (setting.length > 0) {
      analysis.hasSetting = true;
      analysis.setting = setting;
    }
    
    // Calcula intensidade da contação de histórias
    analysis.storytellingIntensity = this.calculateStorytellingIntensity(analysis, context);
    
    // Calcula complexidade da contação de histórias
    analysis.storytellingComplexity = this.calculateStorytellingComplexity(analysis, context);
    
    return analysis;
  }

  // Detecta elementos de história
  detectStoryElements(input, context) {
    const storyElements = [];
    const lowerInput = input.toLowerCase();
    
    const storyKeywords = {
      'historia': ['história', 'conto', 'fábula', 'lenda', 'narrativa'],
      'aventura': ['aventura', 'viagem', 'exploração', 'descoberta'],
      'magia': ['magia', 'mágico', 'feitiço', 'encantamento', 'poder'],
      'amizade': ['amizade', 'amigo', 'companheiro', 'aliado'],
      'familia': ['família', 'pai', 'mãe', 'irmão', 'irmã', 'avô', 'avó'],
      'animais': ['animal', 'bicho', 'pet', 'cachorro', 'gato', 'pássaro'],
      'natureza': ['natureza', 'floresta', 'montanha', 'rio', 'mar', 'céu']
    };
    
    for (const [type, keywords] of Object.entries(storyKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          storyElements.push({
            type: type,
            keyword: keyword,
            category: 'story_element',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return storyElements;
  }

  // Detecta personagens
  detectCharacters(input, context) {
    const characters = [];
    const lowerInput = input.toLowerCase();
    
    const characterKeywords = {
      'protagonista': ['protagonista', 'herói', 'heroína', 'personagem principal'],
      'antagonista': ['vilão', 'antagonista', 'inimigo', 'oponente'],
      'mentor': ['mentor', 'professor', 'guia', 'sábio'],
      'aliado': ['aliado', 'amigo', 'companheiro', 'ajudante'],
      'familia': ['família', 'pai', 'mãe', 'irmão', 'irmã', 'avô', 'avó'],
      'animais': ['animal', 'bicho', 'pet', 'cachorro', 'gato', 'pássaro']
    };
    
    for (const [type, keywords] of Object.entries(characterKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          characters.push({
            type: type,
            keyword: keyword,
            category: 'character',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return characters;
  }

  // Detecta enredo
  detectPlot(input, context) {
    const plot = [];
    const lowerInput = input.toLowerCase();
    
    const plotKeywords = {
      'conflito': ['conflito', 'problema', 'desafio', 'obstáculo'],
      'resolucao': ['resolução', 'solução', 'fim', 'conclusão'],
      'aventura': ['aventura', 'viagem', 'exploração', 'descoberta'],
      'mistério': ['mistério', 'segredo', 'enigma', 'puzzle'],
      'amor': ['amor', 'romance', 'carinho', 'afeição'],
      'amizade': ['amizade', 'lealdade', 'companheirismo', 'união']
    };
    
    for (const [type, keywords] of Object.entries(plotKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          plot.push({
            type: type,
            keyword: keyword,
            category: 'plot',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return plot;
  }

  // Detecta cenário
  detectSetting(input, context) {
    const setting = [];
    const lowerInput = input.toLowerCase();
    
    const settingKeywords = {
      'floresta': ['floresta', 'mata', 'bosque', 'selva'],
      'montanha': ['montanha', 'colina', 'pico', 'serra'],
      'rio': ['rio', 'córrego', 'cachoeira', 'lago'],
      'mar': ['mar', 'oceano', 'praia', 'costa'],
      'ceu': ['céu', 'nuvem', 'estrela', 'lua', 'sol'],
      'casa': ['casa', 'lar', 'moradia', 'residência'],
      'escola': ['escola', 'colégio', 'universidade', 'instituição']
    };
    
    for (const [type, keywords] of Object.entries(settingKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          setting.push({
            type: type,
            keyword: keyword,
            category: 'setting',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return setting;
  }

  // Calcula intensidade da contação de histórias
  calculateStorytellingIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em elementos de história
    if (analysis.hasStoryElements) {
      intensity += analysis.storyElements.length * 0.2;
    }
    
    // Intensidade baseada em personagens
    if (analysis.hasCharacters) {
      intensity += analysis.characters.length * 0.15;
    }
    
    // Intensidade baseada em enredo
    if (analysis.hasPlot) {
      intensity += analysis.plot.length * 0.15;
    }
    
    // Intensidade baseada em cenário
    if (analysis.hasSetting) {
      intensity += analysis.setting.length * 0.1;
    }
    
    // Intensidade baseada no contexto
    if (context.emotionalIntensity > 0.5) {
      intensity += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula complexidade da contação de histórias
  calculateStorytellingComplexity(analysis, context) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de elementos
    complexity += analysis.storyElements.length * 0.1;
    complexity += analysis.characters.length * 0.15;
    complexity += analysis.plot.length * 0.15;
    complexity += analysis.setting.length * 0.1;
    
    // Complexidade baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      complexity += context.emotionalIntensity * 0.2;
    }
    
    return Math.min(1, complexity);
  }

  // Gera histórias baseadas na análise
  generateStories(analysis, context) {
    const stories = {
      stories: [],
      storyTemplates: [],
      storyElements: [],
      storyCharacters: [],
      storyPlot: [],
      storySetting: []
    };
    
    // Gera histórias
    if (analysis.hasStoryElements) {
      stories.stories = this.generateStoryList(analysis, context);
    }
    
    // Gera templates de história
    stories.storyTemplates = this.generateStoryTemplates(analysis, context);
    
    // Gera elementos de história
    stories.storyElements = this.generateStoryElements(analysis, context);
    
    // Gera personagens
    if (analysis.hasCharacters) {
      stories.storyCharacters = this.generateStoryCharacters(analysis, context);
    }
    
    // Gera enredo
    if (analysis.hasPlot) {
      stories.storyPlot = this.generateStoryPlot(analysis, context);
    }
    
    // Gera cenário
    if (analysis.hasSetting) {
      stories.storySetting = this.generateStorySetting(analysis, context);
    }
    
    return stories;
  }

  // Gera lista de histórias
  generateStoryList(analysis, context) {
    const stories = [];
    const storyTemplates = [
      'Era uma vez {character} que {action} em {setting}',
      'Há muito tempo, {character} {action} e {consequence}',
      'Em um lugar distante, {character} {action} para {purpose}',
      'Uma vez, {character} {action} e descobriu {discovery}'
    ];
    
    const characters = ['uma menina', 'um menino', 'um animal', 'um herói', 'uma princesa'];
    const actions = ['vivia', 'brincava', 'explorava', 'sonhava', 'aprendia'];
    const settings = ['uma floresta', 'um castelo', 'uma montanha', 'um rio', 'o céu'];
    const consequences = ['fez muitos amigos', 'encontrou um tesouro', 'aprendeu uma lição', 'salvou o dia'];
    const purposes = ['ajudar os outros', 'encontrar a felicidade', 'aprender sobre o mundo', 'fazer a diferença'];
    const discoveries = ['o poder da amizade', 'a magia do amor', 'a importância da família', 'a beleza da natureza'];
    
    for (let i = 0; i < 2; i++) {
      const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
      const character = characters[Math.floor(Math.random() * characters.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const setting = settings[Math.floor(Math.random() * settings.length)];
      const consequence = consequences[Math.floor(Math.random() * consequences.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
      
      let storyText = template;
      storyText = storyText.replace('{character}', character);
      storyText = storyText.replace('{action}', action);
      storyText = storyText.replace('{setting}', setting);
      storyText = storyText.replace('{consequence}', consequence);
      storyText = storyText.replace('{purpose}', purpose);
      storyText = storyText.replace('{discovery}', discovery);
      
      stories.push({
        content: storyText,
        character: character,
        action: action,
        setting: setting,
        type: 'story',
        confidence: 0.8,
        storytellingLevel: this.storytellingLevel
      });
    }
    
    return stories;
  }

  // Gera templates de história
  generateStoryTemplates(analysis, context) {
    const templates = [];
    const templateTemplates = [
      'Template: {character} + {action} + {setting} = {outcome}',
      'Estrutura: {beginning} → {middle} → {end}',
      'Padrão: {conflict} → {resolution} → {lesson}',
      'Fórmula: {hero} + {challenge} + {help} = {victory}'
    ];
    
    const characters = ['protagonista', 'herói', 'personagem principal', 'aventureiro'];
    const actions = ['aventura', 'descoberta', 'aprendizado', 'crescimento'];
    const settings = ['mundo mágico', 'floresta encantada', 'castelo real', 'cidade grande'];
    const outcomes = ['felicidade', 'sabedoria', 'amor', 'amizade'];
    const beginnings = ['introdução', 'apresentação', 'início', 'começo'];
    const middles = ['desenvolvimento', 'conflito', 'aventura', 'descoberta'];
    const ends = ['resolução', 'conclusão', 'final', 'desfecho'];
    const conflicts = ['problema', 'desafio', 'obstáculo', 'dificuldade'];
    const resolutions = ['solução', 'resposta', 'cura', 'ajuda'];
    const lessons = ['aprendizado', 'moral', 'ensinamento', 'lição'];
    const heroes = ['herói', 'heroína', 'protagonista', 'aventureiro'];
    const challenges = ['desafio', 'prova', 'teste', 'obstáculo'];
    const helps = ['ajuda', 'apoio', 'amizade', 'amor'];
    const victories = ['vitória', 'sucesso', 'conquista', 'realização'];
    
    for (let i = 0; i < 2; i++) {
      const template = templateTemplates[Math.floor(Math.random() * templateTemplates.length)];
      const character = characters[Math.floor(Math.random() * characters.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const setting = settings[Math.floor(Math.random() * settings.length)];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const beginning = beginnings[Math.floor(Math.random() * beginnings.length)];
      const middle = middles[Math.floor(Math.random() * middles.length)];
      const end = ends[Math.floor(Math.random() * ends.length)];
      const conflict = conflicts[Math.floor(Math.random() * conflicts.length)];
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];
      const lesson = lessons[Math.floor(Math.random() * lessons.length)];
      const hero = heroes[Math.floor(Math.random() * heroes.length)];
      const challenge = challenges[Math.floor(Math.random() * challenges.length)];
      const help = helps[Math.floor(Math.random() * helps.length)];
      const victory = victories[Math.floor(Math.random() * victories.length)];
      
      let templateText = template;
      templateText = templateText.replace('{character}', character);
      templateText = templateText.replace('{action}', action);
      templateText = templateText.replace('{setting}', setting);
      templateText = templateText.replace('{outcome}', outcome);
      templateText = templateText.replace('{beginning}', beginning);
      templateText = templateText.replace('{middle}', middle);
      templateText = templateText.replace('{end}', end);
      templateText = templateText.replace('{conflict}', conflict);
      templateText = templateText.replace('{resolution}', resolution);
      templateText = templateText.replace('{lesson}', lesson);
      templateText = templateText.replace('{hero}', hero);
      templateText = templateText.replace('{challenge}', challenge);
      templateText = templateText.replace('{help}', help);
      templateText = templateText.replace('{victory}', victory);
      
      templates.push({
        content: templateText,
        template: template,
        type: 'story_template',
        confidence: 0.7,
        storytellingLevel: this.storytellingLevel
      });
    }
    
    return templates;
  }

  // Gera elementos de história
  generateStoryElements(analysis, context) {
    const elements = [];
    const elementTemplates = [
      'Elemento: {element}',
      'Componente: {element}',
      'Parte: {element}',
      'Ingrediente: {element}'
    ];
    
    const elements_list = [
      'personagem principal',
      'conflito central',
      'cenário mágico',
      'lição moral',
      'aventura emocionante',
      'amizade verdadeira',
      'amor puro',
      'coragem e determinação'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = elementTemplates[Math.floor(Math.random() * elementTemplates.length)];
      const element = elements_list[Math.floor(Math.random() * elements_list.length)];
      const elementText = template.replace('{element}', element);
      
      elements.push({
        content: elementText,
        element: element,
        type: 'story_element',
        confidence: 0.6,
        storytellingLevel: this.storytellingLevel
      });
    }
    
    return elements;
  }

  // Gera personagens de história
  generateStoryCharacters(analysis, context) {
    const characters = [];
    const characterTemplates = [
      'Personagem: {character}',
      'Herói: {character}',
      'Protagonista: {character}',
      'Aventureiro: {character}'
    ];
    
    const characters_list = [
      'uma menina corajosa',
      'um menino inteligente',
      'um animal falante',
      'uma princesa bondosa',
      'um herói valente',
      'uma fada mágica',
      'um dragão amigável',
      'um sábio ancião'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = characterTemplates[Math.floor(Math.random() * characterTemplates.length)];
      const character = characters_list[Math.floor(Math.random() * characters_list.length)];
      const characterText = template.replace('{character}', character);
      
      characters.push({
        content: characterText,
        character: character,
        type: 'story_character',
        confidence: 0.7,
        storytellingLevel: this.storytellingLevel
      });
    }
    
    return characters;
  }

  // Gera enredo de história
  generateStoryPlot(analysis, context) {
    const plot = [];
    const plotTemplates = [
      'Enredo: {plot}',
      'História: {plot}',
      'Narrativa: {plot}',
      'Aventura: {plot}'
    ];
    
    const plots_list = [
      'uma jornada de descoberta',
      'uma aventura emocionante',
      'uma história de amizade',
      'uma lição de vida',
      'uma busca por felicidade',
      'uma descoberta mágica',
      'uma prova de coragem',
      'uma história de amor'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = plotTemplates[Math.floor(Math.random() * plotTemplates.length)];
      const plot_item = plots_list[Math.floor(Math.random() * plots_list.length)];
      const plotText = template.replace('{plot}', plot_item);
      
      plot.push({
        content: plotText,
        plot: plot_item,
        type: 'story_plot',
        confidence: 0.6,
        storytellingLevel: this.storytellingLevel
      });
    }
    
    return plot;
  }

  // Gera cenário de história
  generateStorySetting(analysis, context) {
    const setting = [];
    const settingTemplates = [
      'Cenário: {setting}',
      'Ambiente: {setting}',
      'Local: {setting}',
      'Mundo: {setting}'
    ];
    
    const settings_list = [
      'uma floresta encantada',
      'um castelo mágico',
      'uma montanha misteriosa',
      'um rio cristalino',
      'o céu estrelado',
      'uma cidade colorida',
      'um jardim secreto',
      'uma ilha perdida'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = settingTemplates[Math.floor(Math.random() * settingTemplates.length)];
      const setting_item = settings_list[Math.floor(Math.random() * settings_list.length)];
      const settingText = template.replace('{setting}', setting_item);
      
      setting.push({
        content: settingText,
        setting: setting_item,
        type: 'story_setting',
        confidence: 0.6,
        storytellingLevel: this.storytellingLevel
      });
    }
    
    return setting;
  }

  // Atualiza níveis de contação de histórias
  updateStorytellingLevels(analysis, stories) {
    // Atualiza nível de contação de histórias
    if (analysis.hasStoryElements) {
      this.storytellingLevel = Math.min(1, this.storytellingLevel + 0.02);
    }
    
    // Atualiza nível de criatividade
    if (stories.stories.length > 0) {
      this.creativityLevel = Math.min(1, this.creativityLevel + 0.03);
    }
    
    // Atualiza habilidades narrativas
    if (stories.storyTemplates.length > 0) {
      this.narrativeSkills = Math.min(1, this.narrativeSkills + 0.02);
    }
    
    // Atualiza nível de imaginação
    if (stories.storyElements.length > 0) {
      this.imaginationLevel = Math.min(1, this.imaginationLevel + 0.02);
    }
    
    // Aplica decaimento natural
    this.storytellingLevel *= 0.999;
    this.creativityLevel *= 0.998;
    this.narrativeSkills *= 0.997;
    this.imaginationLevel *= 0.998;
  }

  // Registra contação de histórias
  recordStorytelling(analysis, stories, timestamp) {
    const record = {
      timestamp,
      analysis,
      stories,
      storytellingLevel: this.storytellingLevel,
      creativityLevel: this.creativityLevel,
      narrativeSkills: this.narrativeSkills,
      imaginationLevel: this.imaginationLevel
    };
    
    this.storyHistory.push(record);
    
    // Mantém histórico limitado
    if (this.storyHistory.length > 300) {
      this.storyHistory = this.storyHistory.slice(-300);
    }
  }

  // Obtém estatísticas do contador de histórias
  getStoryTellerStats() {
    const stats = {
      storytellingLevel: this.storytellingLevel,
      creativityLevel: this.creativityLevel,
      narrativeSkills: this.narrativeSkills,
      imaginationLevel: this.imaginationLevel,
      totalStories: this.stories.size,
      totalTemplates: this.storyTemplates.size,
      totalElements: this.storyElements.size,
      recentStories: this.storyHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta contador de histórias
  resetStoryTeller() {
    this.storytellingLevel = 0.6;
    this.creativityLevel = 0.7;
    this.narrativeSkills = 0.5;
    this.imaginationLevel = 0.8;
    this.stories.clear();
    this.storyTemplates.clear();
    this.storyElements.clear();
    this.storyHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default StoryTeller;
