// src/commands/style.js - Comando para controlar estilo da Alice
import { SlashCommandBuilder } from 'discord.js';
import styleEngine from '../modules/styleEngine.js';
import moodEngine from '../modules/moodEngine.js';
import postProcessor from '../modules/postProcessor.js';

export default {
  data: new SlashCommandBuilder()
    .setName('style')
    .setDescription('Controla o estilo e dinamismo da Alice')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Mostra configurações atuais de estilo')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Define configurações de estilo')
        .addStringOption(option =>
          option
            .setName('emoji')
            .setDescription('Densidade de emojis')
            .setRequired(false)
            .addChoices(
              { name: 'Baixa', value: 'low' },
              { name: 'Média', value: 'medium' },
              { name: 'Alta', value: 'high' }
            )
        )
        .addNumberOption(option =>
          option
            .setName('interjection')
            .setDescription('Taxa de interjeições (0-1)')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(1)
        )
        .addNumberOption(option =>
          option
            .setName('followup')
            .setDescription('Taxa de perguntas de follow-up (0-1)')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(1)
        )
        .addStringOption(option =>
          option
            .setName('length')
            .setDescription('Comprimento das respostas')
            .setRequired(false)
            .addChoices(
              { name: 'Curto', value: 'short' },
              { name: 'Médio', value: 'medium' },
              { name: 'Longo', value: 'long' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('mood')
        .setDescription('Define o humor da Alice')
        .addStringOption(option =>
          option
            .setName('humor')
            .setDescription('Humor da Alice')
            .setRequired(true)
            .addChoices(
              { name: 'Feliz', value: 'happy' },
              { name: 'Sonolenta', value: 'sleepy' },
              { name: 'Animada', value: 'excited' },
              { name: 'Curiosa', value: 'curious' },
              { name: 'Amorosa', value: 'loving' },
              { name: 'Brincalhona', value: 'playful' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Reseta todas as configurações de estilo')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Mostra estatísticas de processamento')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      const config = styleEngine.getConfig();
      const currentMood = moodEngine.getCurrentMood();
      
      const embed = {
        title: '🎨 Configurações de Estilo da Alice',
        color: 0xff69b4,
        fields: [
          {
            name: '📊 Estilo Atual',
            value: `**Emoji:** ${config.style.emojiDensity}\n**Interjeições:** ${(config.style.interjectionRate * 100).toFixed(0)}%\n**Follow-up:** ${(config.style.followUpRate * 100).toFixed(0)}%\n**Comprimento:** ${config.style.maxLength}`,
            inline: true
          },
          {
            name: '😊 Humor Atual',
            value: `**Estado:** ${currentMood}\n**Histórico:** ${moodEngine.getMoodHistory().slice(-3).join(', ') || 'Nenhum'}`,
            inline: true
          },
          {
            name: '⚙️ Configurações',
            value: `**Diminutivos:** ${config.style.diminutives ? 'Ativo' : 'Inativo'}\n**Segurança:** ${config.style.safety ? 'Ativo' : 'Inativo'}`,
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Alice Style Engine'
        }
      };

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'set') {
      const emoji = interaction.options.getString('emoji');
      const interjection = interaction.options.getNumber('interjection');
      const followup = interaction.options.getNumber('followup');
      const length = interaction.options.getString('length');

      const updates = {};
      if (emoji) updates.emojiDensity = emoji;
      if (interjection !== null) updates.interjectionRate = interjection;
      if (followup !== null) updates.followUpRate = followup;
      if (length) updates.maxLength = length;

      if (Object.keys(updates).length === 0) {
        await interaction.reply('❌ Nenhuma configuração foi alterada. Use as opções para definir valores.');
        return;
      }

      styleEngine.updateConfig({ style: updates });
      
      await interaction.reply(`✅ Configurações atualizadas:\n${Object.entries(updates).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`);

    } else if (subcommand === 'mood') {
      const humor = interaction.options.getString('humor');
      moodEngine.setMood(humor);
      
      await interaction.reply(`😊 Humor da Alice alterado para: **${humor}**`);

    } else if (subcommand === 'reset') {
      styleEngine.updateConfig(styleEngine.getDefaultConfig());
      moodEngine.setMood('happy');
      postProcessor.resetStats();
      
      await interaction.reply('🔄 Todas as configurações de estilo foram resetadas!');

    } else if (subcommand === 'stats') {
      const stats = postProcessor.getStats();
      
      const embed = {
        title: '📈 Estatísticas de Processamento',
        color: 0x00ff00,
        fields: [
          {
            name: '🔄 Processamento',
            value: `**Total Processado:** ${stats.totalProcessed}\n**Erros:** ${stats.totalErrors}\n**Taxa de Sucesso:** ${stats.successRate}`,
            inline: true
          },
          {
            name: '🚫 Anti-Repetição',
            value: `**Usuários:** ${stats.antiRepeatStats.totalUsers}\n**Respostas:** ${stats.antiRepeatStats.totalResponses}\n**Limite Similaridade:** ${(stats.antiRepeatStats.similarityThreshold * 100).toFixed(0)}%`,
            inline: true
          },
          {
            name: '🎭 Variação',
            value: `**Usuários:** ${stats.variationStats.totalUsers}\n**Templates:** ${stats.variationStats.totalTemplates}\n**Média por Usuário:** ${stats.variationStats.averageTemplatesPerUser.toFixed(1)}`,
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Alice Processing Stats'
        }
      };

      await interaction.reply({ embeds: [embed] });
    }
  }
};
