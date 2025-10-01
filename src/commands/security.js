// src/commands/security.js - Comando de gerenciamento de segurança
import { formatReply } from '../utils/formatReply.js';
import securityModule from '../modules/securityModule.js';

export default {
  commandName: 'security',
  description: 'Gerencia configurações e monitoramento de segurança',
  category: 'sistema',
  aliases: ['seguranca', 'sec'],
  permissions: ['ADMINISTRATOR'], // Apenas administradores

  async execute(message, client) {
    console.log(`[SECURITY-COMMAND] 🔒 Executando comando security para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const subcommand = args[0]?.toLowerCase();

      switch (subcommand) {
        case 'status':
        case 'stats':
          await this.showSecurityStatus(message);
          break;

        case 'logs':
          await this.showSecurityLogs(message, args[1]);
          break;

        case 'export':
          await this.exportSecurityLogs(message);
          break;

        case 'reset':
          await this.resetSecurityData(message);
          break;

        case 'config':
          await this.showSecurityConfig(message);
          break;

        default:
          await this.showSecurityHelp(message);
      }

    } catch (error) {
      console.error(`[SECURITY-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Algo deu errado com o comando de segurança. Tenta de novo! 😅'));
    }
  },

  // Mostra status de segurança
  async showSecurityStatus(message) {
    const stats = securityModule.getSecurityStats();
    
    let status = `🔒 **STATUS DE SEGURANÇA**\n\n`;
    
    // Estatísticas gerais
    status += `📊 **Estatísticas Gerais:**\n`;
    status += `• Total de Eventos: ${stats.totalEvents}\n`;
    status += `• Eventos Recentes (1h): ${stats.recentEvents}\n`;
    status += `• Rate Limits Ativos: ${stats.activeRateLimits}\n`;
    status += `• Tentativas Falhadas: ${stats.failedAttempts}\n\n`;
    
    // Eventos por severidade
    status += `🚨 **Eventos por Severidade (1h):**\n`;
    status += `• 🔴 Alta: ${stats.highSeverityEvents}\n`;
    status += `• 🟡 Média: ${stats.mediumSeverityEvents}\n`;
    status += `• 🟢 Baixa: ${stats.lowSeverityEvents}\n\n`;
    
    // Configurações
    status += `⚙️ **Configurações:**\n`;
    status += `• Logs de Segurança: ${stats.config.enableSecurityLogs ? '✅ Ativo' : '❌ Inativo'}\n`;
    status += `• Monitoramento: ${stats.config.enableActivityMonitoring ? '✅ Ativo' : '❌ Inativo'}\n`;
    status += `• Max Tentativas: ${stats.config.maxFailedAttempts}\n`;
    status += `• Rate Limit: ${stats.config.maxRequestsPerWindow}/min\n`;
    
    await message.reply(formatReply(status));
    console.log(`[SECURITY-COMMAND] ✅ Status de segurança exibido`);
  },

  // Mostra logs de segurança
  async showSecurityLogs(message, filter = null) {
    const stats = securityModule.getSecurityStats();
    
    if (stats.recentEvents === 0) {
      await message.reply(formatReply('🔒 **LOGS DE SEGURANÇA**\n\n✅ Nenhum evento de segurança nas últimas horas!'));
      return;
    }

    let logs = `🔒 **LOGS DE SEGURANÇA RECENTES**\n\n`;
    
    if (filter) {
      logs += `🔍 **Filtro:** ${filter}\n\n`;
    }

    // Mostra apenas os últimos 5 eventos
    const recentEvents = Array.from(securityModule.securityEvents.values())
      .filter(event => {
        const eventTime = new Date(event.timestamp).getTime();
        const oneHour = 60 * 60 * 1000;
        return Date.now() - eventTime < oneHour;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    recentEvents.forEach(event => {
      const severity = this.getSeverityEmoji(event.severity);
      const time = new Date(event.timestamp).toLocaleTimeString('pt-BR');
      
      logs += `${severity} **${event.type}** (${time})\n`;
      logs += `   ${JSON.stringify(event.details)}\n\n`;
    });

    if (recentEvents.length === 0) {
      logs += '✅ Nenhum evento encontrado com o filtro especificado.';
    }

    await message.reply(formatReply(logs));
    console.log(`[SECURITY-COMMAND] ✅ Logs de segurança exibidos`);
  },

  // Exporta logs de segurança
  async exportSecurityLogs(message) {
    await message.reply(formatReply('📄 Exportando logs de segurança...'));
    
    const filename = securityModule.exportSecurityLogs();
    
    if (filename) {
      await message.reply(formatReply(`✅ Logs exportados com sucesso!\n\n📁 Arquivo: \`${filename}\`\n\n⚠️ **IMPORTANTE:** Este arquivo contém informações sensíveis. Mantenha-o seguro!`));
    } else {
      await message.reply(formatReply('❌ Erro ao exportar logs. Verifique as permissões do sistema.'));
    }
    
    console.log(`[SECURITY-COMMAND] ✅ Logs exportados`);
  },

  // Reseta dados de segurança
  async resetSecurityData(message) {
    // Confirmação de segurança
    const confirmMessage = await message.reply(formatReply('⚠️ **CONFIRMAÇÃO DE SEGURANÇA**\n\nVocê está prestes a resetar TODOS os dados de segurança:\n\n• Rate limits\n• Tentativas falhadas\n• Logs de eventos\n\n**Digite `CONFIRMAR` para prosseguir ou `CANCELAR` para abortar.**'));
    
    try {
      const filter = (response) => {
        return response.author.id === message.author.id && 
               ['CONFIRMAR', 'CANCELAR'].includes(response.content.toUpperCase());
      };

      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
      const response = collected.first();

      if (!response) {
        await message.reply(formatReply('⏰ Tempo esgotado. Operação cancelada.'));
        return;
      }

      if (response.content.toUpperCase() === 'CANCELAR') {
        await message.reply(formatReply('❌ Operação cancelada pelo usuário.'));
        return;
      }

      if (response.content.toUpperCase() === 'CONFIRMAR') {
        // Reset dos dados
        securityModule.rateLimitTracker.clear();
        securityModule.failedAttempts.clear();
        securityModule.securityEvents.clear();
        
        await message.reply(formatReply('✅ **DADOS DE SEGURANÇA RESETADOS**\n\nTodos os dados foram limpos com sucesso!'));
        console.log(`[SECURITY-COMMAND] ✅ Dados de segurança resetados por ${message.author.username}`);
      }

    } catch (error) {
      await message.reply(formatReply('❌ Erro durante a confirmação. Operação cancelada.'));
    }
  },

  // Mostra configurações de segurança
  async showSecurityConfig(message) {
    const config = securityModule.config;
    
    let configText = `⚙️ **CONFIGURAÇÕES DE SEGURANÇA**\n\n`;
    
    configText += `🔧 **Configurações Gerais:**\n`;
    configText += `• Max Tentativas Falhadas: ${config.maxFailedAttempts}\n`;
    configText += `• Janela Rate Limit: ${config.rateLimitWindow / 1000}s\n`;
    configText += `• Max Requests/Janela: ${config.maxRequestsPerWindow}\n`;
    configText += `• Threshold Comandos Suspeitos: ${config.suspiciousCommandThreshold}\n\n`;
    
    configText += `📊 **Monitoramento:**\n`;
    configText += `• Logs de Segurança: ${config.enableSecurityLogs ? '✅ Ativo' : '❌ Inativo'}\n`;
    configText += `• Monitoramento Atividade: ${config.enableActivityMonitoring ? '✅ Ativo' : '❌ Inativo'}\n\n`;
    
    configText += `💡 **Padrões Suspeitos Monitorados:**\n`;
    for (const [pattern, data] of securityModule.suspiciousPatterns) {
      configText += `• ${pattern}: ${data.threshold} eventos em ${data.window / 1000}s\n`;
    }
    
    await message.reply(formatReply(configText));
    console.log(`[SECURITY-COMMAND] ✅ Configurações de segurança exibidas`);
  },

  // Mostra ajuda do comando
  async showSecurityHelp(message) {
    const help = `🔒 **COMANDOS DE SEGURANÇA**\n\n` +
      `**Comandos disponíveis:**\n` +
      `• \`n!security status\` - Status geral de segurança\n` +
      `• \`n!security logs [filtro]\` - Mostra logs recentes\n` +
      `• \`n!security export\` - Exporta logs para arquivo\n` +
      `• \`n!security reset\` - Reseta dados de segurança\n` +
      `• \`n!security config\` - Mostra configurações\n\n` +
      `**⚠️ IMPORTANTE:** Este comando requer permissões de administrador.\n\n` +
      `**Exemplo:** \`n!security status\``;
    
    await message.reply(formatReply(help));
    console.log(`[SECURITY-COMMAND] ✅ Ajuda de segurança exibida`);
  },

  // Obtém emoji de severidade
  getSeverityEmoji(severity) {
    const emojis = {
      'HIGH': '🔴',
      'MEDIUM': '🟡',
      'LOW': '🟢'
    };
    return emojis[severity] || '⚪';
  }
};
