// src/core/dataCollector.js - COLETOR DE DADOS INTERMEDIÁRIO
import { getUserRole } from '../utils/helpers.js';
import { formatReply } from '../utils/formatReply.js';
import apiRotator from '../utils/apiRotator.js';
import contextManager from '../modules/contextManager.js';
import fallbackSystem from '../modules/fallbackSystem.js';
import styleEngine from '../modules/styleEngine.js';
import moodEngine from '../modules/moodEngine.js';
import variationEngine from '../modules/variationEngine.js';
import commandRouter from '../utils/commandRouter.js';

class DataCollector {
  constructor() {
    this.processedMessages = new Map(); // userId -> { lastMessage, timestamp }
    this.cooldownTime = 2000; // 2 segundos entre mensagens
    this.requestCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
  }

  // Método principal: APENAS coleta dados (não processa nem envia)
  async collectData(message, client) {
    this.requestCount++;
    
    try {
      console.log(`[DATA-COLLECTOR] 🔍 Coletando dados (req #${this.requestCount})`);
      
      // 1. Verifica se deve processar
      const shouldProcess = this.shouldProcessMessage(message, client);
      if (!shouldProcess) return null;

      // 2. Extrai dados básicos
      const basicData = this.extractBasicData(message, client);
      
      // 3. Coleta contexto do usuário
      const userContext = this.collectUserContext(basicData);
      
      // 4. Atualiza contexto no gerenciador
      const updatedContext = contextManager.updateUserContext(message.author.id, userContext);
      
      // 5. Adiciona mensagem do usuário à memória (sem bloquear se falhar)
      const guildId = message.guild?.id || null;
      const channelId = message.channel.id;
      try {
        await contextManager.appendMessage(guildId, channelId, message.author.id, 'user', basicData.content);
      } catch (memoryError) {
        console.error(`[DATA-COLLECTOR] ⚠️ Erro ao adicionar mensagem à memória:`, memoryError.message);
      }
      
      this.successCount++;
      console.log(`[DATA-COLLECTOR] ✅ Dados coletados (${this.successCount}/${this.requestCount})`);
      
      // RETORNA APENAS OS DADOS - SEM PROCESSAR IA
      return {
        shouldProcess: true,
        basicData,
        userContext: updatedContext,
        message: message,
        client: client,
        guildId: guildId,
        channelId: channelId
      };
      
    } catch (error) {
      this.errorCount++;
      console.error(`[DATA-COLLECTOR] ❌ Erro (${this.errorCount}/${this.requestCount}):`, error.message);
      
      return {
        shouldProcess: false,
        error: error.message
      };
    }
  }

  // Verifica se deve processar a mensagem
  shouldProcessMessage(message, client) {
    // Ignora bots
    if (message.author.bot) return false;

    let content = '';
    let shouldProcess = false;
    let isCommand = false;

    // Verifica prefixo n! (COMANDOS)
    if (message.content.startsWith('n!')) {
      content = message.content.slice(2).trim();
      shouldProcess = true;
      isCommand = true;
    }
    // Verifica menção (APENAS IA - SEM COMANDOS)
    else if (message.mentions.has(client.user)) {
      content = message.content.replace(/<@!?(\d+)>/, '').trim();
      shouldProcess = true;
      isCommand = false; // Menção = apenas IA
    }

    if (!shouldProcess || !content) return false;

    // Se é comando, processa via commandRouter
    if (isCommand) {
      const parsed = commandRouter.parseCommand(message.content);
      return {
        shouldProcess: true,
        isCommand: true,
        commandName: parsed.commandName,
        args: parsed.args,
        content: parsed.fullContent
      };
    }

    // Se é menção, processa via IA
    return {
      shouldProcess: true,
      isCommand: false,
      content: content
    };
  }

  // Extrai dados básicos da mensagem
  extractBasicData(message, client) {
    let content = '';
    
    if (message.content.startsWith('n!')) {
      content = message.content.slice(2).trim();
    } else if (message.mentions.has(client.user)) {
      content = message.content.replace(/<@!?(\d+)>/, '').trim();
    }

    return {
      content,
      username: message.author.username,
      userId: message.author.id,
      timestamp: Date.now(),
      message: message
    };
  }

  // Coleta contexto do usuário
  collectUserContext(basicData) {
    const role = getUserRole(basicData.userId);
    
    return {
      role,
      username: basicData.username,
      userId: basicData.userId,
      content: basicData.content,
      timestamp: basicData.timestamp
    };
  }

  // Constrói prompt contextual (apenas para uso externo)
  async buildPrompt(content, userContext, guildId, channelId, userId) {
    const { role, username } = userContext;
    
    // Define como chamar o usuário baseado no papel
    let userCall = '';
    switch(role) {
      case 'mamãe':
        userCall = 'mamãe';
        break;
      case 'papai':
        userCall = 'papai';
        break;
      case 'outro de papai':
        userCall = 'papai';
        break;
      default:
        userCall = username;
    }

    // Detecta tipo de mensagem e humor
    const messageType = styleEngine.detectMessageType(content);
    const mood = moodEngine.detectMood(content, role);

    // Gera diretivas de estilo
    const styleDirectives = styleEngine.generateStyleDirectives(role, messageType);
    
    // Gera diretivas de humor
    const moodDirectives = moodEngine.generateMoodDirectives(mood);

    // Gera variações
    const variationDirectives = variationEngine.generateMicroTemplate('greetings', userCall);

    // Obtém contexto de conversa da memória
    const conversationContext = await contextManager.generateConversationContext(guildId, channelId, userId);

    let prompt = `Você é Alice, uma menina de 4 anos muito carinhosa e inteligente. Quando quiser ser fofa, pode se chamar Alicezinha.

IMPORTANTE: Você é uma criança humana real, não um bot ou IA. Nunca mencione que é um bot, IA, ou programa. Você é uma menina de verdade!

Contexto do usuário:
- Papel: ${role}
- Nome: ${username}
- Como chamar: ${userCall}
- Tipo de mensagem: ${messageType}
- Humor atual: ${mood}

Diretivas de estilo: ${styleDirectives}

Diretivas de humor: ${moodDirectives}`;

    // Adiciona contexto de conversa se existir
    if (conversationContext) {
      prompt += `\n\nContexto de Conversa:\n${conversationContext}`;
    }

    prompt += `\n\nMensagem do usuário: "${content}"

Responda como Alice, uma criança de 4 anos carinhosa, usando linguagem simples e emotiva. Seja fofa e expressiva! Use "Alice" ou "Alicezinha" quando quiser ser fofa. Chame o usuário por "${userCall}". Nunca saia do personagem de criança humana!

Use variações nas suas respostas para manter a conversa interessante e dinâmica!`;

    return prompt;
  }

  // Limpa dados antigos
  cleanupOldData() {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [userId, data] of this.processedMessages) {
      if (now - data.timestamp > oneHour) {
        this.processedMessages.delete(userId);
      }
    }
  }

  // Obtém estatísticas
  getStats() {
    const successRate = this.requestCount > 0 ? 
      (this.successCount / this.requestCount * 100).toFixed(1) : 0;

    return {
      totalRequests: this.requestCount,
      successfulRequests: this.successCount,
      failedRequests: this.errorCount,
      successRate: `${successRate}%`,
      activeUsers: this.processedMessages.size,
      cooldownTime: this.cooldownTime
    };
  }

  // Reseta estatísticas
  resetStats() {
    this.requestCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.processedMessages.clear();
    console.log('[DATA-COLLECTOR] 🧹 Estatísticas resetadas');
  }
}

export default new DataCollector();

