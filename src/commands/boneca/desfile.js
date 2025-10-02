// src/commands/boneca/desfile.js - Comando para atividade desfile
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './BonecaManager.js';

export default {
  commandName: 'desfile',
  description: 'Fazer um desfile de modas com a bonequinha',
  category: 'boneca',
  aliases: ['fashion', 'moda'],

  async execute(message, client) {
    console.log(`[DESFILE-COMMAND] 🌸 Executando comando desfile para ${message.author.username}`);

    try {
      await BonecaManager.processActivity(message, 'desfile');
    } catch (error) {
      console.error(`[DESFILE-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o desfile da bonequinha... 😅'));
    }
  }
};
