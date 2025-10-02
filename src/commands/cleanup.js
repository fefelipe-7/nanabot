// src/commands/cleanup.js - Comando unificado n!cleanup
import { formatReply } from '../utils/formatReply.js';
import dataCleanupSystem from '../utils/dataCleanup.js';
import { EmbedBuilder } from 'discord.js';

export default {
  commandName: 'cleanup',
  description: 'Gerencia e monitora o sistema de limpeza automática de dados.',
  category: 'utilitarios',
  aliases: ['limpeza', 'dados', 'clean'],

  async execute(message, client) {
    console.log(`[CLEANUP-COMMAND] ⚙️ Executando comando cleanup para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const action = args[0]?.toLowerCase();

      switch (action) {
        case 'start':
          dataCleanupSystem.start();
          await message.reply(formatReply('🧹 Sistema de limpeza automática iniciado!'));
          break;

        case 'force':
        case 'executar':
          await dataCleanupSystem.forceCleanup();
          await message.reply(formatReply('🚀 Limpeza forçada executada com sucesso!'));
          break;

        case 'stats':
        case 'status':
        default:
          await this.showStatus(message);
          break;
      }
    } catch (error) {
      console.error(`[CLEANUP-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha ao verificar o sistema de limpeza... 😅'));
    }
  },

  // Mostra status com embed
  async showStatus(message) {
    console.log(`[CLEANUP-STATUS] 📊 Mostrando status do sistema de limpeza`);
    
    try {
      const stats = dataCleanupSystem.getStats();
      
      const embed = new EmbedBuilder()
        .setColor(stats.isStarted ? '#00ff88' : '#ff4444')
        .setTitle('🧹 Status do Sistema de Limpeza de Dados')
        .setDescription('Informações sobre a manutenção automática dos arquivos de dados')
        .addFields(
          { name: '🟢 Status', value: stats.isStarted ? '✅ Ativo' : '❌ Inativo', inline: true },
          { name: '🔄 Ciclos de Limpeza', value: stats.cleanupCount.toString(), inline: true },
          { name: '✨ Arquivos Otimizados', value: stats.optimizedFilesCount.toString(), inline: true },
          { name: '🗑️ Arquivos Deletados', value: stats.deletedFilesCount.toString(), inline: true },
          { name: '🕐 Última Limpeza', value: stats.lastCleanupTime || 'Nunca', inline: true },
          { name: '⏰ Próxima Limpeza', value: stats.nextCleanup !== 'N/A' ? stats.nextCleanup : 'N/A', inline: true }
        )
        .setTimestamp();

      // Adiciona comandos disponíveis
      embed.addFields({
        name: '🎮 Comandos Disponíveis',
        value: '• `n!cleanup start` - Inicia limpeza automática\n• `n!cleanup force` - Executa limpeza manual\n• `n!cleanup stats` - Mostra estatísticas',
        inline: false
      });

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[CLEANUP-STATUS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar status do sistema de limpeza... 😅'));
    }
  }
};
