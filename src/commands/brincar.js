// src/commands/brincar.js - Comando unificado n!brincar
import { formatReply } from '../utils/formatReply.js';

export default {
  commandName: 'brincar',
  description: 'A Alice quer brincar com você!',
  category: 'personalidade',
  aliases: ['brincadeira', 'play', 'jogar'],
  
  async execute(message, client) {
    await message.reply(formatReply('Vamos brincar de faz de conta? Eu adoro inventar mundos! 🧸 *fica toda animada*'));
  }
};
