// src/commands/elogio.js - Comando unificado n!elogio (APRIMORADO)
import { formatReply } from '../utils/formatReply.js';
import emotionBase from '../modules/emotionBase.js';
import affectionService from '../modules/affectionService.js';
import storyTeller from '../modules/storyTeller.js';
import cooldownManager from '../modules/cooldownManager.js';
import contextIntelligence from '../modules/contextIntelligence.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'elogio',
  description: 'A Alice gera um elogio espontâneo e carinhoso',
  category: 'afeto',
  aliases: ['elogiar', 'compliment'],
  
  async execute(message, client) {
    console.log(`[ELOGIO-COMMAND] 💕 Executando comando elogio para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Verifica cooldown
      const cooldownLeft = await cooldownManager.isOnCooldown(userId, guildId, 'elogio');
      if (cooldownLeft) {
        console.log(`[ELOGIO-COMMAND] ⏰ Comando em cooldown: ${cooldownLeft}s restantes`);
        await message.reply(formatReply(`Calma aí! Deixa eu pensar em outro elogio... ⏰ (${cooldownLeft}s)`));
        return;
      }
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Analisa contexto do usuário
      const userContext = await contextIntelligence.analyzeUserContext(guildId, userId, channelId);
      console.log(`[ELOGIO-COMMAND] 🧠 Contexto analisado: ${userContext.affectionLevelName} (${userContext.relationshipStatus})`);
      
      // Atualiza interação no serviço de afeto
      await affectionService.updateLastInteraction(guildId, userId);
      
      // Gera elogio personalizado
      const compliment = await this.generatePersonalizedCompliment(userContext, config);
      
      // Aplica variação emocional baseada no contexto
      const emotionIntensity = this.getEmotionIntensity(userContext);
      const finalCompliment = emotionBase.applyEmotionVariation(compliment, emotionIntensity);
      
      // Define cooldown dinâmico
      const cooldownDuration = cooldownManager.calculateDynamicCooldown('elogio', userContext.stats);
      await cooldownManager.setCooldown(userId, guildId, 'elogio', cooldownDuration);
      
      await message.reply(formatReply(finalCompliment));
      console.log(`[ELOGIO-COMMAND] ✅ Elogio personalizado enviado (cooldown: ${cooldownDuration}s)`);
      
    } catch (error) {
      console.error(`[ELOGIO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Você é muito especial pra mim! 💕'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.elogio || {};
    } catch (error) {
      console.error('[ELOGIO-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Gera elogio personalizado baseado no contexto
  async generatePersonalizedCompliment(userContext, config) {
    try {
      // Verifica se deve usar IA
      const useAI = config.useAI && await this.isAIAvailable();
      
      if (useAI) {
        console.log(`[ELOGIO-COMMAND] 🤖 Gerando elogio personalizado com IA`);
        return await this.generateWithAI(userContext);
      }
      
      // Modo offline personalizado
      console.log(`[ELOGIO-COMMAND] 📝 Gerando elogio personalizado offline`);
      return this.generatePersonalizedOffline(userContext, config);
      
    } catch (error) {
      console.error('[ELOGIO-COMMAND] Erro ao gerar elogio personalizado:', error.message);
      return this.generatePersonalizedOffline(userContext, config);
    }
  },

  // Gera elogio offline
  generateOffline(config) {
    const templates = config.templates || {
      fisico: ["Você é tão cheiroso!", "Seu cabelo está lindo hoje!"],
      emocional: ["Gosto quando você sorri!", "Você me faz sentir especial!"],
      engraçado: ["Você é meu herói, mesmo quando não alcança o armário!"]
    };
    
    // Seleciona categoria aleatória
    const categories = Object.keys(templates);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const categoryTemplates = templates[category];
    
    // Seleciona template aleatório
    const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    
    return template;
  },

  // Gera elogio com IA
  async generateWithAI(guildId, userId) {
    try {
      const affectionLevel = await affectionService.calculateAffectionLevel(guildId, userId);
      const affectionLevelName = affectionService.getAffectionLevel(affectionLevel);
      
      const prompt = `Você é Alice, uma menina de 4 anos muito carinhosa. 
      Gere um elogio espontâneo e fofo para alguém especial. 
      Nível de afeto: ${affectionLevelName}
      Seja infantil, carinhosa e use linguagem simples. 
      Máximo 2 frases.`;
      
      const response = await storyTeller.generateWithAI('compliment', { affectionLevel });
      return response;
      
    } catch (error) {
      console.error('[ELOGIO-COMMAND] Erro na IA:', error.message);
      return this.generateOffline({});
    }
  },

  // Gera elogio personalizado offline
  generatePersonalizedOffline(userContext, config) {
    const templates = config.templates || {
      fisico: ["Você é tão cheiroso!", "Seu cabelo está lindo hoje!", "Você tem um sorriso lindo!"],
      emocional: ["Gosto quando você sorri!", "Você me faz sentir especial!", "Você é muito carinhoso!"],
      engraçado: ["Você é meu herói, mesmo quando não alcança o armário!", "Você é tão engraçado que até os passarinhos riem!"],
      inteligente: ["Você é muito esperto!", "Você sabe de tudo!", "Você é o mais inteligente que eu conheço!"],
      especial: ["Você é único!", "Não existe ninguém como você!", "Você é especial demais!"]
    };
    
    // Seleciona categoria baseada no contexto
    let category = this.selectCategoryByContext(userContext);
    let categoryTemplates = templates[category] || templates.especial;
    
    // Seleciona template aleatório
    const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    
    // Personaliza baseado no relacionamento
    const personalizedTemplate = this.personalizeTemplate(template, userContext);
    
    return personalizedTemplate;
  },

  // Seleciona categoria baseada no contexto
  selectCategoryByContext(userContext) {
    const { affectionLevel, relationshipStatus, preferences, temporalContext } = userContext;
    
    // Melhores amigos recebem elogios mais especiais
    if (relationshipStatus === 'best_friend') {
      return 'especial';
    }
    
    // Baseado no nível de afeto
    if (affectionLevel > 0.8) {
      return 'especial';
    } else if (affectionLevel > 0.6) {
      return 'emocional';
    } else if (affectionLevel > 0.4) {
      return 'inteligente';
    }
    
    // Baseado no horário
    if (temporalContext.timeOfDay === 'morning') {
      return 'fisico';
    } else if (temporalContext.timeOfDay === 'night') {
      return 'emocional';
    }
    
    // Baseado em preferências detectadas
    if (preferences.topics.includes('games')) {
      return 'inteligente';
    }
    
    return 'emocional'; // Padrão
  },

  // Personaliza template baseado no contexto
  personalizeTemplate(template, userContext) {
    const { relationshipStatus, temporalContext, preferences } = userContext;
    
    let personalized = template;
    
    // Adiciona elementos baseados no relacionamento
    if (relationshipStatus === 'best_friend') {
      personalized = personalized.replace('Você', 'Meu melhor amigo');
    } else if (relationshipStatus === 'close_friend') {
      personalized = personalized.replace('Você', 'Meu amigo especial');
    }
    
    // Adiciona elementos temporais
    if (temporalContext.timeOfDay === 'morning') {
      personalized += ' Bom dia! ☀️';
    } else if (temporalContext.timeOfDay === 'night') {
      personalized += ' Boa noite! 🌙';
    }
    
    // Adiciona elementos baseados em preferências
    if (preferences.topics.includes('games')) {
      personalized += ' Você deve ser muito bom nos jogos! 🎮';
    }
    
    return personalized;
  },

  // Obtém intensidade emocional baseada no contexto
  getEmotionIntensity(userContext) {
    const { affectionLevel, relationshipStatus, temporalContext } = userContext;
    
    // Melhores amigos = alta intensidade
    if (relationshipStatus === 'best_friend') {
      return 'high';
    }
    
    // Alto afeto = média intensidade
    if (affectionLevel > 0.7) {
      return 'medium';
    }
    
    // Manhã = alta energia
    if (temporalContext.timeOfDay === 'morning') {
      return 'high';
    }
    
    // Noite = baixa energia
    if (temporalContext.timeOfDay === 'night') {
      return 'low';
    }
    
    return 'medium'; // Padrão
  },

  // Gera elogio com IA usando contexto
  async generateWithAI(userContext) {
    try {
      const prompt = `Você é Alice, uma menina de 4 anos muito carinhosa.
      
Contexto do usuário:
- Nível de afeto: ${userContext.affectionLevelName}
- Relacionamento: ${userContext.relationshipStatus}
- Horário: ${userContext.temporalContext.timeOfDay}
- Interesses: ${userContext.preferences.topics.join(', ') || 'não detectados'}

Gere um elogio personalizado e fofo baseado neste contexto.
Seja infantil, carinhosa e use linguagem simples.
Máximo 2 frases.`;

      const response = await storyTeller.generateWithAI('compliment', { userContext });
      return response;
      
    } catch (error) {
      console.error('[ELOGIO-COMMAND] Erro na IA:', error.message);
      return this.generatePersonalizedOffline(userContext, {});
    }
  },

  // Verifica se IA está disponível
  async isAIAvailable() {
    try {
      // Verifica se apiRotator tem modelos ativos
      const apiRotator = await import('../utils/apiRotator.js');
      const stats = apiRotator.default.getStats();
      return stats.activeModels > 0;
    } catch (error) {
      return false;
    }
  }
};
