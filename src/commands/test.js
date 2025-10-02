// src/commands/test.js - Comando unificado n!test (CONSOLIDADO)
import { formatReply } from '../utils/formatReply.js';
import apiRotator from '../utils/apiRotator.js';
import brainModule from '../core/brain.js';
import cooldownManager from '../modules/cooldownManager.js';
import contextIntelligence from '../modules/contextIntelligence.js';
import affectionService from '../modules/affectionService.js';
import { EmbedBuilder } from 'discord.js';

export default {
  commandName: 'test',
  description: 'Comando unificado para testar todos os sistemas da Alice',
  category: 'sistema',
  aliases: ['teste', 't', 'debug'],

  async execute(message, client) {
    console.log(`[TEST-COMMAND] 🧪 Executando comando test unificado para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const testType = args[0]?.toLowerCase() || 'basic';

      switch (testType) {
        case 'basic':
        case 'comando':
          await this.testBasic(message);
          break;
          
        case 'modelos':
        case 'models':
        case 'ia':
          await this.testModels(message, args[1]);
          break;
          
        case 'sistemas':
        case 'systems':
        case 'brain':
          await this.testSystems(message, args[1]);
          break;
          
        case 'config':
        case 'configuracao':
          await this.testConfig(message);
          break;
          
        case 'melhorias':
        case 'improvements':
          await this.testImprovements(message);
          break;
          
        case 'status':
        case 'info':
          await this.showStatus(message);
          break;
          
        default:
          await this.showHelp(message);
      }
    } catch (error) {
      console.error(`[TEST-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha no teste... 😅'));
    }
  },

  // Teste básico de comando
  async testBasic(message) {
    const testResponse = `🧪 **Teste Básico do Sistema**\n\n` +
      `✅ Comando executado com sucesso!\n` +
      `👤 Usuário: ${message.author.username}\n` +
      `📝 Comando: ${message.content}\n` +
      `⏰ Timestamp: ${new Date().toLocaleString()}\n\n` +
      `🎯 Sistema de comandos funcionando perfeitamente!`;
    
    await message.reply(formatReply(testResponse));
  },

  // Teste de modelos de IA
  async testModels(message, mode = 'simple') {
    console.log(`[TEST-MODELS] 🤖 Testando modelos (modo: ${mode})`);
    
    try {
      const stats = apiRotator.getStats();
      const activeModels = stats.models.filter(m => m.isActive);
      
      if (activeModels.length === 0) {
        await message.reply(formatReply('❌ Nenhum modelo ativo encontrado!'));
        return;
      }

      let modelsToTest = [];
      let testMessage = '';

      switch (mode) {
        case 'all':
          modelsToTest = activeModels;
          testMessage = `🧪 **TESTE COMPLETO DE MODELOS**\n\nTestando ${modelsToTest.length} modelos ativos...\n⏳ Isso pode levar alguns minutos!`;
          break;
        case 'gradual':
          modelsToTest = activeModels.slice(0, 5); // Apenas 5 para teste gradual
          testMessage = `🧪 **TESTE GRADUAL DE MODELOS**\n\nTestando ${modelsToTest.length} modelos com delays...\n⏳ Isso pode levar alguns minutos!`;
          break;
        default: // simple
          modelsToTest = activeModels.slice(0, 3); // Apenas 3 para teste simples
          testMessage = `🧪 **TESTE SIMPLES DE MODELOS**\n\nTestando ${modelsToTest.length} modelos principais...`;
      }

      await message.reply(formatReply(testMessage));

      const results = {
        working: [],
        failed: [],
        rateLimited: []
      };

      for (let i = 0; i < modelsToTest.length; i++) {
        const model = modelsToTest[i];
        
        try {
          if (mode === 'gradual') {
            await message.reply(formatReply(`🧪 Testando: ${model.name}`));
            await new Promise(resolve => setTimeout(resolve, 2000)); // Delay de 2s
          }
          
          const startTime = Date.now();
          const response = await apiRotator.generateResponse('Teste de conectividade', model.name);
          const responseTime = Date.now() - startTime;
          
          results.working.push({
            name: model.name,
            responseTime: responseTime,
            response: response.substring(0, 100) + '...'
          });
          
          if (mode !== 'gradual') {
            await message.reply(formatReply(`✅ ${model.name}: ${responseTime}ms`));
          }
          
        } catch (error) {
          results.failed.push({
            name: model.name,
            error: error.message
          });
          
          if (mode !== 'gradual') {
            await message.reply(formatReply(`❌ ${model.name}: ${error.message}`));
          }
        }
      }

      // Resultado final
      const embed = new EmbedBuilder()
        .setColor('#00ff88')
        .setTitle('🧪 Resultado dos Testes de Modelos')
        .addFields(
          { name: '✅ Funcionando', value: results.working.length.toString(), inline: true },
          { name: '❌ Falharam', value: results.failed.length.toString(), inline: true },
          { name: '⏱️ Tempo Médio', value: results.working.length > 0 ? `${Math.round(results.working.reduce((a, b) => a + b.responseTime, 0) / results.working.length)}ms` : 'N/A', inline: true }
        );

      if (results.working.length > 0) {
        embed.addFields({
          name: '🎯 Modelos Funcionando',
          value: results.working.map(m => `• ${m.name} (${m.responseTime}ms)`).join('\n'),
          inline: false
        });
      }

      if (results.failed.length > 0) {
        embed.addFields({
          name: '💥 Modelos com Problema',
          value: results.failed.map(m => `• ${m.name}: ${m.error}`).join('\n'),
          inline: false
        });
      }

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error(`[TEST-MODELS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao testar modelos... 😅'));
    }
  },

  // Teste de sistemas internos
  async testSystems(message, system = 'all') {
    console.log(`[TEST-SYSTEMS] 🧠 Testando sistemas (${system})`);
    
    try {
      const { getCompleteStats, getBrainStatus } = brainModule;
      
      if (system === 'all' || system === 'brain') {
        const brainStats = getCompleteStats();
        await message.reply(formatReply(`🧠 **Sistema Cerebral:**\n${JSON.stringify(brainStats, null, 2).substring(0, 1000)}...`));
      }
      
      if (system === 'all' || system === 'memory') {
        const memoryStats = await contextIntelligence.analyzeUserContext(message.guild?.id || 'dm', message.author.id, message.channel.id);
        await message.reply(formatReply(`💾 **Sistema de Memória:**\n${JSON.stringify(memoryStats, null, 2).substring(0, 1000)}...`));
      }
      
    } catch (error) {
      console.error(`[TEST-SYSTEMS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao testar sistemas... 😅'));
    }
  },

  // Teste de configuração
  async testConfig(message) {
    console.log(`[TEST-CONFIG] 🔧 Testando configuração`);
    
    const config = {
      discordToken: process.env.DISCORD_TOKEN ? '✅ Configurado' : '❌ Não configurado',
      openrouterKey: process.env.OPENROUTER_API_KEY ? '✅ Configurado' : '❌ Não configurado',
      discordClientId: process.env.DISCORD_CLIENT_ID ? '✅ Configurado' : '⚠️ Opcional',
      discordAppId: process.env.DISCORD_APPLICATION_ID ? '✅ Configurado' : '⚠️ Opcional',
      discordPublicKey: process.env.DISCORD_PUBLIC_KEY ? '✅ Configurado' : '⚠️ Opcional'
    };
    
    let tokenFormat = '❌ Inválido';
    if (process.env.DISCORD_TOKEN) {
      const token = process.env.DISCORD_TOKEN;
      if (token.startsWith('MT') || token.startsWith('MTA')) {
        tokenFormat = '✅ Formato correto';
      } else {
        tokenFormat = '❌ Formato incorreto (deve começar com MT ou MTA)';
      }
    }
    
    const configText = `🔧 **Teste de Configuração**\n\n` +
      `**Variáveis de Ambiente:**\n` +
      `• Discord Token: ${config.discordToken}\n` +
      `• OpenRouter Key: ${config.openrouterKey}\n` +
      `• Discord Client ID: ${config.discordClientId}\n` +
      `• Discord App ID: ${config.discordAppId}\n` +
      `• Discord Public Key: ${config.discordPublicKey}\n\n` +
      `**Formato do Token:** ${tokenFormat}\n\n` +
      `**Node.js:** ${process.version}\n` +
      `**Plataforma:** ${process.platform}\n` +
      `**Arquitetura:** ${process.arch}`;
    
    await message.reply(formatReply(configText));
  },

  // Teste de melhorias
  async testImprovements(message) {
    console.log(`[TEST-IMPROVEMENTS] 🚀 Testando melhorias`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const cooldownStats = cooldownManager.getStats();
      const userContext = await contextIntelligence.analyzeUserContext(guildId, userId, channelId);
      const affectionStats = await affectionService.getUserStats(guildId, userId);
      
      const improvementsText = `🚀 **Teste de Melhorias Implementadas**\n\n` +
        `**Cooldown Manager:**\n` +
        `• Cache Size: ${cooldownStats.cacheSize}\n` +
        `• Total Commands: ${cooldownStats.totalCommands}\n\n` +
        `**Context Intelligence:**\n` +
        `• Affection Level: ${userContext.affectionLevelName}\n` +
        `• Relationship: ${userContext.relationshipStatus}\n\n` +
        `**Affection Service:**\n` +
        `• Total Interactions: ${affectionStats.totalInteractions}\n` +
        `• Affection Level: ${affectionStats.affectionLevel}`;
      
      await message.reply(formatReply(improvementsText));
      
    } catch (error) {
      console.error(`[TEST-IMPROVEMENTS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao testar melhorias... 😅'));
    }
  },

  // Status geral
  async showStatus(message) {
    console.log(`[TEST-STATUS] 📊 Mostrando status geral`);
    
    try {
      const apiStats = apiRotator.getStats();
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      const statusText = `📊 **Status Geral do Sistema**\n\n` +
        `🟢 **Status:** Online e funcionando\n` +
        `⏰ **Uptime:** ${hours}h ${minutes}m\n` +
        `💾 **Memória:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n` +
        `🤖 **Modelos Ativos:** ${apiStats.models.filter(m => m.isActive).length}\n` +
        `📈 **Total de Requisições:** ${apiStats.totalRequests}\n` +
        `✅ **Taxa de Sucesso:** ${apiStats.successRate}%`;
      
      await message.reply(formatReply(statusText));
      
    } catch (error) {
      console.error(`[TEST-STATUS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar status... 😅'));
    }
  },

  // Ajuda
  async showHelp(message) {
    const helpText = `🧪 **Comando de Teste Unificado**\n\n` +
      `**Uso:** \`n!test [tipo]\`\n\n` +
      `**Tipos disponíveis:**\n` +
      `• \`n!test\` ou \`n!test basic\` - Teste básico de comando\n` +
      `• \`n!test modelos\` - Teste simples de modelos de IA\n` +
      `• \`n!test modelos all\` - Teste completo de todos os modelos\n` +
      `• \`n!test modelos gradual\` - Teste gradual com delays\n` +
      `• \`n!test sistemas\` - Teste de sistemas internos\n` +
      `• \`n!test config\` - Teste de configuração\n` +
      `• \`n!test melhorias\` - Teste de melhorias implementadas\n` +
      `• \`n!test status\` - Status geral do sistema\n\n` +
      `**Exemplos:**\n` +
      `• \`n!test\`\n` +
      `• \`n!test modelos\`\n` +
      `• \`n!test sistemas brain\`\n` +
      `• \`n!test config\``;
    
    await message.reply(formatReply(helpText));
  }
};
