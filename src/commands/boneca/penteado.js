// src/commands/boneca/penteado.js - Comando para escolher penteado
import { formatReply } from '../../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'penteado',
  description: 'Escolher penteado para a bonequinha',
  category: 'boneca',
  aliases: ['cabelo', 'pentear', 'hair'],

  async execute(message, client) {
    console.log(`[PENTEADO-COMMAND] 💇‍♀️ Executando comando penteado para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const penteado = args.join(' ').trim();

      if (!penteado) {
        await message.reply(formatReply('Que penteado você quer fazer na bonequinha? 💇‍♀️\n\nExemplos: duas trancinhas, rabo de cavalo, soltinho, coque...'));
        return;
      }

      // Processa escolha usando BonecaManager
      await BonecaManager.processStageChoice(message, 'penteado', penteado);
      
    } catch (error) {
      console.error(`[PENTEADO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o penteado da bonequinha... 😅'));
    }
  }
};
