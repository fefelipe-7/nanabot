// src/commands/conta.js - Comando unificado n!conta
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import storyTeller from '../modules/storyTeller.js';
import emotionBase from '../modules/emotionBase.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'conta',
  description: 'A Alice conta algo do seu dia com slot-filling leve',
  category: 'historias',
  aliases: ['conta', 'story', 'dia'],
  
  async execute(message, client) {
    console.log(`[CONTA-COMMAND] 📖 Executando comando conta para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Verifica se está aguardando slot-filling
      const waitingForSlot = await modeManager.isWaitingForSlotFilling(guildId, channelId, userId);
      
      if (waitingForSlot) {
        console.log(`[CONTA-COMMAND] 📝 Processando resposta do slot-filling`);
        await this.processSlotFillingResponse(message, waitingForSlot, config);
        return;
      }
      
      // Verifica se deve usar slot-filling
      const useSlotFilling = config.slotFilling?.enabled !== false;
      
      if (useSlotFilling) {
        console.log(`[CONTA-COMMAND] ❓ Iniciando slot-filling`);
        await this.startSlotFilling(message, config);
        return;
      }
      
      // Gera história diretamente
      await this.generateStoryDirectly(message, config);
      
    } catch (error) {
      console.error(`[CONTA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Hoje eu vi um passarinho azul e achei que era um super-herói voando! 🐦✨'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.conta || {};
    } catch (error) {
      console.error('[CONTA-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Inicia slot-filling
  async startSlotFilling(message, config) {
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    const questions = config.slotFilling?.questions || {
      length: "Quer que eu conte uma história curta ou longa?",
      theme: "Sobre o que você quer que eu conte? (animais, brincadeiras, sonhos...)"
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
      console.log(`[CONTA-COMMAND] ✅ Slot-filling iniciado (TTL: ${ttl}s)`);
    } else {
      await this.generateStoryDirectly(message, config);
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
      console.log(`[CONTA-COMMAND] 📝 Resposta processada: "${userResponse}"`);
      
      // Gera história baseada na resposta
      await this.generateStoryWithContext(message, userResponse, config);
    } else {
      await this.generateStoryDirectly(message, config);
    }
  },

  // Gera história com contexto
  async generateStoryWithContext(message, userResponse, config) {
    try {
      // Determina se deve usar IA
      const useAI = config.useAI && await this.isAIAvailable();
      
      // Prepara contexto baseado na resposta
      const context = this.parseUserResponse(userResponse);
      
      // Gera história
      const story = await storyTeller.generateDailyStory(context, useAI);
      
      // Aplica variação emocional
      const finalStory = emotionBase.applyEmotionVariation(story, emotionBase.getIntensityByMood());
      
      await message.reply(formatReply(finalStory));
      console.log(`[CONTA-COMMAND] ✅ História com contexto gerada`);
      
    } catch (error) {
      console.error('[CONTA-COMMAND] Erro ao gerar história com contexto:', error.message);
      await this.generateStoryDirectly(message, config);
    }
  },

  // Gera história diretamente
  async generateStoryDirectly(message, config) {
    try {
      // Determina se deve usar IA
      const useAI = config.useAI && await this.isAIAvailable();
      
      // Gera história
      const story = await storyTeller.generateDailyStory({}, useAI);
      
      // Aplica variação emocional
      const finalStory = emotionBase.applyEmotionVariation(story, emotionBase.getIntensityByMood());
      
      await message.reply(formatReply(finalStory));
      console.log(`[CONTA-COMMAND] ✅ História direta gerada`);
      
    } catch (error) {
      console.error('[CONTA-COMMAND] Erro ao gerar história direta:', error.message);
      await message.reply(formatReply('Hoje eu vi um passarinho azul e achei que era um super-herói voando! 🐦✨'));
    }
  },

  // Analisa resposta do usuário
  parseUserResponse(response) {
    const lowerResponse = response.toLowerCase();
    
    const context = {
      length: 'medium',
      theme: 'daily',
      interests: []
    };
    
    // Detecta comprimento
    if (lowerResponse.includes('curta') || lowerResponse.includes('curto')) {
      context.length = 'short';
    } else if (lowerResponse.includes('longa') || lowerResponse.includes('longo')) {
      context.length = 'long';
    }
    
    // Detecta tema
    if (lowerResponse.includes('animal')) {
      context.theme = 'animals';
      context.interests.push('animais');
    } else if (lowerResponse.includes('brincadeira')) {
      context.theme = 'play';
      context.interests.push('brincadeiras');
    } else if (lowerResponse.includes('sonho')) {
      context.theme = 'dreams';
      context.interests.push('sonhos');
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
