// src/commands/piquenique.js - Comando para atividade piquenique
import { formatReply } from '../utils/formatReply.js';
import BonecaManager from './boneca/BonecaManager.js';

export default {
  commandName: 'piquenique',
  description: 'Levar a bonequinha para um piquenique',
  category: 'boneca',
  aliases: ['picnic'],

  async execute(message, client) {
    console.log(`[PIQUENIQUE-COMMAND] 🧺 Executando comando piquenique para ${message.author.username}`);

    try {
      // Processa atividade usando BonecaManager
      await BonecaManager.processActivity(message, 'piquenique');
      
    } catch (error) {
      console.error(`[PIQUENIQUE-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha com o piquenique da bonequinha... 😅'));
    }
  }
};
