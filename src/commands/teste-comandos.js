// src/commands/teste-comandos.js - Comando de teste para verificar separação
import { formatReply } from '../utils/formatReply.js';

export default {
  commandName: 'teste-comandos',
  description: 'Comando de teste para verificar se comandos estão funcionando sem IA',
  category: 'sistema',
  aliases: ['teste', 'test'],
  
  async execute(message, client) {
    console.log(`[TESTE-COMANDOS] 🧪 Executando comando de teste para ${message.author.username}`);
    console.log(`[TESTE-COMANDOS] 📝 Mensagem original: "${message.content}"`);
    console.log(`[TESTE-COMANDOS] 👤 Usuário: ${message.author.username} (${message.author.id})`);
    console.log(`[TESTE-COMANDOS] 📍 Canal: ${message.channel.name || 'DM'} (${message.channel.id})`);
    
    const testResponse = `🧪 **Teste de Comando**\n\n` +
      `✅ Comando executado SEM IA!\n` +
      `👤 Usuário: ${message.author.username}\n` +
      `📝 Comando: ${message.content}\n` +
      `⏰ Timestamp: ${new Date().toLocaleString()}\n\n` +
      `🎯 Sistema de comandos funcionando perfeitamente!\n` +
      `🤖 Este é um comando OFFLINE (sem IA)`;
    
    await message.reply(formatReply(testResponse));
    console.log(`[TESTE-COMANDOS] ✅ Resposta de teste enviada com sucesso`);
  }
};
