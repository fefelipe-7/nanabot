// src/commands/teste-melhorias.js - Comando para testar melhorias implementadas
import { formatReply } from '../utils/formatReply.js';
import cooldownManager from '../modules/cooldownManager.js';
import contextIntelligence from '../modules/contextIntelligence.js';
import affectionService from '../modules/affectionService.js';

export default {
  commandName: 'teste-melhorias',
  description: 'Testa as melhorias implementadas nos comandos',
  category: 'sistema',
  aliases: ['teste-melhorias', 'melhorias'],
  
  async execute(message, client) {
    console.log(`[TESTE-MELHORIAS] 🧪 Executando teste de melhorias para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Testa cooldown manager
      const cooldownStats = cooldownManager.getStats();
      console.log(`[TESTE-MELHORIAS] ⏰ Cooldown Manager: ${cooldownStats.cacheSize} cooldowns em cache`);
      
      // Testa context intelligence
      const userContext = await contextIntelligence.analyzeUserContext(guildId, userId, channelId);
      console.log(`[TESTE-MELHORIAS] 🧠 Context Intelligence: ${userContext.affectionLevelName} (${userContext.relationshipStatus})`);
      
      // Testa affection service
      const affectionStats = await affectionService.getUserStats(guildId, userId);
      console.log(`[TESTE-MELHORIAS] 💕 Affection Service: ${affectionStats.hugs_given} abraços, score ${affectionStats.love_score}`);
      
      // Gera relatório de melhorias
      const report = this.generateImprovementsReport(userContext, cooldownStats, affectionStats);
      
      await message.reply(formatReply(report));
      console.log(`[TESTE-MELHORIAS] ✅ Relatório de melhorias enviado com sucesso`);
      
    } catch (error) {
      console.error(`[TESTE-MELHORIAS] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Algo deu errado no teste. Tenta de novo! 😅'));
    }
  },

  // Gera relatório das melhorias
  generateImprovementsReport(userContext, cooldownStats, affectionStats) {
    const { affectionLevel, relationshipStatus, preferences, temporalContext, behaviorPatterns } = userContext;
    
    let report = `🧪 **RELATÓRIO DE MELHORIAS IMPLEMENTADAS**\n\n`;
    
    // Seção de Context Intelligence
    report += `🧠 **Context Intelligence:**\n`;
    report += `• Nível de Afeto: ${affectionLevel.toFixed(2)} (${userContext.affectionLevelName})\n`;
    report += `• Relacionamento: ${relationshipStatus}\n`;
    report += `• Horário: ${temporalContext.timeOfDay}\n`;
    report += `• Interesses: ${preferences.topics.join(', ') || 'não detectados'}\n`;
    report += `• Estilo de Comunicação: ${preferences.communicationStyle}\n`;
    report += `• Padrão de Comportamento: ${behaviorPatterns.interactionStyle}\n\n`;
    
    // Seção de Cooldown Manager
    report += `⏰ **Cooldown Manager:**\n`;
    report += `• Cooldowns em Cache: ${cooldownStats.cacheSize}\n`;
    report += `• Sistema Inicializado: ${cooldownStats.initialized ? '✅' : '❌'}\n`;
    report += `• Tamanho Máximo do Cache: ${cooldownStats.maxCacheSize}\n\n`;
    
    // Seção de Affection Service
    report += `💕 **Affection Service:**\n`;
    report += `• Abraços Dados: ${affectionStats.hugs_given}\n`;
    report += `• Score de Amor: ${affectionStats.love_score}\n`;
    report += `• Total de Interações: ${affectionStats.totalInteractions || 0}\n\n`;
    
    // Seção de Melhorias Implementadas
    report += `✨ **MELHORIAS IMPLEMENTADAS:**\n`;
    report += `• ✅ Cooldowns Inteligentes por Comando\n`;
    report += `• ✅ Análise Contextual Completa\n`;
    report += `• ✅ Personalização Baseada em Relacionamento\n`;
    report += `• ✅ Detecção de Preferências\n`;
    report += `• ✅ Padrões de Comportamento\n`;
    report += `• ✅ Contexto Temporal (horário, dia da semana)\n`;
    report += `• ✅ Intensidades de Abraço Expandidas\n`;
    report += `• ✅ Elogios Personalizados por Contexto\n`;
    report += `• ✅ Cache Inteligente para Performance\n`;
    report += `• ✅ Cooldowns Dinâmicos Baseados em Uso\n\n`;
    
    // Seção de Comandos Aprimorados
    report += `🎯 **COMANDOS APRIMORADOS:**\n`;
    report += `• \`n!elogio\` - Agora personalizado por contexto\n`;
    report += `• \`n!abracar\` - 6 intensidades diferentes\n`;
    report += `• \`n!meama\` - Respostas baseadas em afeto\n`;
    report += `• \`n!chorar\` - Mini-eventos com consolação\n`;
    report += `• \`n!conta\` - Histórias com slot-filling\n`;
    report += `• \`n!historinha\` - Fábulas personalizadas\n`;
    report += `• \`n!memoria\` - Lembranças reais ou inventadas\n`;
    report += `• \`n!fantasia\` - Modo interativo\n\n`;
    
    report += `🎉 **Sistema muito mais inteligente e personalizado!**`;
    
    return report;
  }
};
