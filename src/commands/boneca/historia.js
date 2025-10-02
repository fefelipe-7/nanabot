// src/commands/boneca/historia.js - Comando para atividade história
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'historia',
  description: 'Contar uma historinha para a bonequinha',
  category: 'boneca',
  aliases: ['story', 'conto'],

  async execute(message, client) {
    console.log(`[HISTORIA-COMMAND] 📚 Executando comando historia para ${message.author.username}`);

    try {
      await BonecaManager.processActivity(message, 'historia');
    } catch (error) {
      console.error(`[HISTORIA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com a história da bonequinha... 😅'));
    }
  }
};
