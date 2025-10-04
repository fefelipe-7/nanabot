// src/events/messageCreate.js - ÚNICO PONTO DE PROCESSAMENTO E ENVIO
import { Events } from 'discord.js';
import dataCollector from '../core/dataCollector.js';
import apiRotator from '../utils/apiRotator.js';
import fallbackSystem from '../modules/fallbackSystem.js';
import { formatReply } from '../utils/formatReply.js';
import postProcessor from '../modules/postProcessor.js';
import contextManager from '../modules/contextManager.js';
import commandRouter from '../utils/commandRouter.js';

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    try {
      // 0. VERIFICA se é mensagem de bot - IGNORA (primeira verificação)
      if (message.author.bot) {
        console.log(`[MESSAGE-CREATE] 🤖 MENSAGEM DE BOT IGNORADA: ${message.content.substring(0, 30)}...`);
        return;
      }
      
      console.log(`[MESSAGE-CREATE] 📨 Recebida mensagem de: ${message.author.username}`);
      
      // 1. VERIFICA se é comando n! primeiro
      if (message.content.startsWith('n!')) {
        console.log(`[MESSAGE-CREATE] 🎯 COMANDO DETECTADO: ${message.content}`);
        
        const parsed = commandRouter.parseCommand(message.content);
        console.log(`[MESSAGE-CREATE] 📝 Comando parseado: "${parsed.commandName}" com args: [${parsed.args.join(', ')}]`);
        
        // Executa comando via commandRouter (SEM IA)
        const commandExecuted = await commandRouter.executeCommand(
          parsed.commandName, 
          message, 
          client
        );
        
        if (commandExecuted) {
          console.log(`[MESSAGE-CREATE] ✅ COMANDO EXECUTADO COM SUCESSO: n!${parsed.commandName}`);
        } else {
          console.log(`[MESSAGE-CREATE] ❌ FALHA AO EXECUTAR COMANDO: n!${parsed.commandName}`);
        }
        return; // Comando executado, não processa IA
      }
      
      // 2. VERIFICA se é menção para IA
      if (message.mentions.has(client.user)) {
        console.log(`[MESSAGE-CREATE] 🤖 MENSAGEM DE IA DETECTADA: ${message.content}`);
        
        // COLETA dados apenas para IA
        const collectedData = await dataCollector.collectData(message, client);
        
        if (!collectedData || !collectedData.shouldProcess) {
          console.log(`[MESSAGE-CREATE] ⚠️ Dados não coletados para IA`);
          return;
        }
        
        console.log(`[MESSAGE-CREATE] 🔍 Processando com IA para: ${message.author.username}`);
        
        const prompt = await dataCollector.buildPrompt(
          collectedData.basicData.content, 
          collectedData.userContext,
          collectedData.guildId,
          collectedData.channelId,
          message.author.id
        );
        
        const aiResponse = await apiRotator.makeRequest(prompt, collectedData.userContext);
        
        console.log(`[MESSAGE-CREATE] 📤 Processando resposta IA para: ${message.author.username}`);
        
        // PÓS-PROCESSAMENTO e ENVIA resposta (único envio)
        const processedResponse = await postProcessor.processResponse(
          aiResponse, 
          message.author.id, 
          collectedData.userContext
        );
        await message.reply(processedResponse);
        
        console.log(`[MESSAGE-CREATE] ✅ RESPOSTA IA ENVIADA COM SUCESSO`);
        return;
      }
      
      // 3. MENSAGEM COMUM - não processa
      console.log(`[MESSAGE-CREATE] 📭 MENSAGEM COMUM IGNORADA: ${message.content.substring(0, 50)}...`);
      
    } catch (error) {
      console.error(`[MESSAGE-CREATE] 💥 Erro crítico:`, error);
      
      // Fallback de emergência APENAS se nenhuma mensagem foi enviada
      try {
        const fallbackResponse = fallbackSystem.generateFallbackResponse(
          message.content, 
          { username: message.author.username, userId: message.author.id }
        );
        const processedFallback = await postProcessor.processFallbackResponse(
          fallbackResponse,
          message.author.id,
          { username: message.author.username, userId: message.author.id }
        );
        await message.reply(processedFallback);
        console.log(`[MESSAGE-CREATE] 🆘 Fallback enviado`);
      } catch (replyError) {
        console.error(`[MESSAGE-CREATE] 💥 Erro ao enviar fallback:`, replyError);
      }
    }
  },
};

