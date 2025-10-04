// src/commands/boneca/dancinha.js - Comando para atividade dancinha
import { formatReply } from '../../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'dancinha',
  description: 'Fazer uma dancinha com a bonequinha',
  category: 'boneca',
  aliases: ['dancar', 'dance'],

  async execute(message, client) {
    console.log(`[DANCINHA-COMMAND] 💃 Executando comando dancinha para ${message.author.username}`);

    try {
      await BonecaManager.processActivity(message, 'dancinha');
    } catch (error) {
      console.error(`[DANCINHA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com a dancinha da bonequinha... 😅'));
    }
  }
};
