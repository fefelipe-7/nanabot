// src/modules/messageProcessor.js - PROCESSADOR DE MENSAGENS
import { getUserRole } from '../utils/helpers.js';

class MessageProcessor {
  constructor() {
    this.processedMessages = new Map(); // userId -> { lastMessage, timestamp }
    this.cooldownTime = 2000; // 2 segundos entre mensagens
  }

  // Verifica se a mensagem deve ser processada
  shouldProcessMessage(message, client) {
    // Ignora bots
    if (message.author.bot) return false;

    let content = '';
    let shouldProcess = false;

    // Verifica prefixo n!
    if (message.content.startsWith('n!')) {
      content = message.content.slice(2).trim();
      shouldProcess = true;
    }
    // Verifica menção
    else if (message.mentions.has(client.user)) {
      content = message.content.replace(/<@!?(\d+)>/, '').trim();
      shouldProcess = true;
    }

    if (!shouldProcess || !content) return false;

    // Verifica cooldown
    const userId = message.author.id;
    const now = Date.now();
    const lastProcessed = this.processedMessages.get(userId);

    if (lastProcessed && (now - lastProcessed.timestamp < this.cooldownTime)) {
      console.log(`[MESSAGE-PROCESSOR] ⏳ Cooldown ativo para ${message.author.username}`);
      return false;
    }

    // Atualiza timestamp
    this.processedMessages.set(userId, {
      lastMessage: content,
      timestamp: now
    });

    return { content, shouldProcess: true };
  }

  // Extrai contexto do usuário
  extractUserContext(message) {
    const role = getUserRole(message.author.id);
    
    return {
      role,
      username: message.author.username,
      userId: message.author.id,
      content: message.content,
      timestamp: Date.now()
    };
  }

  // Limpa histórico antigo
  cleanupOldEntries() {
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
    return {
      activeUsers: this.processedMessages.size,
      cooldownTime: this.cooldownTime
    };
  }
}

export default new MessageProcessor();
