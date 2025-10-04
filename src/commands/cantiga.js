// src/commands/cantiga.js - Comando para atividade cantiga
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './boneca/BonecaManager.js';

export default {
  commandName: 'cantiga',
  description: 'Cantar uma musiquinha para a bonequinha',
  category: 'boneca',
  aliases: ['cantar', 'musica', 'song'],

  async execute(message, client) {
    console.log(`[CANTIGA-COMMAND] 🎵 Executando comando cantiga para ${message.author.username}`);

    try {
      // Processa atividade usando BonecaManager
      await BonecaManager.processActivity(message, 'cantiga');
      
    } catch (error) {
      console.error(`[CANTIGA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com a cantiga da bonequinha... 😅'));
    }
  }
};
