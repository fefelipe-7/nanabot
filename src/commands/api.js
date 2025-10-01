// src/commands/api.js - Comando para verificar status da rotação de API
import { SlashCommandBuilder } from 'discord.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('api')
    .setDescription('Verifica o status da rotação de modelos de API')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Mostra estatísticas dos modelos de API')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('rotate')
        .setDescription('Força rotação para o próximo modelo')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Reseta todas as estatísticas dos modelos')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      const stats = apiRotator.getStats();
      
      const embed = {
        title: '🔄 Status da Rotação de API',
        color: 0x00ff00,
        fields: [
          {
            name: '📊 Estatísticas Gerais',
            value: `**Modelos Totais:** ${stats.totalModels}\n**Modelos Ativos:** ${stats.activeModels}\n**Requisições Totais:** ${stats.totalRequests}\n**Taxa de Sucesso:** ${stats.successRate}`,
            inline: false
          },
          {
            name: '📈 Limites Diários',
            value: `**Total Disponível:** ${stats.totalDailyLimit}\n**Total Usado:** ${stats.totalUsed}\n**Restante:** ${stats.remainingRequests}`,
            inline: false
          },
          {
            name: '🤖 Modelos Disponíveis',
            value: stats.models.map(m => 
              `${m.isActive ? '✅' : '❌'} **${m.name.split('/')[1]}**\n` +
              `   Uso: ${m.usage} ${m.isActive ? '' : '(Inativo)'}`
            ).join('\n\n'),
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Sistema de Rotação de API Ativo'
        }
      };

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'rotate') {
      apiRotator.forceRotation();
      await interaction.reply('🔄 Rotação forçada para o próximo modelo!');
    } else if (subcommand === 'reset') {
      apiRotator.clearStats();
      await interaction.reply('🧹 Todas as estatísticas dos modelos foram resetadas!');
    }
  }
};
