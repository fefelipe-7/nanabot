// src/commands/teste-modelos-gradual.js - Teste gradual de modelos para evitar rate limit
import { formatReply } from '../utils/formatReply.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  commandName: 'teste-modelos-gradual',
  description: 'Testa modelos gradualmente para evitar rate limit',
  category: 'sistema',
  aliases: ['teste-gradual', 'teste-lento'],

  async execute(message, client) {
    console.log(`[TESTE-GRADUAL] 🧪 Executando teste gradual para ${message.author.username}`);

    try {
      await message.reply(formatReply('🧪 **INICIANDO TESTE GRADUAL**\n\nTestando modelos um por vez com delays para evitar rate limit...\n\n⏳ Isso pode levar alguns minutos...'));

      const stats = apiRotator.getStats();
      const testingModels = stats.models.filter(m => m.category === 'testing');
      const confirmedModels = stats.models.filter(m => m.category === 'confirmed');

      let results = {
        working: [],
        failed: [],
        rateLimited: []
      };

      // Testa modelos confirmados primeiro (mais provável de funcionar)
      await message.reply(formatReply(`📋 **TESTANDO MODELOS CONFIRMADOS**\n\nTestando ${confirmedModels.length} modelos confirmados...`));

      for (let i = 0; i < confirmedModels.length; i++) {
        const model = confirmedModels[i];
        const result = await this.testSingleModel(model.name, message);
        
        if (result === 'working') {
          results.working.push(model.name);
        } else if (result === 'rate_limit') {
          results.rateLimited.push(model.name);
        } else {
          results.failed.push(model.name);
        }

        // Delay entre testes
        if (i < confirmedModels.length - 1) {
          await message.reply(formatReply(`⏳ Aguardando 5 segundos antes do próximo teste...`));
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Aguarda mais tempo antes de testar modelos novos
      await message.reply(formatReply(`⏳ Aguardando 30 segundos antes de testar modelos novos...`));
      await new Promise(resolve => setTimeout(resolve, 30000));

      // Testa modelos em teste
      await message.reply(formatReply(`📋 **TESTANDO MODELOS NOVOS**\n\nTestando ${testingModels.length} modelos novos...`));

      for (let i = 0; i < testingModels.length; i++) {
        const model = testingModels[i];
        const result = await this.testSingleModel(model.name, message);
        
        if (result === 'working') {
          results.working.push(model.name);
        } else if (result === 'rate_limit') {
          results.rateLimited.push(model.name);
        } else {
          results.failed.push(model.name);
        }

        // Delay maior entre testes de modelos novos
        if (i < testingModels.length - 1) {
          await message.reply(formatReply(`⏳ Aguardando 10 segundos antes do próximo teste...`));
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      // Relatório final
      await this.showFinalReport(message, results);

    } catch (error) {
      console.error(`[TESTE-GRADUAL] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Algo deu errado no teste gradual. Tenta de novo! 😅'));
    }
  },

  // Testa um modelo individual
  async testSingleModel(modelName, message) {
    try {
      await message.reply(formatReply(`🧪 Testando: ${modelName}`));

      const testPrompt = "Responda apenas 'OK' se você conseguir me entender.";
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const responseMessage = data.choices?.[0]?.message?.content;
        
        if (responseMessage) {
          await message.reply(formatReply(`✅ ${modelName} - FUNCIONANDO`));
          return 'working';
        }
      }
      
      if (response.status === 429) {
        await message.reply(formatReply(`🚫 ${modelName} - RATE LIMIT`));
        return 'rate_limit';
      }
      
      await message.reply(formatReply(`❌ ${modelName} - ERRO: ${response.status}`));
      return 'failed';
      
    } catch (error) {
      await message.reply(formatReply(`💥 ${modelName} - EXCEÇÃO: ${error.message}`));
      return 'failed';
    }
  },

  // Mostra relatório final
  async showFinalReport(message, results) {
    let report = `📊 **RELATÓRIO FINAL DO TESTE GRADUAL**\n\n`;
    
    report += `✅ **Modelos Funcionando (${results.working.length}):**\n`;
    if (results.working.length > 0) {
      results.working.forEach(model => {
        report += `• ${model}\n`;
      });
    } else {
      report += `• Nenhum modelo funcionando\n`;
    }
    
    report += `\n🚫 **Rate Limited (${results.rateLimited.length}):**\n`;
    if (results.rateLimited.length > 0) {
      results.rateLimited.forEach(model => {
        report += `• ${model}\n`;
      });
    } else {
      report += `• Nenhum modelo com rate limit\n`;
    }
    
    report += `\n❌ **Modelos com Erro (${results.failed.length}):**\n`;
    if (results.failed.length > 0) {
      results.failed.forEach(model => {
        report += `• ${model}\n`;
      });
    } else {
      report += `• Nenhum modelo com erro\n`;
    }
    
    report += `\n🎯 **Total de Modelos Testados:** ${results.working.length + results.rateLimited.length + results.failed.length}`;
    report += `\n📈 **Taxa de Sucesso:** ${((results.working.length / (results.working.length + results.rateLimited.length + results.failed.length)) * 100).toFixed(1)}%`;
    
    await message.reply(formatReply(report));
    console.log(`[TESTE-GRADUAL] ✅ Relatório final enviado`);
  }
};