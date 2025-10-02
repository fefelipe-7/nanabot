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
          const stats = dataCleanupSystem.getStats();
          const statusMessage = this.formatStats(stats);
          await message.reply(formatReply(statusMessage));
          break;
      }
    } catch (error) {
      console.error(`[CLEANUP-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha ao verificar o sistema de limpeza... 😅'));
    }
  },

  formatStats(stats) {
    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setTitle('🧹 Status do Sistema de Limpeza')
      .setDescription('Informações sobre a limpeza automática de dados.')
      .addFields(
        { name: 'Status', value: stats.isActive ? '✅ Ativo' : '❌ Inativo', inline: true },
        { name: 'Última Limpeza', value: stats.lastCleanup ? `<t:${Math.floor(new Date(stats.lastCleanup).getTime() / 1000)}:R>` : 'Nunca', inline: true },
        { name: 'Intervalo', value: `${stats.cleanupInterval / 1000 / 60 / 60} horas`, inline: true },
        { name: 'Max Histórico', value: stats.maxHistoryEntries.toString(), inline: true },
        { name: 'Max Experiências', value: stats.maxExperienceBuffer.toString(), inline: true },
        { name: 'Max Padrões', value: stats.maxPatternEntries.toString(), inline: true },
        { name: 'Max Apegos', value: stats.maxAttachmentEntries.toString(), inline: true }
      )
      .setTimestamp();

    return { embeds: [embed] };
  }
};
