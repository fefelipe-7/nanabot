// src/commands/boneca/comidinha.js - Comando para escolher comida
import { formatReply } from '../../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'comidinha',
  description: 'Escolher comida para alimentar a bonequinha',
  category: 'boneca',
  aliases: ['comida', 'alimentar', 'food'],

  async execute(message, client) {
    console.log(`[COMIDINHA-COMMAND] 🍽️ Executando comando comidinha para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const comida = args.join(' ').trim();

      if (!comida) {
        await message.reply(formatReply('O que a bonequinha vai comer? 🍽️\n\nExemplos: panquequinha, sopinha, frutinhas, bolinho...'));
        return;
      }

      // Processa escolha usando BonecaManager
      await BonecaManager.processStageChoice(message, 'comidinha', comida);
      
    } catch (error) {
      console.error(`[COMIDINHA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com a comidinha da bonequinha... 😅'));
    }
  }
};
