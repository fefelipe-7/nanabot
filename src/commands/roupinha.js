// src/commands/roupinha.js - Comando para escolher roupa
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './boneca/BonecaManager.js';

export default {
  commandName: 'roupinha',
  description: 'Escolher roupa para vestir a bonequinha',
  category: 'boneca',
  aliases: ['roupa', 'vestir', 'clothes'],

  async execute(message, client) {
    console.log(`[ROUPINHA-COMMAND] 👗 Executando comando roupinha para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const roupa = args.join(' ').trim();

      if (!roupa) {
        await message.reply(formatReply('Que roupinha você quer colocar na bonequinha? 👗\n\nExemplos: vestidinho rosa, calça jeans, saia florida, pijaminha...'));
        return;
      }

      // Processa escolha usando BonecaManager
      await BonecaManager.processStageChoice(message, 'roupinha', roupa);
      
    } catch (error) {
      console.error(`[ROUPINHA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com a roupinha da bonequinha... 😅'));
    }
  }
};
