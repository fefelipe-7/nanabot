// src/commands/historinha.js - Comando unificado n!historinha
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import storyTeller from '../modules/storyTeller.js';
import emotionBase from '../modules/emotionBase.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'historinha',
  description: 'A Alice conta uma mini-fábula infantil com slot-filling',
  category: 'historias',
  aliases: ['fábula', 'fabula', 'fable', 'historia'],
  
  async execute(message, client) {
    console.log(`[HISTORINHA-COMMAND] 📚 Executando comando historinha para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Verifica se está aguardando slot-filling
      const waitingForSlot = await modeManager.isWaitingForSlotFilling(guildId, channelId, userId);
      
      if (waitingForSlot) {
        console.log(`[HISTORINHA-COMMAND] 📝 Processando resposta do slot-filling`);
        await this.processSlotFillingResponse(message, waitingForSlot, config);
        return;
      }
      
      // Verifica se deve usar slot-filling
      const useSlotFilling = config.slotFilling?.enabled !== false;
      
      if (useSlotFilling) {
        console.log(`[HISTORINHA-COMMAND] ❓ Iniciando slot-filling`);
        await this.startSlotFilling(message, config);
        return;
      }
      
      // Gera fábula diretamente
      await this.generateFableDirectly(message, config);
      
    } catch (error) {
      console.error(`[HISTORINHA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Era uma vez um animal muito especial que ensinou uma lição importante sobre amizade! 🐰💕'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.historinha || {};
    } catch (error) {
      console.error('[HISTORINHA-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Inicia slot-filling
  async startSlotFilling(message, config) {
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    const questions = config.slotFilling?.questions || {
      animal: "Me fala um animal que você gosta!",
      theme: "Que tipo de história você quer? (aventura, fada, herói...)"
    };
    
    // Seleciona pergunta aleatória
    const questionKeys = Object.keys(questions);
    const selectedQuestion = questionKeys[Math.floor(Math.random() * questionKeys.length)];
    const question = questions[selectedQuestion];
    
    const ttl = config.slotFilling?.ttl || 60;
    
    const modeStarted = await modeManager.startSlotFilling(
      guildId, 
      channelId, 
      userId, 
      question, 
      selectedQuestion, 
      ttl
    );
    
    if (modeStarted) {
      await message.reply(formatReply(question));
      console.log(`[HISTORINHA-COMMAND] ✅ Slot-filling iniciado (TTL: ${ttl}s)`);
    } else {
      await this.generateFableDirectly(message, config);
    }
  },

  // Processa resposta do slot-filling
  async processSlotFillingResponse(message, slotInfo, config) {
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    const userResponse = message.content.trim();
    
    // Processa resposta
    const processedState = await modeManager.processSlotFillingResponse(
      guildId, 
      channelId, 
      userId, 
      userResponse
    );
    
    if (processedState) {
      console.log(`[HISTORINHA-COMMAND] 📝 Resposta processada: "${userResponse}"`);
      
      // Gera fábula baseada na resposta
      await this.generateFableWithContext(message, userResponse, config);
    } else {
      await this.generateFableDirectly(message, config);
    }
  },

  // Gera fábula com contexto
  async generateFableWithContext(message, userResponse, config) {
    try {
      // Determina se deve usar IA
      const useAI = config.useAI && await this.isAIAvailable();
      
      // Prepara contexto baseado na resposta
      const context = this.parseUserResponse(userResponse);
      
      // Gera fábula
      const fable = await storyTeller.generateMiniFable(context.animal, context.theme, useAI);
      
      // Aplica variação emocional
      const finalFable = emotionBase.applyEmotionVariation(fable, emotionBase.getIntensityByMood());
      
      await message.reply(formatReply(finalFable));
      console.log(`[HISTORINHA-COMMAND] ✅ Fábula com contexto gerada`);
      
    } catch (error) {
      console.error('[HISTORINHA-COMMAND] Erro ao gerar fábula com contexto:', error.message);
      await this.generateFableDirectly(message, config);
    }
  },

  // Gera fábula diretamente
  async generateFableDirectly(message, config) {
    try {
      // Determina se deve usar IA
      const useAI = config.useAI && await this.isAIAvailable();
      
      // Gera fábula
      const fable = await storyTeller.generateMiniFable(null, null, useAI);
      
      // Aplica variação emocional
      const finalFable = emotionBase.applyEmotionVariation(fable, emotionBase.getIntensityByMood());
      
      await message.reply(formatReply(finalFable));
      console.log(`[HISTORINHA-COMMAND] ✅ Fábula direta gerada`);
      
    } catch (error) {
      console.error('[HISTORINHA-COMMAND] Erro ao gerar fábula direta:', error.message);
      await message.reply(formatReply('Era uma vez um animal muito especial que ensinou uma lição importante sobre amizade! 🐰💕'));
    }
  },

  // Analisa resposta do usuário
  parseUserResponse(response) {
    const lowerResponse = response.toLowerCase();
    
    const context = {
      animal: null,
      theme: null
    };
    
    // Detecta animal
    const animals = ['gato', 'cachorro', 'coelho', 'pássaro', 'borboleta', 'elefante', 'leão', 'tigre', 'urso', 'peixe'];
    for (const animal of animals) {
      if (lowerResponse.includes(animal)) {
        context.animal = animal;
        break;
      }
    }
    
    // Detecta tema
    if (lowerResponse.includes('aventura')) {
      context.theme = 'aventura';
    } else if (lowerResponse.includes('fada')) {
      context.theme = 'fada';
    } else if (lowerResponse.includes('herói') || lowerResponse.includes('heroi')) {
      context.theme = 'herói';
    } else if (lowerResponse.includes('amizade')) {
      context.theme = 'amizade';
    } else if (lowerResponse.includes('coragem')) {
      context.theme = 'coragem';
    }
    
    return context;
  },

  // Verifica se IA está disponível
  async isAIAvailable() {
    try {
      const apiRotator = await import('../utils/apiRotator.js');
      const stats = apiRotator.default.getStats();
      return stats.activeModels > 0;
    } catch (error) {
      return false;
    }
  }
};
