// src/commands/boneca/banho.js - Comando para escolher sabonete
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'banho',
  description: 'Escolher sabonete para o banho da bonequinha',
  category: 'boneca',
  aliases: ['sabonete', 'shower'],

  async execute(message, client) {
    console.log(`[BANHO-COMMAND] 🚿 Executando comando banho para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const sabonete = args.join(' ').trim();

      if (!sabonete) {
        await message.reply(formatReply('Qual cheirinho de sabonete você quer para a bonequinha? 🧴\n\nExemplos: moranguinho, lavanda, baunilha, coco...'));
        return;
      }

      // Processa escolha usando BonecaManager
      await BonecaManager.processStageChoice(message, 'banho', sabonete);
      
    } catch (error) {
      console.error(`[BANHO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o banho da bonequinha... 😅'));
    }
  }
};
