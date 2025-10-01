// src/commands/teste-modelos.js - Comando para testar todos os modelos automaticamente
import { formatReply } from '../utils/formatReply.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  commandName: 'teste-modelos',
  description: 'Testa todos os modelos de IA automaticamente',
  category: 'sistema',
  aliases: ['test-models', 'teste-ia'],
  
  async execute(message, client) {
    console.log(`[TESTE-MODELOS] 🧪 Iniciando teste automático de modelos para ${message.author.username}`);
    
    try {
      const stats = apiRotator.getStats();
      const activeModels = stats.models.filter(m => m.isActive);
      
      if (activeModels.length === 0) {
        await message.reply(formatReply('❌ Nenhum modelo ativo encontrado!'));
        return;
      }
      
      await message.reply(formatReply(`🧪 **INICIANDO TESTE AUTOMÁTICO**\n\nTestando ${activeModels.length} modelos ativos...\nIsso pode levar alguns minutos!`));
      
      const results = [];
      let successCount = 0;
      let totalTime = 0;
      
      // Testa cada modelo ativo
      for (let i = 0; i < activeModels.length; i++) {
        const model = activeModels[i];
        
        try {
          console.log(`[TESTE-MODELOS] 🧪 Testando ${model.name} (${i + 1}/${activeModels.length})`);
          
          const testPrompt = `Você é Alice, uma menina de 4 anos. Responda apenas "Oi! Sou a Alice!" de forma carinhosa e infantil.`;
          
          const startTime = Date.now();
          const response = await apiRotator.makeRequest(testPrompt, { testMode: true });
          const endTime = Date.now();
          
          const responseTime = endTime - startTime;
          totalTime += responseTime;
          
          // Avalia a resposta
          const isGoodResponse = this.evaluateResponse(response);
          if (isGoodResponse) successCount++;
          
          results.push({
            name: model.name,
            category: model.category,
            responseTime: responseTime,
            success: isGoodResponse,
            response: response.substring(0, 100) + (response.length > 100 ? '...' : '')
          });
          
          console.log(`[TESTE-MODELOS] ✅ ${model.name}: ${responseTime}ms - ${isGoodResponse ? 'SUCESSO' : 'FALHA'}`);
          
          // Pequena pausa entre testes
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`[TESTE-MODELOS] ❌ ${model.name}: ERRO - ${error.message}`);
          
          results.push({
            name: model.name,
            category: model.category,
            responseTime: 0,
            success: false,
            response: `ERRO: ${error.message}`
          });
        }
      }
      
      // Gera relatório final
      await this.generateReport(message, results, successCount, totalTime, activeModels.length);
      
    } catch (error) {
      console.error(`[TESTE-MODELOS] 💥 Erro geral:`, error.message);
      await message.reply(formatReply(`❌ **ERRO NO TESTE AUTOMÁTICO**\n\n${error.message}`));
    }
  },

  // Avalia se a resposta é boa
  evaluateResponse(response) {
    if (!response || response.length < 5) return false;
    
    const responseLower = response.toLowerCase();
    
    // Verifica se contém elementos esperados
    const hasAlice = responseLower.includes('alice') || responseLower.includes('alicezinha');
    const hasGreeting = responseLower.includes('oi') || responseLower.includes('olá') || responseLower.includes('hello');
    const hasChildish = responseLower.includes('!') || responseLower.includes('😊') || responseLower.includes('💕');
    
    // Verifica se não é muito longo (deveria ser simples)
    const isAppropriateLength = response.length < 200;
    
    return (hasAlice || hasGreeting) && isAppropriateLength;
  },

  // Gera relatório final
  async generateReport(message, results, successCount, totalTime, totalModels) {
    const successRate = ((successCount / totalModels) * 100).toFixed(1);
    const avgTime = (totalTime / totalModels).toFixed(0);
    
    let report = `🧪 **RELATÓRIO DE TESTE AUTOMÁTICO**\n\n`;
    
    // Estatísticas gerais
    report += `📊 **Estatísticas Gerais:**\n`;
    report += `• Modelos Testados: ${totalModels}\n`;
    report += `• Sucessos: ${successCount}\n`;
    report += `• Taxa de Sucesso: ${successRate}%\n`;
    report += `• Tempo Total: ${(totalTime / 1000).toFixed(1)}s\n`;
    report += `• Tempo Médio: ${avgTime}ms\n\n`;
    
    // Resultados por categoria
    const categoryResults = {};
    results.forEach(result => {
      if (!categoryResults[result.category]) {
        categoryResults[result.category] = { total: 0, success: 0, totalTime: 0 };
      }
      categoryResults[result.category].total++;
      if (result.success) categoryResults[result.category].success++;
      categoryResults[result.category].totalTime += result.responseTime;
    });
    
    report += `📈 **Por Categoria:**\n`;
    Object.entries(categoryResults).forEach(([category, stats]) => {
      const categoryName = this.getCategoryDisplayName(category);
      const categorySuccessRate = ((stats.success / stats.total) * 100).toFixed(1);
      const categoryAvgTime = (stats.totalTime / stats.total).toFixed(0);
      
      report += `• **${categoryName}**: ${stats.success}/${stats.total} (${categorySuccessRate}%) - ${categoryAvgTime}ms médio\n`;
    });
    
    // Top 3 melhores modelos
    const successfulModels = results.filter(r => r.success).sort((a, b) => a.responseTime - b.responseTime);
    
    if (successfulModels.length > 0) {
      report += `\n🏆 **Top 3 Modelos Mais Rápidos:**\n`;
      successfulModels.slice(0, 3).forEach((model, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        report += `${medal} **${model.name}** - ${model.responseTime}ms\n`;
      });
    }
    
    // Modelos com problemas
    const failedModels = results.filter(r => !r.success);
    if (failedModels.length > 0) {
      report += `\n❌ **Modelos com Problemas:**\n`;
      failedModels.forEach(model => {
        report += `• **${model.name}** - ${model.response}\n`;
      });
    }
    
    // Recomendações
    report += `\n💡 **Recomendações:**\n`;
    if (successRate >= 80) {
      report += `✅ Excelente! A maioria dos modelos está funcionando bem.\n`;
    } else if (successRate >= 60) {
      report += `⚠️ Bom, mas alguns modelos precisam de atenção.\n`;
    } else {
      report += `❌ Muitos modelos com problemas. Verifique a configuração.\n`;
    }
    
    if (parseFloat(avgTime) < 3000) {
      report += `⚡ Respostas rápidas! Sistema otimizado.\n`;
    } else {
      report += `🐌 Alguns modelos estão lentos. Considere ajustar limites.\n`;
    }
    
    await message.reply(formatReply(report));
    console.log(`[TESTE-MODELOS] ✅ Relatório de teste automático gerado`);
  },

  // Obtém nome de exibição da categoria
  getCategoryDisplayName(category) {
    const names = {
      'premium': '🌟 Premium',
      'specialized': '🔧 Especializados',
      'backup': '🔄 Backup'
    };
    return names[category] || category;
  }
};
