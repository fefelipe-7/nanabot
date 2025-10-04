// src/commands/fim.js - Comando para finalizar modo boneca
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './boneca/BonecaManager.js';

export default {
  commandName: 'fim',
  description: 'Finalizar o modo boneca e guardar a bonequinha',
  category: 'boneca',
  aliases: ['acabar', 'terminar', 'end'],

  async execute(message, client) {
    console.log(`[FILL-COMMAND] 😴 Executando comando fim para ${message.author.username}`);

    try {
      // Processa atividade usando BonecaManager
      await BonecaManager.processActivity(message, 'fim');
      
    } catch (error) {
      console.error(`[FILL-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('ops! Tive um probleminha para finalizar o modo boneca... 😅'));
    }
  }
};