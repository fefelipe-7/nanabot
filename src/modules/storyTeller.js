// src/modules/storyTeller.js - Contador de Histórias
import emotionBase from './emotionBase.js';
import apiRotator from '../utils/apiRotator.js';
import fs from 'fs';
import path from 'path';

class StoryTeller {
  constructor() {
    this.config = this.loadConfig();
    this.templates = this.loadTemplates();
  }

  // Carrega configuração dos comandos
  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('[STORY-TELLER] Erro ao carregar config:', error.message);
      return { commands: {}, global: { fallbackToOffline: true } };
    }
  }

  // Carrega templates de histórias
  loadTemplates() {
    return {
      daily: [
        "Hoje eu vi um passarinho azul e achei que era um super-herói voando!",
        "Eu tentei comer biscoito escondida, mas o suco caiu no chão!",
        "Sonhei que você tava lá na escola comigo e a gente brincava muito!",
        "Hoje aprendi uma música nova e cantei pra todos os meus brinquedos!",
        "Vi uma borboleta colorida e corri atrás dela pelo jardim!",
        "Tentei desenhar um gato, mas ficou parecendo um elefante!"
      ],
      fantasy: [
        "Era uma vez um dragão que tinha medo de voar...",
        "Tinha uma princesa que adorava brincar de esconde-esconde...",
        "Era uma vez um robô que queria aprender a dançar...",
        "Tinha uma fada que colecionava estrelas cadentes...",
        "Era uma vez um unicórnio que tinha alergia a arco-íris..."
      ],
      lessons: [
        "que a amizade é a coisa mais importante do mundo!",
        "que sempre devemos ajudar quem precisa!",
        "que ser gentil faz todo mundo feliz!",
        "que nunca devemos desistir dos nossos sonhos!",
        "que cada um é especial do seu jeito!",
        "que o amor vence qualquer medo!"
      ]
    };
  }

  // Gera história do dia (n!conta)
  async generateDailyStory(userPreferences = {}, useAI = false) {
    try {
      console.log(`[STORY-TELLER] Gerando história do dia (IA: ${useAI})`);

      if (useAI && this.config.commands.conta?.useAI) {
        return await this.generateWithAI('daily', userPreferences);
      }

      // Modo offline
      const template = this.getRandomTemplate('daily');
      let story = template;

      // Personaliza baseado nas preferências
      if (userPreferences.interests) {
        story = this.personalizeStory(story, userPreferences.interests);
      }

      // Aplica variação emocional
      story = emotionBase.applyEmotionVariation(story, emotionBase.getIntensityByMood());

      console.log(`[STORY-TELLER] História offline gerada`);
      return story;

    } catch (error) {
      console.error('[STORY-TELLER] Erro ao gerar história do dia:', error.message);
      return this.getRandomTemplate('daily');
    }
  }

  // Gera mini-fábula (n!historinha)
  async generateMiniFable(animal = null, theme = null, useAI = false) {
    try {
      console.log(`[STORY-TELLER] Gerando fábula (animal: ${animal}, tema: ${theme}, IA: ${useAI})`);

      if (useAI && this.config.commands.historinha?.useAI) {
        return await this.generateFableWithAI(animal, theme);
      }

      // Modo offline
      const beginning = "Era uma vez...";
      const middle = this.generateMiddle(animal, theme);
      const ending = this.generateEnding();

      let fable = `${beginning} ${middle} ${ending}`;

      // Aplica variação emocional
      fable = emotionBase.applyEmotionVariation(fable, emotionBase.getIntensityByMood());

      console.log(`[STORY-TELLER] Fábula offline gerada`);
      return fable;

    } catch (error) {
      console.error('[STORY-TELLER] Erro ao gerar fábula:', error.message);
      return "Era uma vez um animal muito especial que ensinou uma lição importante sobre amizade!";
    }
  }

  // Gera memória personalizada (n!memoria)
  async generateMemory(contextHistory = [], useAI = false) {
    try {
      console.log(`[STORY-TELLER] Gerando memória (IA: ${useAI})`);

      if (useAI && this.config.commands.memoria?.useAI) {
        return await this.generateMemoryWithAI(contextHistory);
      }

      // Modo offline - usa histórico se disponível
      if (contextHistory.length > 0) {
        const recentMemory = this.extractMemoryFromHistory(contextHistory);
        if (recentMemory) {
          return emotionBase.applyEmotionVariation(recentMemory, 'medium');
        }
      }

      // Fallback - memória inventada fofinha
      const fallbackMemories = [
        "Lembro que uma vez você me contou uma coisa muito legal...",
        "Tenho uma lembrança fofa nossa guardada no coração...",
        "Lembro que você sempre foi muito carinhoso comigo...",
        "Tenho uma memória especial nossa que me faz sorrir..."
      ];

      const memory = fallbackMemories[Math.floor(Math.random() * fallbackMemories.length)];
      return emotionBase.applyEmotionVariation(memory, 'medium');

    } catch (error) {
      console.error('[STORY-TELLER] Erro ao gerar memória:', error.message);
      return "Tenho muitas lembranças especiais nossas guardadas no coração! 💕";
    }
  }

  // Gera cenário de fantasia (n!fantasia)
  async generateFantasyScenario(scenarioType = null, useAI = false) {
    try {
      console.log(`[STORY-TELLER] Gerando cenário de fantasia (IA: ${useAI})`);

      if (useAI && this.config.commands.fantasia?.useAI) {
        return await this.generateFantasyWithAI(scenarioType);
      }

      // Modo offline
      const scenarios = this.config.commands.fantasia?.mode?.scenarios || [
        "Vamos fingir que estamos em um castelo gigante e você é o rei!",
        "Eu sou uma astronauta e você tem que pilotar a nave comigo!",
        "Vamos brincar que somos super-heróis salvando o mundo!",
        "Que tal fingirmos que estamos numa floresta mágica?"
      ];

      const scenario = scenarioType ? 
        scenarios.find(s => s.toLowerCase().includes(scenarioType.toLowerCase())) || scenarios[0] :
        scenarios[Math.floor(Math.random() * scenarios.length)];

      return emotionBase.applyEmotionVariation(scenario, 'high');

    } catch (error) {
      console.error('[STORY-TELLER] Erro ao gerar fantasia:', error.message);
      return "Vamos brincar de faz de conta! Que aventura você quer viver?";
    }
  }

  // Gera com IA
  async generateWithAI(type, context = {}) {
    try {
      const prompt = this.buildAIPrompt(type, context);
      const response = await apiRotator.makeRequest(prompt, { username: 'Alice' });
      
      console.log(`[STORY-TELLER] História gerada com IA`);
      return response;

    } catch (error) {
      console.error('[STORY-TELLER] Erro na IA, usando fallback:', error.message);
      return this.getRandomTemplate(type);
    }
  }

  // Constrói prompt para IA
  buildAIPrompt(type, context) {
    const basePrompt = "Você é Alice, uma menina de 4 anos muito carinhosa e inteligente. ";
    
    switch (type) {
      case 'daily':
        return `${basePrompt}Conte uma história curta e fofa sobre algo que aconteceu no seu dia hoje. Use linguagem infantil e seja carinhosa.`;
      
      case 'fable':
        return `${basePrompt}Crie uma mini-fábula infantil com começo "Era uma vez...", meio e uma lição simples no final. Seja fofa e educativa.`;
      
      case 'memory':
        return `${basePrompt}Crie uma memória fofa e carinhosa sobre uma interação especial. Seja nostálgica mas alegre.`;
      
      case 'fantasy':
        return `${basePrompt}Crie um cenário de brincadeira de faz de conta divertido e interativo. Convide para uma aventura imaginária.`;
      
      default:
        return `${basePrompt}Conte algo fofo e carinhoso.`;
    }
  }

  // Seleciona template aleatório
  getRandomTemplate(type) {
    const templates = this.templates[type] || this.templates.daily;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Personaliza história com interesses
  personalizeStory(story, interests) {
    if (!interests || interests.length === 0) return story;

    const interest = interests[Math.floor(Math.random() * interests.length)];
    
    // Substitui elementos genéricos por específicos
    const replacements = {
      'passarinho': interest === 'futebol' ? 'bola' : 'passarinho',
      'brinquedo': interest === 'música' ? 'instrumento' : 'brinquedo',
      'jardim': interest === 'natureza' ? 'floresta' : 'jardim'
    };

    let personalizedStory = story;
    Object.entries(replacements).forEach(([original, replacement]) => {
      personalizedStory = personalizedStory.replace(original, replacement);
    });

    return personalizedStory;
  }

  // Gera meio da fábula
  generateMiddle(animal, theme) {
    const animals = animal ? [animal] : ['gato', 'cachorro', 'coelho', 'pássaro', 'borboleta'];
    const themes = theme ? [theme] : ['amizade', 'coragem', 'gentileza', 'sonhos'];
    
    const selectedAnimal = animals[Math.floor(Math.random() * animals.length)];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    
    const middleTemplates = [
      `um ${selectedAnimal} muito especial que descobriu ${selectedTheme}`,
      `uma ${selectedAnimal} que ensinou sobre ${selectedTheme}`,
      `um ${selectedAnimal} que viveu uma aventura sobre ${selectedTheme}`
    ];
    
    return middleTemplates[Math.floor(Math.random() * middleTemplates.length)];
  }

  // Gera final da fábula
  generateEnding() {
    const lesson = this.templates.lessons[Math.floor(Math.random() * this.templates.lessons.length)];
    return `E a lição que aprendemos foi ${lesson}`;
  }

  // Extrai memória do histórico
  extractMemoryFromHistory(history) {
    if (history.length === 0) return null;
    
    // Busca por interações positivas recentes
    const positiveInteractions = history.filter(msg => 
      msg.content && (
        msg.content.includes('abraço') ||
        msg.content.includes('brincar') ||
        msg.content.includes('história') ||
        msg.content.includes('especial')
      )
    );
    
    if (positiveInteractions.length > 0) {
      const interaction = positiveInteractions[0];
      return `Lembro quando você disse "${interaction.content.substring(0, 50)}..." - foi muito especial!`;
    }
    
    return null;
  }

  // Gera fábula com IA
  async generateFableWithAI(animal, theme) {
    const prompt = this.buildAIPrompt('fable', { animal, theme });
    return await apiRotator.makeRequest(prompt, { username: 'Alice' });
  }

  // Gera memória com IA
  async generateMemoryWithAI(contextHistory) {
    const prompt = this.buildAIPrompt('memory', { history: contextHistory });
    return await apiRotator.makeRequest(prompt, { username: 'Alice' });
  }

  // Gera fantasia com IA
  async generateFantasyWithAI(scenarioType) {
    const prompt = this.buildAIPrompt('fantasy', { scenario: scenarioType });
    return await apiRotator.makeRequest(prompt, { username: 'Alice' });
  }
}

export default new StoryTeller();
