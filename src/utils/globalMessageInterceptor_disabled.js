// src/utils/globalMessageInterceptor.js - INTERCEPTADOR GLOBAL DE MENSAGENS
import { EventEmitter } from 'events';

class GlobalMessageInterceptor extends EventEmitter {
  constructor() {
    super();
    this.messageQueue = new Map(); // Fila de mensagens por usuário
    this.processingUsers = new Set(); // Usuários sendo processados
    this.messageHistory = new Map(); // Histórico de mensagens
    this.interceptedMessages = 0;
    this.blockedMessages = 0;
  }

  // Intercepta TODAS as mensagens antes do envio
  async interceptMessage(message, response, userMetadata) {
    const userId = message.author.id;
    const messageKey = `${userId}_${message.content}`;
    const timestamp = Date.now();

    this.interceptedMessages++;
    console.log(`[INTERCEPTOR] 🛡️ Interceptando mensagem #${this.interceptedMessages} de ${message.author.username}: "${message.content}"`);

    // Verifica se é duplicação
    if (this.isDuplicate(userId, message.content, timestamp)) {
      this.blockedMessages++;
      console.log(`[INTERCEPTOR] ❌ DUPLICAÇÃO BLOQUEADA #${this.blockedMessages} - ${message.author.username}: "${message.content}"`);
      return false; // BLOQUEIA duplicação
    }

    // Verifica se usuário já está sendo processado
    if (this.processingUsers.has(userId)) {
      this.blockedMessages++;
      console.log(`[INTERCEPTOR] ❌ USUÁRIO OCUPADO BLOQUEADO #${this.blockedMessages} - ${message.author.username}: "${message.content}"`);
      return false; // BLOQUEIA usuário ocupado
    }

    // Marca usuário como processando
    this.processingUsers.add(userId);

    // Adiciona ao histórico
    this.addToHistory(userId, message.content, timestamp);

    // Armazena na fila
    this.messageQueue.set(messageKey, {
      message,
      response,
      userMetadata,
      timestamp,
      userId
    });

    // Processa após delay para capturar duplicações
    setTimeout(() => {
      this.processMessage(messageKey);
    }, 2000); // 2 segundos de delay

    return true; // Permite processamento
  }

  // Verifica se é duplicação
  isDuplicate(userId, content, timestamp) {
    const userHistory = this.messageHistory.get(userId) || [];
    
    // Verifica mensagens dos últimos 30 segundos
    const recentMessages = userHistory.filter(msg => 
      timestamp - msg.timestamp < 30000
    );

    // Verifica se há mensagens muito similares (mesmo conteúdo base)
    const baseContent = this.normalizeContent(content);
    const similarMessages = recentMessages.filter(msg => {
      const msgBaseContent = this.normalizeContent(msg.content);
      return msgBaseContent === baseContent;
    });

    return similarMessages.length > 0;
  }

  // Normaliza conteúdo para detectar mensagens similares
  normalizeContent(content) {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  // Adiciona ao histórico
  addToHistory(userId, content, timestamp) {
    if (!this.messageHistory.has(userId)) {
      this.messageHistory.set(userId, []);
    }

    const userHistory = this.messageHistory.get(userId);
    userHistory.push({ content, timestamp });

    // Mantém apenas os últimos 5 registros
    if (userHistory.length > 5) {
      userHistory.shift();
    }
  }

  // Processa mensagem da fila
  async processMessage(messageKey) {
    const messageData = this.messageQueue.get(messageKey);
    
    if (!messageData) {
      console.log(`[INTERCEPTOR] ⚠️ Mensagem não encontrada na fila: ${messageKey}`);
      return;
    }

    const { message, response, userId } = messageData;

    try {
      console.log(`[INTERCEPTOR] ✅ PROCESSANDO mensagem única de ${message.author.username}: "${message.content}"`);
      
      // Envia a resposta
      await message.reply(response);
      
      console.log(`[INTERCEPTOR] ✅ ENVIADA com sucesso para ${message.author.username}`);
      
      // Emite evento de sucesso
      this.emit('messageSent', {
        userId,
        username: message.author.username,
        content: message.content,
        response
      });

    } catch (error) {
      console.error(`[INTERCEPTOR] ❌ ERRO ao enviar mensagem:`, error);
      
      // Emite evento de erro
      this.emit('messageError', {
        userId,
        username: message.author.username,
        content: message.content,
        error
      });
    } finally {
      // Limpa dados
      this.messageQueue.delete(messageKey);
      this.processingUsers.delete(userId);
      
      // Limpa histórico antigo
      this.cleanupHistory();
    }
  }

  // Limpa histórico antigo
  cleanupHistory() {
    const now = Date.now();
    
    for (const [userId, history] of this.messageHistory.entries()) {
      const recentHistory = history.filter(msg => now - msg.timestamp < 60000); // 1 minuto
      
      if (recentHistory.length === 0) {
        this.messageHistory.delete(userId);
      } else {
        this.messageHistory.set(userId, recentHistory);
      }
    }
  }

  // Obtém estatísticas
  getStats() {
    return {
      interceptedMessages: this.interceptedMessages,
      blockedMessages: this.blockedMessages,
      pendingMessages: this.messageQueue.size,
      processingUsers: this.processingUsers.size,
      historyEntries: this.messageHistory.size,
      successRate: this.interceptedMessages > 0 ? 
        ((this.interceptedMessages - this.blockedMessages) / this.interceptedMessages * 100).toFixed(1) : 0
    };
  }

  // Limpa todos os dados
  clear() {
    this.messageQueue.clear();
    this.messageHistory.clear();
    this.processingUsers.clear();
    this.interceptedMessages = 0;
    this.blockedMessages = 0;
    console.log('[INTERCEPTOR] 🧹 Todos os dados foram limpos');
  }
}

// Instância global do interceptador
const globalInterceptor = new GlobalMessageInterceptor();

// Event listeners para debug
globalInterceptor.on('messageSent', (data) => {
  console.log(`[INTERCEPTOR] 🎉 Mensagem enviada: ${data.username} -> "${data.content.substring(0, 30)}..."`);
});

globalInterceptor.on('messageError', (data) => {
  console.log(`[INTERCEPTOR] 💥 Erro ao enviar: ${data.username} -> "${data.content.substring(0, 30)}..."`);
});

export default globalInterceptor;
