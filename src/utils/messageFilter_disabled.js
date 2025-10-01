// src/utils/messageFilter.js - SISTEMA ANTI-DUPLICAÇÃO
import { EventEmitter } from 'events';

class MessageFilter extends EventEmitter {
  constructor() {
    super();
    this.pendingMessages = new Map(); // Armazena mensagens pendentes por usuário
    this.messageHistory = new Map(); // Histórico de mensagens recentes
    this.processingUsers = new Set(); // Usuários sendo processados
    this.timeout = 5000; // 5 segundos para considerar duplicação
  }

  // Intercepta e filtra mensagens
  async filterMessage(message, response, userMetadata) {
    const userId = message.author.id;
    const messageKey = `${userId}_${message.content}`;
    const timestamp = Date.now();

    console.log(`[FILTER] Interceptando mensagem de ${message.author.username}: "${message.content}"`);

    // Verifica se é uma duplicação recente
    if (this.isDuplicateMessage(userId, message.content, timestamp)) {
      console.log(`[FILTER] DUPLICAÇÃO DETECTADA - Bloqueando mensagem de ${message.author.username}`);
      return false; // Bloqueia a mensagem duplicada
    }

    // Verifica se o usuário já está sendo processado
    if (this.processingUsers.has(userId)) {
      console.log(`[FILTER] USUÁRIO JÁ SENDO PROCESSADO - Bloqueando mensagem de ${message.author.username}`);
      return false; // Bloqueia mensagem de usuário já processado
    }

    // Marca usuário como sendo processado
    this.processingUsers.add(userId);

    // Armazena a mensagem pendente
    this.pendingMessages.set(messageKey, {
      message,
      response,
      userMetadata,
      timestamp,
      userId
    });

    // Adiciona ao histórico
    this.addToHistory(userId, message.content, timestamp);

    // Processa após um pequeno delay para capturar duplicações
    setTimeout(() => {
      this.processPendingMessage(messageKey);
    }, 1000); // 1 segundo de delay

    return true; // Permite o processamento
  }

  // Verifica se é uma mensagem duplicada
  isDuplicateMessage(userId, content, timestamp) {
    const userHistory = this.messageHistory.get(userId) || [];
    
    // Verifica mensagens dos últimos 10 segundos
    const recentMessages = userHistory.filter(msg => 
      timestamp - msg.timestamp < 10000 && 
      msg.content === content
    );

    return recentMessages.length > 0;
  }

  // Adiciona mensagem ao histórico
  addToHistory(userId, content, timestamp) {
    if (!this.messageHistory.has(userId)) {
      this.messageHistory.set(userId, []);
    }

    const userHistory = this.messageHistory.get(userId);
    userHistory.push({ content, timestamp });

    // Mantém apenas os últimos 10 registros
    if (userHistory.length > 10) {
      userHistory.shift();
    }
  }

  // Processa mensagem pendente
  async processPendingMessage(messageKey) {
    const pendingData = this.pendingMessages.get(messageKey);
    
    if (!pendingData) {
      console.log(`[FILTER] Mensagem pendente não encontrada: ${messageKey}`);
      return;
    }

    const { message, response, userMetadata, userId } = pendingData;

    try {
      console.log(`[FILTER] Processando mensagem única de ${message.author.username}`);
      
      // Envia a resposta
      await message.reply(response);
      
      console.log(`[FILTER] Mensagem enviada com sucesso para ${message.author.username}`);
      
      // Emite evento de sucesso
      this.emit('messageSent', {
        userId,
        username: message.author.username,
        content: message.content,
        response
      });

    } catch (error) {
      console.error(`[FILTER] Erro ao enviar mensagem:`, error);
      
      // Emite evento de erro
      this.emit('messageError', {
        userId,
        username: message.author.username,
        content: message.content,
        error
      });
    } finally {
      // Limpa dados pendentes
      this.pendingMessages.delete(messageKey);
      this.processingUsers.delete(userId);
      
      // Limpa histórico antigo
      this.cleanupHistory();
    }
  }

  // Limpa histórico antigo
  cleanupHistory() {
    const now = Date.now();
    
    for (const [userId, history] of this.messageHistory.entries()) {
      const recentHistory = history.filter(msg => now - msg.timestamp < 30000); // 30 segundos
      
      if (recentHistory.length === 0) {
        this.messageHistory.delete(userId);
      } else {
        this.messageHistory.set(userId, recentHistory);
      }
    }
  }

  // Obtém estatísticas do filtro
  getStats() {
    return {
      pendingMessages: this.pendingMessages.size,
      processingUsers: this.processingUsers.size,
      historyEntries: this.messageHistory.size,
      totalUsers: this.messageHistory.size
    };
  }

  // Limpa todos os dados
  clear() {
    this.pendingMessages.clear();
    this.messageHistory.clear();
    this.processingUsers.clear();
    console.log('[FILTER] Todos os dados foram limpos');
  }
}

// Instância global do filtro
const messageFilter = new MessageFilter();

// Event listeners para debug
messageFilter.on('messageSent', (data) => {
  console.log(`[FILTER] ✅ Mensagem enviada: ${data.username} -> "${data.content.substring(0, 30)}..."`);
});

messageFilter.on('messageError', (data) => {
  console.log(`[FILTER] ❌ Erro ao enviar: ${data.username} -> "${data.content.substring(0, 30)}..."`);
});

export default messageFilter;
