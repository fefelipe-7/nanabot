// src/commands/keepalive.js - Comando para monitorar sistema de keep-alive
import { formatReply } from '../utils/formatReply.js';
import keepAliveSystem from '../utils/keepAlive.js';
import { EmbedBuilder } from 'discord.js';

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
          await this.showStatus(message);
          break;
      }
      
      console.log(`[KEEPALIVE-COMMAND] ✅ Comando keepalive executado com sucesso`);
      
    } catch (error) {
      console.error(`[KEEPALIVE-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha ao verificar o keep-alive... 😅'));
    }
  },

  // Mostra status com embed
  async showStatus(message) {
    console.log(`[KEEPALIVE-STATUS] 📊 Mostrando status do keep-alive`);
    
    try {
      const stats = keepAliveSystem.getStats();
      
      const embed = new EmbedBuilder()
        .setColor(stats.isActive ? '#00ff88' : '#ff4444')
        .setTitle('🔄 Status do Sistema Keep-Alive')
        .setDescription('Informações sobre o sistema de manutenção de conexão')
        .addFields(
          { name: '🟢 Status', value: stats.isActive ? '✅ Ativo' : '❌ Inativo', inline: true },
          { name: '⏰ Uptime', value: `${Math.floor(stats.uptime / 60)} minutos`, inline: true },
          { name: '📊 Taxa de Sucesso', value: stats.successRate || '0%', inline: true },
          { name: '🏓 Total Pings', value: stats.totalPings.toString(), inline: true },
          { name: '✅ Pings Bem-sucedidos', value: stats.successfulPings.toString(), inline: true },
          { name: '❌ Pings Falharam', value: stats.failedPings.toString(), inline: true },
          { name: '🕐 Último Ping', value: stats.lastPing || 'Nunca', inline: true },
          { name: '💥 Último Erro', value: stats.lastError || 'Nenhum', inline: true },
          { name: '🔗 URL Self', value: stats.selfUrl || 'Não detectada', inline: true }
        )
        .setTimestamp();

      // Adiciona configurações
      embed.addFields({
        name: '⚙️ Configurações',
        value: `• Intervalo de Ping: ${stats.config.pingInterval}\n• Health Check: ${stats.config.healthCheckInterval}\n• Self Ping: ${stats.config.selfPingInterval}`,
        inline: false
      });

      // Adiciona comandos disponíveis
      embed.addFields({
        name: '🎮 Comandos Disponíveis',
        value: '• `n!keepalive start` - Inicia o sistema\n• `n!keepalive stop` - Para o sistema\n• `n!keepalive ping` - Força um ping',
        inline: false
      });

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[KEEPALIVE-STATUS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar status do keep-alive... 😅'));
    }
  }
};