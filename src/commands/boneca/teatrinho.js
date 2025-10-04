// src/commands/boneca/teatrinho.js - Comando para atividade teatrinho
import { formatReply } from '../../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'teatrinho',
  description: 'Fazer uma peça de teatro com a bonequinha',
  category: 'boneca',
  aliases: ['teatro', 'peça'],

  async execute(message, client) {
    console.log(`[TEATRINHO-COMMAND] 🎭 Executando comando teatrinho para ${message.author.username}`);

    try {
      // Processa atividade usando BonecaManager
      await BonecaManager.processActivity(message, 'teatrinho');
      
    } catch (error) {
      console.error(`[TEATRINHO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o teatrinho da bonequinha... 😅'));
    }
  }
};
