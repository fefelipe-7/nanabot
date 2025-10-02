// src/commands/system.js - Comando unificado n!system (CONSOLIDADO)
import { formatReply } from '../utils/formatReply.js';
import commandRouter from '../utils/commandRouter.js';
import apiRotator from '../utils/apiRotator.js';
import contextManager from '../modules/contextManager.js';
import { EmbedBuilder } from 'discord.js';

export default {
  commandName: 'system',
  description: 'Comando unificado para gerenciar e monitorar o sistema da Alice',
  category: 'sistema',
  aliases: ['status', 'info', 'sistema', 'sys'],

  async execute(message, client) {
    console.log(`[SYSTEM-COMMAND] ⚙️ Executando comando system para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const subcommand = args[0]?.toLowerCase() || 'status';

      switch (subcommand) {
        case 'status':
        case 'info':
          await this.showStatus(message);
          break;

        case 'modelos':
        case 'models':
        case 'ia':
          await this.manageModels(message, args[1]);
          break;

        case 'api':
          await this.showApiStatus(message);
          break;

        case 'config':
        case 'configuracao':
          await this.showConfig(message);
          break;

        case 'memory':
        case 'memoria':
          await this.showMemoryStats(message);
          break;

        case 'commands':
        case 'comandos':
          await this.showCommandStats(message);
          break;

        default:
          await this.showHelp(message);
      }
    } catch (error) {
      console.error(`[SYSTEM-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha no sistema... 😅'));
    }
  },

  // Status geral do sistema
  async showStatus(message) {
    console.log(`[SYSTEM-STATUS] 📊 Mostrando status geral`);
    
    try {
      const commandStats = commandRouter.getStats();
      const apiStats = apiRotator.getStats();
      const memoryStats = await contextManager.getMemoryStats();
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      const embed = new EmbedBuilder()
        .setColor('#00ff88')
        .setTitle('📊 Status Geral do Sistema da Alice')
        .setDescription('Informações sobre o estado atual do bot')
        .addFields(
          { name: '🟢 Status', value: 'Online e funcionando', inline: true },
          { name: '⏰ Uptime', value: `${hours}h ${minutes}m`, inline: true },
          { name: '💾 Memória', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
          { name: '🤖 Modelos Ativos', value: (apiStats.models?.filter(m => m.isActive)?.length || 0).toString(), inline: true },
          { name: '📈 Total Requisições', value: (apiStats.totalRequests || 0).toString(), inline: true },
          { name: '✅ Taxa de Sucesso', value: `${apiStats.successRate || 0}%`, inline: true },
          { name: '📝 Comandos Executados', value: (commandStats.totalExecutions || 0).toString(), inline: true },
          { name: '💾 Memórias Ativas', value: (memoryStats.totalMemories || 0).toString(), inline: true },
          { name: '👥 Usuários Únicos', value: (memoryStats.uniqueUsers || 0).toString(), inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[SYSTEM-STATUS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar status... 😅'));
    }
  },

  // Gerenciamento de modelos
  async manageModels(message, action = 'list') {
    console.log(`[SYSTEM-MODELS] 🤖 Gerenciando modelos (ação: ${action})`);
    
    try {
      const stats = apiRotator.getStats();
      
      switch (action) {
        case 'list':
        case 'lista':
          await this.listModels(message, stats);
          break;
          
        case 'test':
        case 'teste':
          await this.testModel(message, stats);
          break;
          
        case 'rotate':
        case 'rotacionar':
          await this.forceRotation(message);
          break;
          
        case 'reset':
          await this.resetStats(message);
          break;
          
        default:
          await this.showModelHelp(message);
      }
    } catch (error) {
      console.error(`[SYSTEM-MODELS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao gerenciar modelos... 😅'));
    }
  },

  // Lista modelos
  async listModels(message, stats) {
    const activeModels = stats.models?.filter(m => m.isActive) || [];
    const inactiveModels = stats.models?.filter(m => !m.isActive) || [];
    
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🤖 Modelos de IA Disponíveis')
        .setDescription('Lista de todos os modelos configurados')
        .addFields(
          { name: '✅ Modelos Ativos', value: (activeModels?.length || 0).toString(), inline: true },
          { name: '❌ Modelos Inativos', value: (inactiveModels?.length || 0).toString(), inline: true },
          { name: '📊 Total', value: (stats.models?.length || 0).toString(), inline: true }
        );

    if (activeModels.length > 0) {
      embed.addFields({
        name: '🎯 Modelos Ativos',
        value: activeModels.map(m => `• ${m.name} (${m.category})`).join('\n'),
        inline: false
      });
    }

    if (inactiveModels.length > 0) {
      embed.addFields({
        name: '💤 Modelos Inativos',
        value: inactiveModels.map(m => `• ${m.name} (${m.category})`).join('\n'),
        inline: false
      });
    }

    await message.reply({ embeds: [embed] });
  },

  // Testa um modelo específico
  async testModel(message, stats) {
    const activeModels = stats.models?.filter(m => m.isActive) || [];
    
    if (activeModels.length === 0) {
      await message.reply(formatReply('❌ Nenhum modelo ativo para testar!'));
      return;
    }

    const randomModel = activeModels[Math.floor(Math.random() * activeModels.length)];
    
    try {
      await message.reply(formatReply(`🧪 Testando modelo: ${randomModel.name}...`));
      
      const startTime = Date.now();
      const response = await apiRotator.generateResponse('Teste de conectividade', randomModel.name);
      const responseTime = Date.now() - startTime;
      
      await message.reply(formatReply(`✅ **Teste Concluído**\n\n` +
        `🤖 Modelo: ${randomModel.name}\n` +
        `⏱️ Tempo: ${responseTime}ms\n` +
        `📝 Resposta: ${response.substring(0, 200)}...`));
        
    } catch (error) {
      await message.reply(formatReply(`❌ **Teste Falhou**\n\n` +
        `🤖 Modelo: ${randomModel.name}\n` +
        `💥 Erro: ${error.message}`));
    }
  },

  // Força rotação de modelo
  async forceRotation(message) {
    try {
      const currentModel = apiRotator.getCurrentModel();
      apiRotator.rotateToNextModel();
      const newModel = apiRotator.getCurrentModel();
      
      await message.reply(formatReply(`🔄 **Rotação Forçada**\n\n` +
        `📤 Modelo Anterior: ${currentModel?.name || 'N/A'}\n` +
        `📥 Modelo Atual: ${newModel?.name || 'N/A'}`));
        
    } catch (error) {
      await message.reply(formatReply('❌ Erro ao forçar rotação de modelo!'));
    }
  },

  // Reseta estatísticas
  async resetStats(message) {
    try {
      apiRotator.resetStats();
      await message.reply(formatReply('🔄 **Estatísticas Resetadas**\n\nTodas as estatísticas dos modelos foram zeradas!'));
    } catch (error) {
      await message.reply(formatReply('❌ Erro ao resetar estatísticas!'));
    }
  },

  // Status da API
  async showApiStatus(message) {
    console.log(`[SYSTEM-API] 🔌 Mostrando status da API`);
    
    try {
      const stats = apiRotator.getStats();
      const currentModel = apiRotator.getCurrentModel();
      
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🔌 Status da API')
        .setDescription('Informações sobre a rotação de modelos')
        .addFields(
          { name: '🤖 Modelo Atual', value: currentModel?.name || 'Nenhum', inline: true },
          { name: '📊 Total Requisições', value: (stats.totalRequests || 0).toString(), inline: true },
          { name: '✅ Taxa de Sucesso', value: `${stats.successRate || 0}%`, inline: true },
          { name: '🔄 Rotações Hoje', value: (stats.rotationsToday || 0).toString(), inline: true },
          { name: '⏰ Última Rotação', value: stats.lastRotation ? `<t:${Math.floor(new Date(stats.lastRotation).getTime() / 1000)}:R>` : 'Nunca', inline: true },
          { name: '📈 Requisições Hoje', value: (stats.requestsToday || 0).toString(), inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[SYSTEM-API] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar status da API... 😅'));
    }
  },

  // Configurações
  async showConfig(message) {
    console.log(`[SYSTEM-CONFIG] ⚙️ Mostrando configurações`);
    
    const config = {
      discordToken: process.env.DISCORD_TOKEN ? '✅ Configurado' : '❌ Não configurado',
      openrouterKey: process.env.OPENROUTER_API_KEY ? '✅ Configurado' : '❌ Não configurado',
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version
    };
    
    const configText = `⚙️ **Configurações do Sistema**\n\n` +
      `**Variáveis de Ambiente:**\n` +
      `• Discord Token: ${config.discordToken}\n` +
      `• OpenRouter Key: ${config.openrouterKey}\n` +
      `• Node Environment: ${config.nodeEnv}\n\n` +
      `**Sistema:**\n` +
      `• Plataforma: ${config.platform}\n` +
      `• Node.js: ${config.nodeVersion}\n` +
      `• Arquitetura: ${process.arch}`;
    
    await message.reply(formatReply(configText));
  },

  // Estatísticas de memória
  async showMemoryStats(message) {
    console.log(`[SYSTEM-MEMORY] 💾 Mostrando estatísticas de memória`);
    
    try {
      const memoryStats = await contextManager.getMemoryStats();
      
      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('💾 Estatísticas de Memória')
        .setDescription('Informações sobre o sistema de memória')
        .addFields(
          { name: '📝 Total de Memórias', value: (memoryStats.totalMemories || 0).toString(), inline: true },
          { name: '👥 Usuários Únicos', value: (memoryStats.uniqueUsers || 0).toString(), inline: true },
          { name: '🏠 Servidores', value: (memoryStats.totalGuilds || 0).toString(), inline: true },
          { name: '💬 Canais', value: (memoryStats.totalChannels || 0).toString(), inline: true },
          { name: '🔄 Última Limpeza', value: memoryStats.lastCleanup || 'Nunca', inline: true },
          { name: '📊 Tamanho do Cache', value: `${memoryStats.cacheSize || 0}MB`, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[SYSTEM-MEMORY] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar estatísticas de memória... 😅'));
    }
  },

  // Estatísticas de comandos
  async showCommandStats(message) {
    console.log(`[SYSTEM-COMMANDS] 📝 Mostrando estatísticas de comandos`);
    
    try {
      const commandStats = commandRouter.getStats();
      
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('📝 Estatísticas de Comandos')
        .setDescription('Informações sobre o uso de comandos')
        .addFields(
          { name: '📊 Total Execuções', value: (commandStats.totalExecutions || 0).toString(), inline: true },
          { name: '❌ Comandos Falharam', value: (commandStats.failedExecutions || 0).toString(), inline: true },
          { name: '✅ Taxa de Sucesso', value: `${commandStats.successRate || 0}%`, inline: true },
          { name: '⏰ Comando Mais Usado', value: commandStats.mostUsedCommand || 'N/A', inline: true },
          { name: '👤 Usuário Mais Ativo', value: commandStats.mostActiveUser || 'N/A', inline: true },
          { name: '🏠 Servidor Mais Ativo', value: commandStats.mostActiveGuild || 'N/A', inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[SYSTEM-COMMANDS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar estatísticas de comandos... 😅'));
    }
  },

  // Ajuda do sistema
  async showHelp(message) {
    const helpText = `⚙️ **Comando de Sistema Unificado**\n\n` +
      `**Uso:** \`n!system [subcomando]\`\n\n` +
      `**Subcomandos disponíveis:**\n` +
      `• \`n!system\` ou \`n!system status\` - Status geral do sistema\n` +
      `• \`n!system modelos\` - Lista modelos de IA\n` +
      `• \`n!system modelos test\` - Testa um modelo aleatório\n` +
      `• \`n!system modelos rotate\` - Força rotação de modelo\n` +
      `• \`n!system modelos reset\` - Reseta estatísticas\n` +
      `• \`n!system api\` - Status da API\n` +
      `• \`n!system config\` - Configurações do sistema\n` +
      `• \`n!system memory\` - Estatísticas de memória\n` +
      `• \`n!system commands\` - Estatísticas de comandos\n\n` +
      `**Exemplos:**\n` +
      `• \`n!system\`\n` +
      `• \`n!system modelos\`\n` +
      `• \`n!system api\`\n` +
      `• \`n!system memory\``;
    
    await message.reply(formatReply(helpText));
  },

  // Ajuda específica para modelos
  async showModelHelp(message) {
    const helpText = `🤖 **Gerenciamento de Modelos**\n\n` +
      `**Uso:** \`n!system modelos [ação]\`\n\n` +
      `**Ações disponíveis:**\n` +
      `• \`n!system modelos\` - Lista todos os modelos\n` +
      `• \`n!system modelos test\` - Testa um modelo aleatório\n` +
      `• \`n!system modelos rotate\` - Força rotação para próximo modelo\n` +
      `• \`n!system modelos reset\` - Reseta todas as estatísticas\n\n` +
      `**Exemplos:**\n` +
      `• \`n!system modelos\`\n` +
      `• \`n!system modelos test\`\n` +
      `• \`n!system modelos rotate\``;
    
    await message.reply(formatReply(helpText));
  }
};
