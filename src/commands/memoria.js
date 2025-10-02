// src/commands/memoria.js - Comando unificado n!memoria (CONSOLIDADO)
import { formatReply } from '../utils/formatReply.js';
import storyTeller from '../modules/storyTeller.js';
import emotionBase from '../modules/emotionBase.js';
import contextManager from '../modules/contextManager.js';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'memoria',
  description: 'Comando unificado para gerenciar memória da Alice',
  category: 'sistema',
  aliases: ['lembrança', 'lembranca', 'memory', 'lembrar'],

  async execute(message, client) {
    console.log(`[MEMORIA-COMMAND] 🧠 Executando comando memoria para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const subcommand = args[0]?.toLowerCase() || 'gerar';

      switch (subcommand) {
        case 'gerar':
        case 'generate':
        case 'criar':
          await this.generateMemory(message);
          break;

        case 'status':
        case 'info':
          await this.showMemoryStatus(message);
          break;

        case 'show':
        case 'mostrar':
        case 'historico':
          await this.showHistory(message, args[1]);
          break;

        case 'clear':
        case 'limpar':
          await this.clearMemory(message);
          break;

        case 'export':
        case 'exportar':
          await this.exportMemory(message);
          break;

        case 'stats':
        case 'estatisticas':
          await this.showMemoryStats(message);
          break;

        default:
          await this.showHelp(message);
      }
    } catch (error) {
      console.error(`[MEMORIA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Tenho muitas lembranças especiais nossas guardadas no coração! 💕'));
    }
  },

  // Gera uma nova memória
  async generateMemory(message) {
    console.log(`[MEMORIA-GENERATE] 🧠 Gerando nova memória`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Busca histórico real
      const contextHistory = await this.getContextHistory(guildId, channelId, userId);
      
      // Determina se deve usar IA
      const useAI = config.useAI && await this.isAIAvailable();
      
      // Gera memória
      const memory = await storyTeller.generateMemory(contextHistory, useAI);
      
      // Aplica variação emocional
      const finalMemory = emotionBase.applyEmotionVariation(memory, emotionBase.getIntensityByMood());
      
      await message.reply(formatReply(finalMemory));
      console.log(`[MEMORIA-GENERATE] ✅ Memória gerada com sucesso`);
      
    } catch (error) {
      console.error(`[MEMORIA-GENERATE] 💥 Erro:`, error.message);
      await message.reply(formatReply('Tenho muitas lembranças especiais nossas guardadas no coração! 💕'));
    }
  },

  // Mostra status da memória
  async showMemoryStatus(message) {
    console.log(`[MEMORIA-STATUS] 📊 Mostrando status da memória`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const memoryStats = await contextManager.getMemoryStats();
      const userStats = await contextManager.getUserStats(guildId, userId);
      
      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('🧠 Status da Memória da Alice')
        .setDescription('Informações sobre o sistema de memória')
        .addFields(
          { name: '📝 Total de Memórias', value: (memoryStats.totalMemories || 0).toString(), inline: true },
          { name: '👥 Usuários Únicos', value: (memoryStats.uniqueUsers || 0).toString(), inline: true },
          { name: '🏠 Servidores', value: (memoryStats.totalGuilds || 0).toString(), inline: true },
          { name: '💬 Canais', value: (memoryStats.totalChannels || 0).toString(), inline: true },
          { name: '🔄 Última Limpeza', value: memoryStats.lastCleanup || 'Nunca', inline: true },
          { name: '📊 Tamanho do Cache', value: `${memoryStats.cacheSize || 0}MB`, inline: true },
          { name: '👤 Suas Interações', value: (userStats.totalInteractions || 0).toString(), inline: true },
          { name: '💾 Suas Memórias', value: (userStats.totalMemories || 0).toString(), inline: true },
          { name: '⏰ Última Interação', value: userStats.lastInteraction || 'Nunca', inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[MEMORIA-STATUS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar status da memória... 😅'));
    }
  },

  // Mostra histórico de conversa
  async showHistory(message, limit = '10') {
    console.log(`[MEMORIA-HISTORY] 📚 Mostrando histórico`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const limitNum = parseInt(limit) || 10;
      const maxLimit = Math.min(limitNum, 20); // Máximo 20 mensagens
      
      const history = await contextManager.getRecentHistory(guildId, channelId, userId, maxLimit);
      
      if (history.length === 0) {
        await message.reply(formatReply('Ainda não temos muitas conversas para lembrar... Vamos criar algumas memórias juntos! 💕'));
        return;
      }
      
      let historyText = `📚 **Histórico Recente (${history.length} mensagens)**\n\n`;
      
      history.forEach((msg, index) => {
        const timestamp = new Date(msg.created_at).toLocaleString();
        const role = msg.role === 'user' ? '👤 Você' : '🤖 Alice';
        historyText += `${index + 1}. ${role} (${timestamp}):\n${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n\n`;
      });
      
      await message.reply(formatReply(historyText));
      
    } catch (error) {
      console.error(`[MEMORIA-HISTORY] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar histórico... 😅'));
    }
  },

  // Limpa memória
  async clearMemory(message) {
    console.log(`[MEMORIA-CLEAR] 🗑️ Limpando memória`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Verifica se é administrador
      if (!message.member?.permissions.has('Administrator')) {
        await message.reply(formatReply('Apenas administradores podem limpar a memória! 🔒'));
        return;
      }
      
      await contextManager.clearUserMemory(guildId, userId);
      await message.reply(formatReply('🧹 Memória limpa com sucesso! Alice esqueceu tudo sobre você... 😢'));
      
    } catch (error) {
      console.error(`[MEMORIA-CLEAR] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao limpar memória... 😅'));
    }
  },

  // Exporta memória
  async exportMemory(message) {
    console.log(`[MEMORIA-EXPORT] 📤 Exportando memória`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const memoryData = await contextManager.exportUserMemory(guildId, userId);
      
      const exportText = `📤 **Export da Memória**\n\n` +
        `👤 Usuário: ${message.author.username}\n` +
        `📅 Data: ${new Date().toLocaleString()}\n` +
        `📝 Total de Interações: ${memoryData.totalInteractions}\n` +
        `💾 Total de Memórias: ${memoryData.totalMemories}\n\n` +
        `**Resumos:**\n${memoryData.summaries.map(s => `• ${s.content}`).join('\n')}\n\n` +
        `**Histórico Recente:**\n${memoryData.recentHistory.map(h => `• ${h.content}`).join('\n')}`;
      
      await message.reply(formatReply(exportText));
      
    } catch (error) {
      console.error(`[MEMORIA-EXPORT] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao exportar memória... 😅'));
    }
  },

  // Mostra estatísticas de memória
  async showMemoryStats(message) {
    console.log(`[MEMORIA-STATS] 📊 Mostrando estatísticas`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const stats = await contextManager.getDetailedStats(guildId, channelId, userId);
      
      const statsText = `📊 **Estatísticas Detalhadas da Memória**\n\n` +
        `**Geral:**\n` +
        `• Total de Sessões: ${stats.totalSessions}\n` +
        `• Total de Mensagens: ${stats.totalMessages}\n` +
        `• Total de Resumos: ${stats.totalSummaries}\n\n` +
        `**Sua Interação:**\n` +
        `• Suas Mensagens: ${stats.userMessages}\n` +
        `• Mensagens da Alice: ${stats.aliceMessages}\n` +
        `• Tempo Médio de Resposta: ${stats.averageResponseTime}ms\n\n` +
        `**Frequência:**\n` +
        `• Interações Hoje: ${stats.interactionsToday}\n` +
        `• Interações Esta Semana: ${stats.interactionsThisWeek}\n` +
        `• Interações Este Mês: ${stats.interactionsThisMonth}`;
      
      await message.reply(formatReply(statsText));
      
    } catch (error) {
      console.error(`[MEMORIA-STATS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Erro ao mostrar estatísticas... 😅'));
    }
  },

  // Ajuda
  async showHelp(message) {
    const helpText = `🧠 **Comando de Memória Unificado**\n\n` +
      `**Uso:** \`n!memoria [subcomando]\`\n\n` +
      `**Subcomandos disponíveis:**\n` +
      `• \`n!memoria\` ou \`n!memoria gerar\` - Gera uma nova memória\n` +
      `• \`n!memoria status\` - Mostra status da memória\n` +
      `• \`n!memoria show [limite]\` - Mostra histórico recente\n` +
      `• \`n!memoria clear\` - Limpa memória (admin)\n` +
      `• \`n!memoria export\` - Exporta dados da memória\n` +
      `• \`n!memoria stats\` - Mostra estatísticas detalhadas\n\n` +
      `**Exemplos:**\n` +
      `• \`n!memoria\`\n` +
      `• \`n!memoria status\`\n` +
      `• \`n!memoria show 5\`\n` +
      `• \`n!memoria stats\``;
    
    await message.reply(formatReply(helpText));
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.memoria || {};
    } catch (error) {
      console.error('[MEMORIA-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Obtém histórico de contexto
  async getContextHistory(guildId, channelId, userId) {
    try {
      // Busca histórico recente
      const recentHistory = await contextManager.getRecentHistory(guildId, channelId, userId, 10);
      
      // Busca resumos
      const summaries = await contextManager.getSummaries(guildId, channelId, userId);
      
      // Combina histórico e resumos
      const contextHistory = [];
      
      // Adiciona resumos primeiro (mais relevantes)
      summaries.forEach(summary => {
        contextHistory.push({
          content: summary.content,
          role: 'summary',
          created_at: summary.created_at
        });
      });
      
      // Adiciona histórico recente
      recentHistory.forEach(msg => {
        contextHistory.push({
          content: msg.content,
          role: msg.role,
          created_at: msg.created_at
        });
      });
      
      console.log(`[MEMORIA-COMMAND] 📚 Histórico obtido: ${contextHistory.length} itens`);
      return contextHistory;
      
    } catch (error) {
      console.error('[MEMORIA-COMMAND] Erro ao obter histórico:', error.message);
      return [];
    }
  },

  // Verifica se IA está disponível
  async isAIAvailable() {
    try {
      const apiRotator = await import('../utils/apiRotator.js');
      const stats = apiRotator.default.getStats();
      return stats.activeModels > 0;
    } catch (error) {
      return false;
    }
  }
};
