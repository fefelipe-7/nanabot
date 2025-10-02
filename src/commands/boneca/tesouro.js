// src/commands/boneca/tesouro.js - Comando para atividade tesouro
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'tesouro',
  description: 'Brincar de caça ao tesouro com a bonequinha',
  category: 'boneca',
  aliases: ['treasure', 'caça'],

  async execute(message, client) {
    console.log(`[TESOURO-COMMAND] 🏴‍☠️ Executando comando tesouro para ${message.author.username}`);

    try {
      await BonecaManager.processActivity(message, 'tesouro');
    } catch (error) {
      console.error(`[TESOURO-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o tesouro da bonequinha... 😅'));
    }
  }
};
