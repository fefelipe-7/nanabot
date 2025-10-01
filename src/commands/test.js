// src/commands/test.js - Comando unificado n!test
import { formatReply } from '../utils/formatReply.js';

export default {
  commandName: 'test',
  description: 'Comando de teste para verificar se o sistema está funcionando',
  category: 'sistema',
  aliases: ['teste', 't'],
  
  async execute(message, client) {
    console.log(`[TEST-COMMAND] 🧪 Executando comando test para ${message.author.username}`);
    console.log(`[TEST-COMMAND] 📝 Mensagem original: "${message.content}"`);
    console.log(`[TEST-COMMAND] 👤 Usuário: ${message.author.username} (${message.author.id})`);
    console.log(`[TEST-COMMAND] 📍 Canal: ${message.channel.name || 'DM'} (${message.channel.id})`);
    
    const testResponse = `🧪 **Teste do Sistema**\n\n` +
      `✅ Comando executado com sucesso!\n` +
      `👤 Usuário: ${message.author.username}\n` +
      `📝 Comando: ${message.content}\n` +
      `⏰ Timestamp: ${new Date().toLocaleString()}\n\n` +
      `🎯 Sistema de comandos funcionando perfeitamente!`;
    
    await message.reply(formatReply(testResponse));
    console.log(`[TEST-COMMAND] ✅ Resposta test enviada com sucesso`);
  }
};
