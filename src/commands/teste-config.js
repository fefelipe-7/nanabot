// src/commands/teste-config.js - Comando para testar configuração
import { formatReply } from '../utils/formatReply.js';

export default {
  commandName: 'teste-config',
  description: 'Testa a configuração do bot (sem Discord)',
  category: 'sistema',
  aliases: ['test-config', 'config-test'],
  
  async execute(message, client) {
    console.log(`[TESTE-CONFIG] 🔧 Testando configuração para ${message.author.username}`);
    
    try {
      // Verifica variáveis de ambiente
      const config = {
        discordToken: process.env.DISCORD_TOKEN ? '✅ Configurado' : '❌ Não configurado',
        openrouterKey: process.env.OPENROUTER_API_KEY ? '✅ Configurado' : '❌ Não configurado',
        discordClientId: process.env.DISCORD_CLIENT_ID ? '✅ Configurado' : '⚠️ Opcional',
        discordAppId: process.env.DISCORD_APPLICATION_ID ? '✅ Configurado' : '⚠️ Opcional',
        discordPublicKey: process.env.DISCORD_PUBLIC_KEY ? '✅ Configurado' : '⚠️ Opcional'
      };
      
      // Verifica formato do token Discord
      let tokenFormat = '❌ Inválido';
      if (process.env.DISCORD_TOKEN) {
        const token = process.env.DISCORD_TOKEN;
        if (token.startsWith('MT') || token.startsWith('MTA')) {
          tokenFormat = '✅ Formato correto';
        } else {
          tokenFormat = '❌ Formato incorreto (deve começar com MT ou MTA)';
        }
      }
      
      // Verifica formato da chave OpenRouter
      let keyFormat = '❌ Inválida';
      if (process.env.OPENROUTER_API_KEY) {
        const key = process.env.OPENROUTER_API_KEY;
        if (key.startsWith('sk-or-v1-')) {
          keyFormat = '✅ Formato correto';
        } else {
          keyFormat = '❌ Formato incorreto (deve começar com sk-or-v1-)';
        }
      }
      
      let report = `🔧 **TESTE DE CONFIGURAÇÃO**\n\n`;
      
      // Status das variáveis
      report += `📋 **Variáveis de Ambiente:**\n`;
      report += `• DISCORD_TOKEN: ${config.discordToken}\n`;
      report += `• OPENROUTER_API_KEY: ${config.openrouterKey}\n`;
      report += `• DISCORD_CLIENT_ID: ${config.discordClientId}\n`;
      report += `• DISCORD_APPLICATION_ID: ${config.discordAppId}\n`;
      report += `• DISCORD_PUBLIC_KEY: ${config.discordPublicKey}\n\n`;
      
      // Formato dos tokens
      report += `🔍 **Formato dos Tokens:**\n`;
      report += `• Token Discord: ${tokenFormat}\n`;
      report += `• Chave OpenRouter: ${keyFormat}\n\n`;
      
      // Diagnóstico
      report += `🩺 **Diagnóstico:**\n`;
      if (config.discordToken.includes('❌')) {
        report += `❌ **PROBLEMA:** Token Discord não configurado\n`;
        report += `💡 **SOLUÇÃO:** Configure DISCORD_TOKEN no arquivo .env\n`;
      } else if (tokenFormat.includes('❌')) {
        report += `❌ **PROBLEMA:** Token Discord com formato incorreto\n`;
        report += `💡 **SOLUÇÃO:** Verifique se o token começa com MT ou MTA\n`;
      } else {
        report += `✅ **Token Discord:** Configurado corretamente\n`;
      }
      
      if (config.openrouterKey.includes('❌')) {
        report += `❌ **PROBLEMA:** Chave OpenRouter não configurada\n`;
        report += `💡 **SOLUÇÃO:** Configure OPENROUTER_API_KEY no arquivo .env\n`;
      } else if (keyFormat.includes('❌')) {
        report += `❌ **PROBLEMA:** Chave OpenRouter com formato incorreto\n`;
        report += `💡 **SOLUÇÃO:** Verifique se a chave começa com sk-or-v1-\n`;
      } else {
        report += `✅ **Chave OpenRouter:** Configurada corretamente\n`;
      }
      
      // Instruções
      report += `\n📖 **Instruções:**\n`;
      report += `1. Crie o arquivo \`.env\` na pasta nanabot/\n`;
      report += `2. Adicione suas chaves no formato correto\n`;
      report += `3. Reinicie o bot com \`npm start\`\n`;
      report += `4. Teste com \`n!ping\` no Discord\n\n`;
      
      report += `🔗 **Links Úteis:**\n`;
      report += `• Discord Developer: https://discord.com/developers/applications\n`;
      report += `• OpenRouter: https://openrouter.ai/\n`;
      
      await message.reply(formatReply(report));
      console.log(`[TESTE-CONFIG] ✅ Relatório de configuração enviado`);
      
    } catch (error) {
      console.error(`[TESTE-CONFIG] 💥 Erro:`, error.message);
      await message.reply(formatReply(`❌ **ERRO NO TESTE**\n\n${error.message}`));
    }
  }
};
