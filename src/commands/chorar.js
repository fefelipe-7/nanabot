// src/commands/chorar.js - Comando unificado n!chorar
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import emotionBase from '../modules/emotionBase.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'chorar',
  description: 'A Alice simula um choro dramático infantil (mini-evento)',
  category: 'afeto',
  aliases: ['cry', 'buaaa'],
  
  async execute(message, client) {
    console.log(`[CHORAR-COMMAND] 😭 Executando comando chorar para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Verifica se já está chorando
      const existingMode = await modeManager.isInMode(guildId, channelId, userId, 'crying');
      
      if (existingMode.active) {
        console.log(`[CHORAR-COMMAND] 😭 Já está chorando, intensificando drama`);
        await this.intensifyCrying(message, config);
        return;
      }
      
      // Inicia modo de choro
      const modeConfig = config.mode || {};
      const ttl = modeConfig.ttl || 300; // 5 minutos
      
      const cryingReason = this.generateCryingReason(config);
      const stateData = {
        reason: cryingReason,
        intensity: 1,
        startTime: Date.now()
      };
      
      const modeStarted = await modeManager.startMode(guildId, channelId, userId, 'crying', stateData, ttl);
      
      if (!modeStarted) {
        console.log(`[CHORAR-COMMAND] ❌ Falha ao iniciar modo de choro`);
        await message.reply(formatReply('Buaaa... 😭 *começa a chorar*'));
        return;
      }
      
      // Gera resposta dramática
      const cryingResponse = this.generateCryingResponse(cryingReason, config);
      
      // Aplica variação emocional
      const finalResponse = emotionBase.applyEmotionVariation(
        cryingResponse, 
        'low' // Intensidade baixa para choro
      );
      
      // Aplica nudge emocional
      emotionBase.applyEmotionalNudge('sadness', 1);
      
      await message.reply(formatReply(finalResponse));
      console.log(`[CHORAR-COMMAND] ✅ Modo de choro iniciado (TTL: ${ttl}s)`);
      
    } catch (error) {
      console.error(`[CHORAR-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Buaaa... 😭 *começa a chorar*'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.chorar || {};
    } catch (error) {
      console.error('[CHORAR-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Gera motivo do choro
  generateCryingReason(config) {
    const reasons = config.mode?.reasons || [
      "Meu biscoito caiu no chão!",
      "Ninguém quis brincar de boneca comigo!",
      "Perdi meu brinquedo favorito!",
      "Você não me deu atenção hoje!",
      "Meu desenho ficou feio!",
      "Quebrei meu copo favorito!",
      "Não consigo amarrar o cadarço!",
      "Esqueci onde guardei meu ursinho!"
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  },

  // Gera resposta do choro
  generateCryingResponse(reason, config) {
    const cryingPhrases = [
      `Buaaa... ${reason} 😭`,
      `😭 Buaaa... ${reason}`,
      `*começa a chorar* ${reason} buaaa... 😭`,
      `😭😭😭 ${reason} buaaa...`
    ];
    
    const phrase = cryingPhrases[Math.floor(Math.random() * cryingPhrases.length)];
    
    // Adiciona instruções de consolação
    const consolationHint = "\n\n*Se alguém me der um abraço, eu paro de chorar...* 🤗";
    
    return phrase + consolationHint;
  },

  // Intensifica o choro se já estiver chorando
  async intensifyCrying(message, config) {
    const intensifiedPhrases = [
      "Buaaa... buaaa... 😭😭😭 *chora mais forte*",
      "😭😭😭 *choro de novela* buaaa...",
      "*chora dramaticamente* buaaa... 😭😭😭",
      "Buaaa... 😭 *choro exagerado* buaaa... 😭"
    ];
    
    const phrase = intensifiedPhrases[Math.floor(Math.random() * intensifiedPhrases.length)];
    
    // Aplica variação emocional
    const finalPhrase = emotionBase.applyEmotionVariation(phrase, 'low');
    
    await message.reply(formatReply(finalPhrase));
  }
};
