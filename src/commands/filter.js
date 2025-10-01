// src/commands/filter.js - Comando para verificar status do sistema modular
import { SlashCommandBuilder } from 'discord.js';
import messageProcessor from '../modules/messageProcessor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Verifica o status do sistema anti-duplicação modular')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Mostra estatísticas do sistema')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Limpa dados do sistema')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      const stats = messageProcessor.getStats();
      
      const embed = {
        title: '🛡️ Status do Sistema Modular',
        color: 0x00ff00,
        fields: [
          {
            name: '📊 Estatísticas',
            value: `**Usuários Ativos:** ${stats.activeUsers}\n**Cooldown:** ${stats.cooldownTime}ms`,
            inline: false
          },
          {
            name: '⚙️ Configurações',
            value: `**Sistema:** Modular\n**Anti-duplicação:** Ativo\n**Cooldown:** ${stats.cooldownTime}ms`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Sistema Modular da Alice'
        }
      };

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'clear') {
      messageProcessor.cleanupOldEntries();
      await interaction.reply('✅ Dados do sistema foram limpos!');
    }
  }
};
