// src/commands/keepalive.js - Comando para monitorar sistema de keep-alive
import { formatReply } from '../utils/formatReply.js';
import keepAliveSystem from '../utils/keepAlive.js';

export default {
  commandName: 'keepalive',
  description: 'Monitora e controla o sistema de keep-alive do bot',
  category: 'admin',
  aliases: ['ka', 'alive', 'uptime'],
  adminOnly: true, // Apenas para administradores
  
  async execute(message, client) {
    console.log(`[KEEPALIVE-COMMAND] 🔄 Executando comando keepalive para ${message.author.username}`);
    
    try {
      const args = message.content.split(' ').slice(1);
      const action = args[0]?.toLowerCase();
      
      switch (action) {
        case 'start':
          keepAliveSystem.start();
          await message.reply(formatReply('🚀 Sistema de keep-alive iniciado!'));
          break;
          
        case 'stop':
          keepAliveSystem.stop();
          await message.reply(formatReply('🛑 Sistema de keep-alive parado!'));
          break;
          
        case 'ping':
          await keepAliveSystem.forcePing();
          await message.reply(formatReply('🏓 Ping manual executado!'));
          break;
          
        case 'stats':
        case 'status':
        default:
          const stats = keepAliveSystem.getStats();
          const statusMessage = this.formatStatusMessage(stats);
          await message.reply(formatReply(statusMessage));
          break;
      }
      
      console.log(`[KEEPALIVE-COMMAND] ✅ Comando keepalive executado com sucesso`);
      
    } catch (error) {
      console.error(`[KEEPALIVE-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha ao verificar o keep-alive... 😅'));
    }
  },

  // Formata mensagem de status
  formatStatusMessage(stats) {
    const statusIcon = stats.isActive ? '🟢' : '🔴';
    const uptimeFormatted = this.formatUptime(stats.uptime);
    
    let message = `${statusIcon} **Status do Keep-Alive**\n\n`;
    message += `**Sistema:** ${stats.isActive ? 'Ativo' : 'Inativo'}\n`;
    message += `**Uptime:** ${uptimeFormatted}\n`;
    message += `**Total de Pings:** ${stats.totalPings}\n`;
    message += `**Taxa de Sucesso:** ${stats.successRate}\n`;
    message += `**Último Ping:** ${stats.lastPing ? this.formatDate(stats.lastPing) : 'Nunca'}\n`;
    
    if (stats.lastError) {
      message += `**Último Erro:** ${stats.lastError}\n`;
    }
    
    message += `\n**Configuração:**\n`;
    message += `• Ping Externo: ${stats.config.pingInterval}\n`;
    message += `• Health Check: ${stats.config.healthCheckInterval}\n`;
    message += `• Auto-Ping: ${stats.config.selfPingInterval}\n`;
    
    if (stats.selfUrl) {
      message += `\n**URL:** ${stats.selfUrl}`;
    }
    
    message += `\n\n**Comandos:**\n`;
    message += `• \`n!keepalive start\` - Inicia o sistema\n`;
    message += `• \`n!keepalive stop\` - Para o sistema\n`;
    message += `• \`n!keepalive ping\` - Força um ping\n`;
    message += `• \`n!keepalive stats\` - Mostra estatísticas`;
    
    return message;
  },

  // Formata uptime em formato legível
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let formatted = '';
    if (days > 0) formatted += `${days}d `;
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0) formatted += `${minutes}m `;
    formatted += `${secs}s`;
    
    return formatted;
  },

  // Formata data em formato legível
  formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  }
};
