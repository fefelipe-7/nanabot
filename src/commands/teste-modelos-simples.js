// src/commands/teste-modelos-simples.js - Teste simples de modelos sem delays longos
import { formatReply } from '../utils/formatReply.js';
import apiRotator from '../utils/apiRotator.js';

export default {
  commandName: 'teste-modelos-simples',
  description: 'Teste simples de alguns modelos para verificar conectividade',
  category: 'sistema',
  aliases: ['teste-simples', 'teste-rapido'],

  async execute(message, client) {
    console.log(`[TESTE-SIMPLES] 🧪 Executando teste simples para ${message.author.username}`);

    try {
      await message.reply(formatReply('🧪 **TESTE SIMPLES DE MODELOS**\n\nTestando apenas 3 modelos principais para verificar conectividade...'));

      const stats = apiRotator.getStats();
      const confirmedModels = stats.models.filter(m => m.category === 'confirmed').slice(0, 3); // Apenas 3 modelos

      let results = {
        working: [],
        failed: []
      };

      for (let i = 0; i < confirmedModels.length; i++) {
        const model = confirmedModels[i];
        
        try {
          await message.reply(formatReply(`🧪 Testando: ${model.name}`));
          
          const testPrompt = "OK";
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model: model.name,
              messages: [{ role: 'user', content: testPrompt }],
              max_tokens: 5,
              temperature: 0.1,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const responseMessage = data.choices?.[0]?.message?.content;
            
            if (responseMessage) {
              await message.reply(formatReply(`✅ ${model.name} - FUNCIONANDO`));
              results.working.push(model.name);
            } else {
              await message.reply(formatReply(`❌ ${model.name} - SEM RESPOSTA`));
              results.failed.push(model.name);
            }
          } else {
            await message.reply(formatReply(`❌ ${model.name} - ERRO: ${response.status}`));
            results.failed.push(model.name);
          }
          
        } catch (error) {
          await message.reply(formatReply(`💥 ${model.name} - EXCEÇÃO: ${error.message}`));
          results.failed.push(model.name);
        }

        // Delay curto entre testes
        if (i < confirmedModels.length - 1) {
          await message.reply(formatReply(`⏳ Aguardando 2 segundos...`));
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Relatório final simples
      let report = `📊 **RELATÓRIO DO TESTE SIMPLES**\n\n`;
      report += `✅ **Funcionando (${results.working.length}):**\n`;
      results.working.forEach(model => report += `• ${model}\n`);
      
      report += `\n❌ **Com Problemas (${results.failed.length}):**\n`;
      results.failed.forEach(model => report += `• ${model}\n`);
      
      report += `\n🎯 **Taxa de Sucesso:** ${((results.working.length / confirmedModels.length) * 100).toFixed(1)}%`;
      
      await message.reply(formatReply(report));
      console.log(`[TESTE-SIMPLES] ✅ Relatório enviado`);

    } catch (error) {
      console.error(`[TESTE-SIMPLES] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Algo deu errado no teste simples. Tenta de novo! 😅'));
    }
  }
};
