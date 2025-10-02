// src/commands/boneca/brinquedo.js - Comando para escolher brinquedo
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'brinquedo',
  description: 'Escolher brinquedo para a bonequinha',
  category: 'boneca',
  aliases: ['brinquedinho', 'toy'],

  async execute(message, client) {
    console.log(`[BRINQUEDO-COMMAND] 🧸 Executando comando brinquedo para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const brinquedo = args.join(' ').trim();

      if (!brinquedo) {
        await message.reply(formatReply('Que brinquedinho você quer dar para a bonequinha? 🧸\n\nExemplos: ursinho de pelúcia, bonequinha bebê, carrinho, bola...'));
        return;
      }

      // Processa escolha usando BonecaManager
      await BonecaManager.processStageChoice(message, 'brinquedo', brinquedo);
      
    } catch (error) {
      console.error(`[BRINQUEDO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o brinquedinho da bonequinha... 😅'));
    }
  }
};
