// src/commands/collector.js - Comando para monitorar o coletor de dados
import { SlashCommandBuilder } from 'discord.js';
import dataCollector from '../core/dataCollector.js';

export default {
  data: new SlashCommandBuilder()
    .setName('collector')
    .setDescription('Monitora o coletor de dados')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Mostra status do coletor')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Reseta estatísticas do coletor')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cleanup')
        .setDescription('Limpa dados antigos')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      const stats = dataCollector.getStats();
      
      const embed = {
        title: '📊 Status do Coletor de Dados',
        color: 0x0099ff,
        fields: [
          {
            name: '📈 Estatísticas Gerais',
            value: `**Total de Requisições:** ${stats.totalRequests}\n**Sucessos:** ${stats.successfulRequests}\n**Falhas:** ${stats.failedRequests}\n**Taxa de Sucesso:** ${stats.successRate}`,
            inline: false
          },
          {
            name: '👥 Usuários',
            value: `**Usuários Ativos:** ${stats.activeUsers}\n**Cooldown:** ${stats.cooldownTime}ms`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Coletor de Dados da Alice'
        }
      };

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'reset') {
      dataCollector.resetStats();
      await interaction.reply('🧹 Estatísticas do coletor foram resetadas!');

    } else if (subcommand === 'cleanup') {
      dataCollector.cleanupOldData();
      await interaction.reply('🧹 Dados antigos foram limpos!');
    }
  }
};

