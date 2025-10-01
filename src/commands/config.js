// src/commands/config.js - Comando para configurar modelos de API
import { SlashCommandBuilder } from 'discord.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configura modelos de API personalizados')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add-model')
        .setDescription('Adiciona um novo modelo à rotação')
        .addStringOption(option =>
          option
            .setName('model')
            .setDescription('Nome do modelo (ex: meta-llama/llama-3.1-8b-instruct:free)')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('limit')
            .setDescription('Limite diário de requisições')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('priority')
            .setDescription('Prioridade do modelo (1-10, menor = maior prioridade)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove-model')
        .setDescription('Remove um modelo da rotação')
        .addStringOption(option =>
          option
            .setName('model')
            .setDescription('Nome do modelo para remover')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list-models')
        .setDescription('Lista todos os modelos configurados')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add-model') {
      const modelName = interaction.options.getString('model');
      const limit = interaction.options.getInteger('limit');
      const priority = interaction.options.getInteger('priority') || 5;

      // Verifica se o modelo já existe
      const existingModel = apiRotator.models.find(m => m.name === modelName);
      if (existingModel) {
        await interaction.reply(`❌ Modelo **${modelName}** já está configurado!`);
        return;
      }

      // Adiciona novo modelo
      const newModel = {
        name: modelName,
        provider: 'OpenRouter',
        maxTokens: 512,
        temperature: 0.7,
        priority: priority,
        dailyLimit: limit,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true
      };

      apiRotator.models.push(newModel);
      
      await interaction.reply(`✅ Modelo **${modelName}** adicionado com sucesso!\n` +
        `📊 Limite diário: ${limit} requisições\n` +
        `🎯 Prioridade: ${priority}`);

    } else if (subcommand === 'remove-model') {
      const modelName = interaction.options.getString('model');
      
      const modelIndex = apiRotator.models.findIndex(m => m.name === modelName);
      if (modelIndex === -1) {
        await interaction.reply(`❌ Modelo **${modelName}** não encontrado!`);
        return;
      }

      apiRotator.models.splice(modelIndex, 1);
      await interaction.reply(`🗑️ Modelo **${modelName}** removido com sucesso!`);

    } else if (subcommand === 'list-models') {
      const models = apiRotator.models.map((m, index) => 
        `**${index + 1}.** ${m.name}\n` +
        `   📊 Uso: ${m.requestsUsed}/${m.dailyLimit}\n` +
        `   🎯 Prioridade: ${m.priority}\n` +
        `   ${m.isActive ? '✅ Ativo' : '❌ Inativo'}`
      ).join('\n\n');

      const embed = {
        title: '🤖 Modelos Configurados',
        description: models || 'Nenhum modelo configurado',
        color: 0x0099ff,
        timestamp: new Date().toISOString()
      };

      await interaction.reply({ embeds: [embed] });
    }
  }
};
