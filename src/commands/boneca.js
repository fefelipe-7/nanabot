// src/commands/boneca.js - Comando principal n!boneca
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import emotionBase from '../modules/emotionBase.js';
import variationEngine from '../modules/variationEngine.js';
import contextManager from '../modules/contextManager.js';
import { EmbedBuilder } from 'discord.js';
import BonecaManager from './boneca/BonecaManager.js';
import StageHandler from './boneca/StageHandler.js';
import ActivityHandler from './boneca/ActivityHandler.js';

export default {
  commandName: 'boneca',
  description: 'Modo especial: brincar de boneca com a Alice',
  category: 'afeto',
  aliases: ['bonequinha', 'doll', 'brincar-boneca'],

  async execute(message, client) {
    console.log(`[BONECA-COMMAND] 🎀 Executando comando boneca para ${message.author.username}`);

    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;

      // Verifica se já está em modo boneca
      const existingMode = await modeManager.isInMode(guildId, channelId, userId, 'boneca');
      
      if (existingMode.active) {
        await BonecaManager.continueBonecaMode(message, existingMode);
        return;
      }

      // Inicia modo boneca
      await BonecaManager.startBonecaMode(message);
      
    } catch (error) {
      console.error(`[BONECA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha para brincar de boneca... 😅'));
    }
  }
};
