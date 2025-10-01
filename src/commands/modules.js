// src/commands/modules.js - Comando para gerenciar módulos
import { SlashCommandBuilder } from 'discord.js';
import messageProcessor from '../modules/messageProcessor.js';
import apiHandler from '../modules/apiHandler.js';
import fallbackSystem from '../modules/fallbackSystem.js';
import contextManager from '../modules/contextManager.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('modules')
    .setDescription('Gerencia e monitora os módulos do sistema')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Mostra status de todos os módulos')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Reseta estatísticas de todos os módulos')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cleanup')
        .setDescription('Limpa dados antigos dos módulos')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      const messageProcessorStats = messageProcessor.getStats();
      const apiHandlerStats = apiHandler.getStats();
      const fallbackStats = fallbackSystem.getStats();
      const contextStats = contextManager.getStats();
      const apiRotatorStats = apiRotator.getStats();

      const embed = {
        title: '📊 Status dos Módulos',
        color: 0x0099ff,
        fields: [
          {
            name: '📨 Message Processor',
            value: `**Usuários Ativos:** ${messageProcessorStats.activeUsers}\n**Cooldown:** ${messageProcessorStats.cooldownTime}ms`,
            inline: true
          },
          {
            name: '🤖 API Handler',
            value: `**Requisições:** ${apiHandlerStats.totalRequests}\n**Sucesso:** ${apiHandlerStats.successRate}`,
            inline: true
          },
          {
            name: '🎭 Fallback System',
            value: `**Fallbacks:** ${fallbackStats.totalFallbacks}\n**Respostas:** ${fallbackStats.contextualResponses}`,
            inline: true
          },
          {
            name: '📝 Context Manager',
            value: `**Usuários:** ${contextStats.activeUsers}\n**Histórico:** ${contextStats.totalHistoryEntries}`,
            inline: true
          },
          {
            name: '🔄 API Rotator',
            value: `**Modelos Ativos:** ${apiRotatorStats.activeModels}\n**Requisições:** ${apiRotatorStats.totalRequests}`,
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Sistema Modular da Alice'
        }
      };

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'reset') {
      apiHandler.resetStats();
      fallbackSystem.resetStats();
      contextManager.clearAllContexts();
      
      await interaction.reply('🧹 Estatísticas de todos os módulos foram resetadas!');

    } else if (subcommand === 'cleanup') {
      messageProcessor.cleanupOldEntries();
      contextManager.cleanupOldContexts();
      
      await interaction.reply('🧹 Dados antigos foram limpos de todos os módulos!');
    }
  }
};
