// src/commands/modelos.js - Comando para gerenciar modelos de IA
import { formatReply } from '../utils/formatReply.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  commandName: 'modelos',
  description: 'Gerencia e testa os modelos de IA disponíveis',
  category: 'sistema',
  aliases: ['models', 'ia', 'ai'],
  
  async execute(message, client) {
    console.log(`[MODELOS-COMMAND] 🤖 Executando comando modelos para ${message.author.username}`);
    
    try {
      const args = message.content.split(' ').slice(1);
      const subcommand = args[0]?.toLowerCase();
      
      switch (subcommand) {
        case 'status':
        case 'stats':
          await this.showStatus(message);
          break;
          
        case 'list':
        case 'lista':
          await this.listModels(message, args[1]);
          break;
          
        case 'test':
        case 'teste':
          await this.testModel(message, args[1]);
          break;
          
        case 'rotate':
        case 'rotacionar':
          await this.forceRotation(message);
          break;
          
        case 'reset':
          await this.resetStats(message);
          break;
          
        default:
          await this.showHelp(message);
      }
      
    } catch (error) {
      console.error(`[MODELOS-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Algo deu errado com o comando de modelos. Tenta de novo! 😅'));
    }
  },

  // Mostra status geral dos modelos
  async showStatus(message) {
    const stats = apiRotator.getStats();
    
    let status = `🤖 **STATUS DOS MODELOS DE IA**\n\n`;
    
    // Estatísticas gerais
    status += `📊 **Estatísticas Gerais:**\n`;
    status += `• Total de Modelos: ${stats.totalModels}\n`;
    status += `• Modelos Ativos: ${stats.activeModels}\n`;
    status += `• Modelos Confirmados: ${stats.confirmedModels}\n`;
    status += `• Modelos em Teste: ${stats.testingModels}\n`;
    status += `• Requisições Totais: ${stats.totalRequests}\n`;
    status += `• Taxa de Sucesso: ${stats.successRate}\n`;
    status += `• Limite Diário Total: ${stats.totalDailyLimit}\n`;
    status += `• Requisições Usadas: ${stats.totalUsed}\n`;
    status += `• Requisições Restantes: ${stats.remainingRequests}\n\n`;
    
    // Status de rate limit
    const inactiveModels = stats.models.filter(m => !m.isActive);
    if (inactiveModels.length > 0) {
      status += `🚫 **Modelos Inativos (${inactiveModels.length}):**\n`;
      inactiveModels.slice(0, 5).forEach(model => {
        status += `• ${model.name}\n`;
      });
      if (inactiveModels.length > 5) {
        status += `• ... e mais ${inactiveModels.length - 5} modelos\n`;
      }
      status += `\n`;
    }
    
    // Estatísticas por categoria
    status += `📈 **Por Categoria:**\n`;
    Object.entries(stats.categoryStats).forEach(([category, catStats]) => {
      const categoryName = this.getCategoryDisplayName(category);
      const usagePercent = ((catStats.totalUsed / catStats.totalLimit) * 100).toFixed(1);
      status += `• **${categoryName}**: ${catStats.active}/${catStats.total} ativos (${usagePercent}% usado)\n`;
    });
    
    // Aviso sobre rate limit
    if (stats.activeModels < stats.totalModels * 0.5) {
      status += `\n⚠️ **AVISO:** Muitos modelos estão inativos! Use \`n!teste-modelos-gradual\` para testar gradualmente.`;
    }
    
    await message.reply(formatReply(status));
    console.log(`[MODELOS-COMMAND] ✅ Status dos modelos exibido`);
  },

  // Lista modelos por categoria
  async listModels(message, category = null) {
    const stats = apiRotator.getStats();
    
    let list = `🤖 **LISTA DE MODELOS DE IA**\n\n`;
    
    if (category) {
      // Lista específica de categoria
      const categoryModels = stats.models.filter(m => m.category === category);
      if (categoryModels.length === 0) {
        await message.reply(formatReply(`Categoria "${category}" não encontrada! Use: confirmed, testing`));
        return;
      }
      
      const categoryName = this.getCategoryDisplayName(category);
      list += `📋 **${categoryName}:**\n`;
      
      categoryModels.forEach(model => {
        const status = model.isActive ? '✅' : '❌';
        list += `${status} **${model.name}**\n`;
        list += `   ${model.description}\n`;
        list += `   Uso: ${model.usage} (${model.usagePercent}%)\n\n`;
      });
    } else {
      // Lista todas as categorias
      const categories = ['confirmed', 'testing'];
      
      categories.forEach(cat => {
        const categoryModels = stats.models.filter(m => m.category === cat);
        const categoryName = this.getCategoryDisplayName(cat);
        
        list += `📋 **${categoryName}:**\n`;
        categoryModels.slice(0, 4).forEach(model => {
          const status = model.isActive ? '✅' : '❌';
          list += `${status} ${model.name} (${model.usagePercent}%)\n`;
        });
        if (categoryModels.length > 4) {
          list += `   ... e mais ${categoryModels.length - 4} modelos\n`;
        }
        list += '\n';
      });
      
      list += `💡 Use \`n!modelos list [categoria]\` para ver detalhes de uma categoria específica`;
    }
    
    await message.reply(formatReply(list));
    console.log(`[MODELOS-COMMAND] ✅ Lista de modelos exibida`);
  },

  // Testa um modelo específico
  async testModel(message, modelName) {
    if (!modelName) {
      await message.reply(formatReply('Especifique um modelo para testar! Ex: `n!modelos test nvidia/nemotron-nano-9b-v2:free`'));
      return;
    }
    
    await message.reply(formatReply(`🧪 Testando modelo ${modelName}...`));
    
    try {
      const testPrompt = `Você é Alice, uma menina de 4 anos. Responda apenas "Oi! Sou a Alice!" de forma carinhosa.`;
      
      const startTime = Date.now();
      const response = await apiRotator.makeRequest(testPrompt, { testMode: true });
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      let result = `🧪 **TESTE DO MODELO**\n\n`;
      result += `🤖 Modelo: ${modelName}\n`;
      result += `⏱️ Tempo de Resposta: ${responseTime}ms\n`;
      result += `📝 Resposta: ${response}\n\n`;
      
      if (responseTime < 2000) {
        result += `✅ **Status: EXCELENTE** (resposta rápida)`;
      } else if (responseTime < 5000) {
        result += `✅ **Status: BOM** (resposta aceitável)`;
      } else {
        result += `⚠️ **Status: LENTO** (resposta demorada)`;
      }
      
      await message.reply(formatReply(result));
      console.log(`[MODELOS-COMMAND] ✅ Teste do modelo ${modelName} concluído em ${responseTime}ms`);
      
    } catch (error) {
      await message.reply(formatReply(`❌ **ERRO NO TESTE**\n\nModelo: ${modelName}\nErro: ${error.message}`));
      console.log(`[MODELOS-COMMAND] ❌ Erro no teste do modelo ${modelName}:`, error.message);
    }
  },

  // Força rotação para próximo modelo
  async forceRotation(message) {
    apiRotator.forceRotation();
    const stats = apiRotator.getStats();
    
    await message.reply(formatReply(`🔄 **ROTAÇÃO FORÇADA**\n\nPróximo modelo será selecionado automaticamente na próxima requisição!\n\nTotal de rotações: ${stats.rotationCount || 0}`));
    console.log(`[MODELOS-COMMAND] ✅ Rotação forçada executada`);
  },

  // Reseta estatísticas
  async resetStats(message) {
    apiRotator.clearStats();
    
    await message.reply(formatReply(`🧹 **ESTATÍSTICAS RESETADAS**\n\nTodas as estatísticas de uso foram limpas!\nTodos os modelos foram reativados!`));
    console.log(`[MODELOS-COMMAND] ✅ Estatísticas resetadas`);
  },

  // Mostra ajuda
  async showHelp(message) {
    const help = `🤖 **COMANDOS DE MODELOS DE IA**\n\n` +
      `**Comandos disponíveis:**\n` +
      `• \`n!modelos status\` - Status geral dos modelos\n` +
      `• \`n!modelos list\` - Lista todos os modelos\n` +
      `• \`n!modelos list confirmed\` - Lista modelos confirmados\n` +
      `• \`n!modelos list testing\` - Lista modelos em teste\n` +
      `• \`n!modelos test [nome]\` - Testa um modelo específico\n` +
      `• \`n!modelos rotate\` - Força rotação para próximo modelo\n` +
      `• \`n!modelos reset\` - Reseta todas as estatísticas\n\n` +
      `**Categorias:**\n` +
      `• **Confirmed**: Modelos testados e funcionando ✅\n` +
      `• **Testing**: Novos modelos para teste 🧪\n\n` +
      `**Exemplo:** \`n!modelos test nvidia/nemotron-nano-9b-v2:free\``;
    
    await message.reply(formatReply(help));
    console.log(`[MODELOS-COMMAND] ✅ Ajuda exibida`);
  },

  // Obtém nome de exibição da categoria
  getCategoryDisplayName(category) {
    const names = {
      'confirmed': '✅ Confirmados',
      'testing': '🧪 Em Teste'
    };
    return names[category] || category;
  }
};
