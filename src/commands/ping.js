// src/commands/ping.js - Comando unificado n!ping
import { formatReply } from '../utils/formatReply.js';

export default {
  commandName: 'ping',
  description: 'Responde com Pong! para testar se a Alice está online',
  category: 'sistema',
  aliases: ['pong', 'teste'],
  
  async execute(message, client) {
    console.log(`[PING-COMMAND] 🏓 Executando comando ping para ${message.author.username}`);
    await message.reply(formatReply('Pong! 🏓 Estou funcionando perfeitamente!'));
    console.log(`[PING-COMMAND] ✅ Resposta ping enviada com sucesso`);
  }
};
