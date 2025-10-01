// src/commands/memory.js - Comando para gerenciar memória da Alice
import { SlashCommandBuilder } from 'discord.js';
import contextManager from '../modules/contextManager.js';
import fs from 'fs';
import path from 'path';

export default {
  data: new SlashCommandBuilder()
    .setName('memory')
    .setDescription('Gerencia a memória de conversa da Alice')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Mostra status da memória atual')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('show')
        .setDescription('Mostra histórico recente da conversa')
        .addIntegerOption(option =>
          option
            .setName('limit')
            .setDescription('Número de mensagens para mostrar')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(20)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Limpa a memória da conversa atual')
        .addStringOption(option =>
          option
            .setName('confirmacao')
            .setDescription('Digite "CONFIRMAR" para limpar')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('export')
        .setDescription('Exporta dados da sessão atual')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Mostra estatísticas gerais da memória')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild?.id || null;
    const channelId = interaction.channel.id;
    const userId = interaction.user.id;

    if (subcommand === 'status') {
      try {
        const recentHistory = await contextManager.getRecentHistory(guildId, channelId, userId, 4);
        const summaries = await contextManager.getSummaries(guildId, channelId, userId);
        const lastBotMessage = await contextManager.getLastBotMessage(guildId, channelId, userId);

        const embed = {
          title: '🧠 Status da Memória da Alice',
          color: 0x9b59b6,
          fields: [
            {
              name: '📝 Histórico Recente',
              value: recentHistory.length > 0 
                ? `${recentHistory.length} mensagens na janela atual`
                : 'Nenhuma conversa ainda',
              inline: true
            },
            {
              name: '📋 Resumos',
              value: summaries.length > 0 
                ? `${summaries.length} resumos gerados`
                : 'Nenhum resumo ainda',
              inline: true
            },
            {
              name: '💬 Última Resposta',
              value: lastBotMessage 
                ? `${lastBotMessage.substring(0, 50)}...`
                : 'Nenhuma resposta ainda',
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Alice Memory System'
          }
        };

        await interaction.reply({ embeds: [embed] });

      } catch (error) {
        console.error('[MEMORY-COMMAND] Erro no status:', error.message);
        await interaction.reply('❌ Erro ao obter status da memória.');
      }

    } else if (subcommand === 'show') {
      try {
        const limit = interaction.options.getInteger('limit') || 8;
        const recentHistory = await contextManager.getRecentHistory(guildId, channelId, userId, limit);

        if (recentHistory.length === 0) {
          await interaction.reply('📭 Nenhuma conversa encontrada na memória.');
          return;
        }

        let historyText = '📚 **Histórico da Conversa:**\n\n';
        recentHistory.forEach((msg, index) => {
          const speaker = msg.role === 'user' ? '👤 Usuário' : '👧 Alice';
          const timestamp = new Date(msg.created_at).toLocaleString();
          historyText += `**${index + 1}.** ${speaker} (${timestamp})\n`;
          historyText += `> ${msg.content}\n\n`;
        });

        // Discord tem limite de 2000 caracteres por mensagem
        if (historyText.length > 1900) {
          historyText = historyText.substring(0, 1900) + '...\n*(truncado)*';
        }

        await interaction.reply(historyText);

      } catch (error) {
        console.error('[MEMORY-COMMAND] Erro ao mostrar histórico:', error.message);
        await interaction.reply('❌ Erro ao obter histórico da conversa.');
      }

    } else if (subcommand === 'clear') {
      const confirmacao = interaction.options.getString('confirmacao');
      
      if (confirmacao !== 'CONFIRMAR') {
        await interaction.reply('❌ Confirmação incorreta. Digite "CONFIRMAR" para limpar a memória.');
        return;
      }

      try {
        await contextManager.clearSession(guildId, channelId, userId);
        
        const embed = {
          title: '🧹 Memória Limpa',
          description: 'A memória da conversa foi limpa com sucesso!',
          color: 0xe74c3c,
          fields: [
            {
              name: '📝 Histórico',
              value: 'Removido',
              inline: true
            },
            {
              name: '📋 Resumos',
              value: 'Removidos',
              inline: true
            },
            {
              name: '💬 Última Resposta',
              value: 'Removida',
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        };

        await interaction.reply({ embeds: [embed] });

      } catch (error) {
        console.error('[MEMORY-COMMAND] Erro ao limpar memória:', error.message);
        await interaction.reply('❌ Erro ao limpar a memória.');
      }

    } else if (subcommand === 'export') {
      try {
        const recentHistory = await contextManager.getRecentHistory(guildId, channelId, userId, 20);
        const summaries = await contextManager.getSummaries(guildId, channelId, userId);

        const exportData = {
          session: {
            guildId: guildId,
            channelId: channelId,
            userId: userId,
            exportDate: new Date().toISOString()
          },
          recentHistory: recentHistory,
          summaries: summaries
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Cria arquivo temporário
        const tempFile = path.join(process.cwd(), 'temp_memory_export.json');
        
        fs.writeFileSync(tempFile, jsonString);

        await interaction.reply({
          content: '📤 **Dados da Sessão Exportados**',
          files: [{
            attachment: tempFile,
            name: `alice_memory_${userId}_${Date.now()}.json`
          }]
        });

        // Remove arquivo temporário
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFile);
          } catch (error) {
            console.error('[MEMORY-COMMAND] Erro ao remover arquivo temporário:', error.message);
          }
        }, 5000);

      } catch (error) {
        console.error('[MEMORY-COMMAND] Erro ao exportar:', error.message);
        await interaction.reply('❌ Erro ao exportar dados da sessão.');
      }

    } else if (subcommand === 'stats') {
      try {
        const stats = await contextManager.getMemoryStats();
        
        const embed = {
          title: '📊 Estatísticas da Memória',
          color: 0x3498db,
          fields: [
            {
              name: '🗄️ Armazenamento',
              value: `**Sessões:** ${stats.sessions}\n**Mensagens:** ${stats.messages}\n**Resumos:** ${stats.summaries}`,
              inline: true
            },
            {
              name: '💾 Cache',
              value: `**Tamanho:** ${stats.cacheSize}\n**Flushes Pendentes:** ${stats.pendingFlushes}`,
              inline: true
            },
            {
              name: '📝 Sumarizador',
              value: `**Máx. Caracteres:** ${stats.summarizer?.maxSummaryLength || 'N/A'}\n**Máx. Mensagens:** ${stats.summarizer?.maxMessagesToSummarize || 'N/A'}`,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Alice Memory Statistics'
          }
        };

        await interaction.reply({ embeds: [embed] });

      } catch (error) {
        console.error('[MEMORY-COMMAND] Erro nas estatísticas:', error.message);
        await interaction.reply('❌ Erro ao obter estatísticas da memória.');
      }
    }
  }
};
