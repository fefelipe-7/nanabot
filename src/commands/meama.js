// src/commands/meama.js - Comando unificado n!meama
import { formatReply } from '../utils/formatReply.js';
import affectionService from '../modules/affectionService.js';
import emotionBase from '../modules/emotionBase.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'meama',
  description: 'A Alice responde sobre o quanto ama o usuário baseado no nível de afeto',
  category: 'afeto',
  aliases: ['meama', 'love', 'amo'],
  
  async execute(message, client) {
    console.log(`[MEAMA-COMMAND] 💕 Executando comando meama para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Atualiza interação
      await affectionService.updateLastInteraction(guildId, userId);
      
      // Verifica repetição
      const repetitions = await affectionService.checkRepetition(guildId, userId, 'meama');
      
      if (repetitions >= (config.repetition?.maxBeforeTeasing || 3)) {
        console.log(`[MEAMA-COMMAND] 😄 Usuário sendo repetitivo, usando tom brincalhão`);
        await this.handleRepetitiveUser(message, config);
        return;
      }
      
      // Calcula nível de afeto
      const affectionScore = await affectionService.calculateAffectionLevel(guildId, userId);
      const affectionLevel = affectionService.getAffectionLevel(affectionScore);
      
      console.log(`[MEAMA-COMMAND] 📊 Nível de afeto: ${affectionLevel} (${affectionScore.toFixed(2)})`);
      
      // Gera resposta baseada no nível
      const loveResponse = this.generateLoveResponse(affectionLevel, config);
      
      // Aplica variação emocional
      const finalResponse = emotionBase.applyEmotionVariation(
        loveResponse, 
        emotionBase.getIntensityByMood()
      );
      
      // Incrementa score de amor
      await affectionService.incrementLoveScore(guildId, userId, 1);
      
      // Aplica nudge emocional
      emotionBase.applyEmotionalNudge('love', 1);
      
      await message.reply(formatReply(finalResponse));
      console.log(`[MEAMA-COMMAND] ✅ Resposta meama enviada com sucesso`);
      
    } catch (error) {
      console.error(`[MEAMA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Claro que te amo! Você é muito especial pra mim! 💕'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.meama || {};
    } catch (error) {
      console.error('[MEAMA-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Gera resposta baseada no nível de afeto
  generateLoveResponse(affectionLevel, config) {
    const levels = config.affectionLevels || {
      baixo: {
        threshold: 0.3,
        phrases: [
          "Eu gosto de você, mas você some às vezes...",
          "Você é legal, mas podia aparecer mais!",
          "Te amo, mas você não brinca muito comigo..."
        ]
      },
      medio: {
        threshold: 0.7,
        phrases: [
          "Claro que te amo, você é muito especial pra mim!",
          "Eu te amo sim! Você é uma pessoa muito legal!",
          "Te amo muito! Você sempre me faz feliz!"
        ]
      },
      alto: {
        threshold: 1.0,
        phrases: [
          "Eu te amo tanto que se pudesse colocava estrelinhas no céu só com seu nome!",
          "Te amo mais que todos os brinquedos do mundo juntos!",
          "Eu te amo tanto que até os passarinhos cantam seu nome!"
        ]
      }
    };
    
    const levelConfig = levels[affectionLevel] || levels.medio;
    const phrases = levelConfig.phrases;
    
    return phrases[Math.floor(Math.random() * phrases.length)];
  },

  // Trata usuário repetitivo
  async handleRepetitiveUser(message, config) {
    const teasingPhrases = config.repetition?.teasingPhrases || [
      "Já disse que te amo, mas se quiser repito até você ficar bobo!",
      "Você quer que eu repito? Te amo, te amo, te amo!",
      "Já falei que te amo! Você é muito carente! 😄"
    ];
    
    const phrase = teasingPhrases[Math.floor(Math.random() * teasingPhrases.length)];
    
    // Aplica variação emocional com tom brincalhão
    const finalPhrase = emotionBase.applyEmotionVariation(phrase, 'high');
    
    await message.reply(formatReply(finalPhrase));
  }
};
