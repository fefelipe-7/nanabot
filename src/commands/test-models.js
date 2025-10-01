// src/commands/test-models.js - Comando para testar modelos de API
import { SlashCommandBuilder } from 'discord.js';
import modelTester from '../utils/modelTester.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('test-models')
    .setDescription('Testa todos os modelos de API disponíveis')
    .addSubcommand(subcommand =>
      subcommand
        .setName('all')
        .setDescription('Testa todos os modelos configurados')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Mostra status dos testes de modelos')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('single')
        .setDescription('Testa um modelo específico')
        .addStringOption(option =>
          option
            .setName('model')
            .setDescription('Nome do modelo para testar')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'all') {
      await interaction.deferReply();
      
      try {
        const results = await modelTester.testAllModels();
        
        const embed = {
          title: '🧪 Resultado dos Testes de Modelos',
          color: results.totalWorking > 0 ? 0x00ff00 : 0xff0000,
          fields: [
            {
              name: '📊 Resumo',
              value: `**Funcionando:** ${results.totalWorking}\n**Com Erro:** ${results.totalFailed}\n**Total:** ${results.totalWorking + results.totalFailed}`,
              inline: false
            }
          ],
          timestamp: new Date().toISOString()
        };

        if (results.working.length > 0) {
          embed.fields.push({
            name: '✅ Modelos Funcionando',
            value: results.working.join('\n'),
            inline: false
          });
        }

        if (results.failed.length > 0) {
          embed.fields.push({
            name: '❌ Modelos com Erro',
            value: results.failed.join('\n'),
            inline: false
          });
        }

        await interaction.editReply({ embeds: [embed] });
        
      } catch (error) {
        await interaction.editReply(`❌ Erro ao testar modelos: ${error.message}`);
      }

    } else if (subcommand === 'status') {
      const allResults = modelTester.getAllResults();
      const models = apiRotator.models;
      
      const embed = {
        title: '📊 Status dos Modelos',
        color: 0x0099ff,
        fields: [],
        timestamp: new Date().toISOString()
      };

      for (const model of models) {
        const result = allResults[model.name] || { status: 'unknown', lastTest: null };
        const status = result.status === 'working' ? '✅' : 
                     result.status === 'error' ? '❌' : '❓';
        
        embed.fields.push({
          name: `${status} ${model.name}`,
          value: `Status: ${result.status}\nÚltimo teste: ${result.lastTest ? new Date(result.lastTest).toLocaleString() : 'Nunca'}\nAtivo: ${model.isActive ? 'Sim' : 'Não'}`,
          inline: true
        });
      }

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'single') {
      const modelName = interaction.options.getString('model');
      
      await interaction.deferReply();
      
      try {
        const isWorking = await modelTester.testModel(modelName);
        
        const embed = {
          title: `🧪 Teste do Modelo: ${modelName}`,
          color: isWorking ? 0x00ff00 : 0xff0000,
          fields: [
            {
              name: 'Resultado',
              value: isWorking ? '✅ Modelo funcionando!' : '❌ Modelo com erro',
              inline: false
            }
          ],
          timestamp: new Date().toISOString()
        };

        await interaction.editReply({ embeds: [embed] });
        
      } catch (error) {
        await interaction.editReply(`❌ Erro ao testar modelo: ${error.message}`);
      }
    }
  }
};

