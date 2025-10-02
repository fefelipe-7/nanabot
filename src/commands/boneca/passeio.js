// src/commands/boneca/passeio.js - Comando para atividade passeio
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'passeio',
  description: 'Levar a bonequinha para passear',
  category: 'boneca',
  aliases: ['walk', 'andar'],

  async execute(message, client) {
    console.log(`[PASSEIO-COMMAND] 🛝 Executando comando passeio para ${message.author.username}`);

    try {
      await BonecaManager.processActivity(message, 'passeio');
    } catch (error) {
      console.error(`[PASSEIO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o passeio da bonequinha... 😅'));
    }
  }
};
