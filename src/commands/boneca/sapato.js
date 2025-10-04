// src/commands/boneca/sapato.js - Comando para escolher sapato
import { formatReply } from '../../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'sapato',
  description: 'Escolher sapato para a bonequinha',
  category: 'boneca',
  aliases: ['sapatinho', 'calçar', 'shoes'],

  async execute(message, client) {
    console.log(`[SAPATO-COMMAND] 👟 Executando comando sapato para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const sapato = args.join(' ').trim();

      if (!sapato) {
        await message.reply(formatReply('Que sapatinho você quer colocar na bonequinha? 👟\n\nExemplos: sapatilha brilhante, tênis rosa, sandalinha, botinha...'));
        return;
      }

      // Processa escolha usando BonecaManager
      await BonecaManager.processStageChoice(message, 'sapato', sapato);
      
    } catch (error) {
      console.error(`[SAPATO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o sapatinho da bonequinha... 😅'));
    }
  }
};
