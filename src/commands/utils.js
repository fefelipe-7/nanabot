// src/commands/utils.js - Comando para testar módulos utilitários
// Comando para testar funcionalidades dos módulos utilitários

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import brainModule from '../core/brain.js';
const { nanabotBrain } = brainModule;

const data = new SlashCommandBuilder()
  .setName('utils')
  .setDescription('Testa funcionalidades dos módulos utilitários da Nanabot')
  .addStringOption(option =>
    option.setName('modulo')
      .setDescription('Módulo utilitário para testar')
      .setRequired(true)
      .addChoices(
        { name: 'Banco de Dados', value: 'database' },
        { name: 'Exportador de Diário', value: 'diary' },
        { name: 'Sistema de Filtros', value: 'filters' },
        { name: 'Todos os Utilitários', value: 'all' }
      )
  )
  .addStringOption(option =>
    option.setName('acao')
      .setDescription('Ação específica para executar')
      .setRequired(false)
      .addChoices(
        { name: 'Estatísticas', value: 'stats' },
        { name: 'Teste de Funcionalidade', value: 'test' },
        { name: 'Reset', value: 'reset' },
        { name: 'Health Check', value: 'health' }
      )
  );

async function execute(interaction) {
  const modulo = interaction.options.getString('modulo');
  const acao = interaction.options.getString('acao') || 'stats';

  try {
    await interaction.deferReply();

    let embed;
    
    switch (modulo) {
      case 'database':
        embed = await handleDatabase(acao);
        break;
      case 'diary':
        embed = await handleDiary(acao);
        break;
      case 'filters':
        embed = await handleFilters(acao);
        break;
      case 'all':
        embed = await handleAllUtils(acao);
        break;
      default:
        embed = new EmbedBuilder()
          .setTitle('❌ Módulo não encontrado')
          .setDescription('Módulo utilitário especificado não foi encontrado.')
          .setColor(0xff0000);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Erro no comando utils:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription(`Erro ao executar comando: ${error.message}`)
      .setColor(0xff0000);
    
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Manipula testes do banco de dados
async function handleDatabase(acao) {
  const embed = new EmbedBuilder()
    .setTitle('🗄️ Sistema de Banco de Dados')
    .setColor(0x00ff00);

  switch (acao) {
    case 'stats':
      const dbStats = nanabotBrain.db.getStats();
      embed.setDescription('**Estatísticas do Banco de Dados:**')
        .addFields(
          { name: 'Status', value: dbStats.isConnected ? '✅ Conectado' : '❌ Desconectado', inline: true },
          { name: 'Total de Tabelas', value: dbStats.totalTables?.toString() || '0', inline: true },
          { name: 'Memórias', value: dbStats.memories?.toString() || '0', inline: true },
          { name: 'Interações', value: dbStats.interactions?.toString() || '0', inline: true },
          { name: 'Emoções', value: dbStats.emotions_log?.toString() || '0', inline: true },
          { name: 'Aprendizados', value: dbStats.learning_records?.toString() || '0', inline: true },
          { name: 'Vocabulário', value: dbStats.vocabulary?.toString() || '0', inline: true },
          { name: 'Histórias', value: dbStats.stories?.toString() || '0', inline: true },
          { name: 'Expressões', value: dbStats.expressions?.toString() || '0', inline: true }
        );
      break;

    case 'test':
      try {
        await nanabotBrain.db.connect();
        const healthCheck = await nanabotBrain.db.healthCheck();
        embed.setDescription('**Teste de Funcionalidade:**')
          .addFields(
            { name: 'Status', value: healthCheck.status === 'healthy' ? '✅ Saudável' : '❌ Com problemas', inline: true },
            { name: 'Conectado', value: healthCheck.connected ? '✅ Sim' : '❌ Não', inline: true },
            { name: 'Última Verificação', value: healthCheck.lastCheck, inline: true }
          );
      } catch (error) {
        embed.setDescription('**Teste de Funcionalidade:**')
          .addFields(
            { name: 'Status', value: '❌ Erro', inline: true },
            { name: 'Erro', value: error.message, inline: true }
          );
      }
      break;

    case 'health':
      const health = await nanabotBrain.db.healthCheck();
      embed.setDescription('**Health Check do Banco:**')
        .addFields(
          { name: 'Status', value: health.status === 'healthy' ? '✅ Saudável' : '❌ Com problemas', inline: true },
          { name: 'Conectado', value: health.connected ? '✅ Sim' : '❌ Não', inline: true },
          { name: 'Última Verificação', value: health.lastCheck, inline: true }
        );
      break;

    default:
      embed.setDescription('Ação não reconhecida para o banco de dados.');
  }

  return embed;
}

// Manipula testes do exportador de diário
async function handleDiary(acao) {
  const embed = new EmbedBuilder()
    .setTitle('📖 Exportador de Diário')
    .setColor(0x00ff00);

  switch (acao) {
    case 'stats':
      const diaryStats = nanabotBrain.diaryExporter.getExportStats();
      embed.setDescription('**Estatísticas do Exportador:**')
        .addFields(
          { name: 'Total de Exports', value: diaryStats.totalExports?.toString() || '0', inline: true },
          { name: 'Último Export', value: diaryStats.lastExport?.date || 'Nenhum', inline: true },
          { name: 'Formatos Suportados', value: diaryStats.supportedFormats?.join(', ') || 'Nenhum', inline: true }
        );
      break;

    case 'test':
      try {
        const testExport = await nanabotBrain.diaryExporter.exportDiary('markdown', null, {
          includeMemories: true,
          includeEmotions: true,
          includeLearnings: true,
          includeStories: true,
          includeInteractions: true,
          includeGrowth: true
        });
        
        embed.setDescription('**Teste de Exportação:**')
          .addFields(
            { name: 'Status', value: testExport.success ? '✅ Sucesso' : '❌ Falha', inline: true },
            { name: 'Arquivo', value: testExport.filename || 'N/A', inline: true },
            { name: 'Tamanho dos Dados', value: testExport.dataSize?.toString() || '0', inline: true }
          );
      } catch (error) {
        embed.setDescription('**Teste de Exportação:**')
          .addFields(
            { name: 'Status', value: '❌ Erro', inline: true },
            { name: 'Erro', value: error.message, inline: true }
          );
      }
      break;

    default:
      embed.setDescription('Ação não reconhecida para o exportador de diário.');
  }

  return embed;
}

// Manipula testes do sistema de filtros
async function handleFilters(acao) {
  const embed = new EmbedBuilder()
    .setTitle('🛡️ Sistema de Filtros')
    .setColor(0x00ff00);

  switch (acao) {
    case 'stats':
      const filterStats = nanabotBrain.filterSystem.getFilterStats();
      embed.setDescription('**Estatísticas dos Filtros:**')
        .addFields(
          { name: 'Nível de Filtro', value: `${(filterStats.filterLevel * 100).toFixed(1)}%`, inline: true },
          { name: 'Nível de Segurança', value: `${(filterStats.safetyLevel * 100).toFixed(1)}%`, inline: true },
          { name: 'Habilidades de Moderação', value: `${(filterStats.moderationSkills * 100).toFixed(1)}%`, inline: true },
          { name: 'Análise de Conteúdo', value: `${(filterStats.contentAnalysis * 100).toFixed(1)}%`, inline: true },
          { name: 'Conteúdo Filtrado', value: filterStats.totalFiltered?.toString() || '0', inline: true },
          { name: 'Regras de Filtro', value: filterStats.totalRules?.toString() || '0', inline: true }
        );
      break;

    case 'test':
      const testInputs = [
        'Olá, como você está?',
        'Isso é um teste de spam muito muito muito repetitivo',
        'Conteúdo inadequado com palavrões',
        'História sobre magia e feitiços'
      ];
      
      const testResults = testInputs.map(input => {
        const result = nanabotBrain.filterSystem.processFilters(input, {});
        return `${input.substring(0, 30)}... → ${result.filteredResult.isFiltered ? 'Filtrado' : 'OK'}`;
      });
      
      embed.setDescription('**Teste de Filtros:**')
        .addFields(
          { name: 'Teste 1', value: testResults[0], inline: true },
          { name: 'Teste 2', value: testResults[1], inline: true },
          { name: 'Teste 3', value: testResults[2], inline: true },
          { name: 'Teste 4', value: testResults[3], inline: true }
        );
      break;

    case 'reset':
      nanabotBrain.filterSystem.resetFilterSystem();
      embed.setDescription('✅ Sistema de filtros resetado com sucesso!');
      break;

    default:
      embed.setDescription('Ação não reconhecida para o sistema de filtros.');
  }

  return embed;
}


// Manipula testes de todos os utilitários
async function handleAllUtils(acao) {
  const embed = new EmbedBuilder()
    .setTitle('🛠️ Todos os Módulos Utilitários')
    .setColor(0x00ff00);

  switch (acao) {
    case 'stats':
      const allStats = nanabotBrain.getCompleteStats();
      embed.setDescription('**Estatísticas de Todos os Utilitários:**')
        .addFields(
          { name: 'Banco de Dados', value: allStats.database?.isConnected ? '✅ Conectado' : '❌ Desconectado', inline: true },
          { name: 'Exportador', value: `${allStats.diaryExporter?.totalExports || 0} exports`, inline: true },
          { name: 'Filtros', value: `${(allStats.filterSystem?.filterLevel * 100).toFixed(0)}%`, inline: true },
          { name: 'Total de Módulos', value: allStats.totalModules?.toString() || '0', inline: true }
        );
      break;

    case 'test':
      try {
        // Testa banco de dados
        await nanabotBrain.db.connect();
        const dbHealth = await nanabotBrain.db.healthCheck();
        
        // Testa exportador
        const diaryTest = await nanabotBrain.diaryExporter.exportDiary('json', null, { includeMemories: false });
        
        // Testa filtros
        const filterTest = nanabotBrain.filterSystem.processFilters('Teste de filtros', {});
        
        
        embed.setDescription('**Teste de Todos os Utilitários:**')
          .addFields(
            { name: 'Banco de Dados', value: dbHealth.status === 'healthy' ? '✅ OK' : '❌ Erro', inline: true },
            { name: 'Exportador', value: diaryTest.success ? '✅ OK' : '❌ Erro', inline: true },
            { name: 'Filtros', value: '✅ OK', inline: true },
          );
      } catch (error) {
        embed.setDescription('**Teste de Todos os Utilitários:**')
          .addFields(
            { name: 'Status', value: '❌ Erro', inline: true },
            { name: 'Erro', value: error.message, inline: true }
          );
      }
      break;

    case 'health':
      const healthChecks = {
        database: await nanabotBrain.db.healthCheck(),
        filters: nanabotBrain.filterSystem.getFilterStats(),
        diary: nanabotBrain.diaryExporter.getExportStats()
      };
      
      embed.setDescription('**Health Check de Todos os Utilitários:**')
        .addFields(
          { name: 'Banco de Dados', value: healthChecks.database.status === 'healthy' ? '✅ Saudável' : '❌ Com problemas', inline: true },
          { name: 'Filtros', value: healthChecks.filters.filterLevel > 0.5 ? '✅ Ativo' : '⚠️ Baixo', inline: true },
          { name: 'Exportador', value: healthChecks.diary.totalExports > 0 ? '✅ Usado' : '⚠️ Não usado', inline: true }
        );
      break;

    default:
      embed.setDescription('Ação não reconhecida para todos os utilitários.');
  }

  return embed;
}

export default { data, execute };
