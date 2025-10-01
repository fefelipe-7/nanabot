// src/commands/status.js - Comando unificado n!status
import { formatReply } from '../utils/formatReply.js';
import commandRouter from '../utils/commandRouter.js';
import apiRotator from '../utils/apiRotator.js';
import contextManager from '../modules/contextManager.js';

export default {
  commandName: 'status',
  description: 'Mostra status geral do sistema da Alice',
  category: 'sistema',
  aliases: ['info', 'sistema', 'system'],
  
  async execute(message, client) {
    try {
      const commandStats = commandRouter.getStats();
      const apiStats = apiRotator.getStats();
      const memoryStats = await contextManager.getMemoryStats();
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      let statusText = '📊 **Status do Sistema da Alice**\n\n';
      
      // Status geral
      statusText += '🟢 **Status:** Online e funcionando\n';
      statusText += `⏰ **Uptime:** ${hours}h ${minutes}m\n`;
      statusText += `💾 **Memória:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n\n`;
      
      // Comandos
      statusText += '🎯 **Comandos:**\n';
      statusText += `• Total: ${commandStats.totalCommands}\n`;
      statusText += `• Execuções: ${commandStats.totalExecutions}\n`;
      statusText += `• Taxa de sucesso: ${commandStats.successRate}\n\n`;
      
      // API
      statusText += '🤖 **API de IA:**\n';
      statusText += `• Modelos ativos: ${apiStats.activeModels}/${apiStats.totalModels}\n`;
      statusText += `• Requisições: ${apiStats.totalRequests}\n`;
      statusText += `• Taxa de sucesso: ${apiStats.successRate}\n\n`;
      
      // Memória
      statusText += '🧠 **Memória:**\n';
      statusText += `• Sessões: ${memoryStats.sessions}\n`;
      statusText += `• Mensagens: ${memoryStats.messages}\n`;
      statusText += `• Resumos: ${memoryStats.summaries}\n\n`;
      
      statusText += '✨ **Alice está pronta para conversar!**';
      
      await message.reply(formatReply(statusText));
      
    } catch (error) {
      console.error('[STATUS-COMMAND] Erro:', error.message);
      await message.reply(formatReply('Ops! Não consegui obter o status completo. Tenta de novo! 😅'));
    }
  }
};
