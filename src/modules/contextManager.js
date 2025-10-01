// src/modules/contextManager.js - GERENCIADOR DE CONTEXTO COM MEMÓRIA
import memoryStore from './memoryStore.js';
import summarizer from './summarizer.js';

class ContextManager {
  constructor() {
    this.userContexts = new Map(); // userId -> context
    this.conversationHistory = new Map(); // userId -> [messages]
    this.maxHistorySize = 10; // Máximo de mensagens no histórico
    this.memoryStore = memoryStore;
    this.summarizer = summarizer;
  }

  // Atualiza contexto do usuário
  updateUserContext(userId, newContext) {
    const existingContext = this.userContexts.get(userId) || {};
    
    // Merge contextos
    const updatedContext = {
      ...existingContext,
      ...newContext,
      lastInteraction: Date.now(),
      interactionCount: (existingContext.interactionCount || 0) + 1
    };
    
    this.userContexts.set(userId, updatedContext);
    
    // Adiciona ao histórico
    this.addToHistory(userId, {
      content: newContext.content,
      timestamp: Date.now(),
      role: newContext.role
    });
    
    console.log(`[CONTEXT-MANAGER] 📝 Contexto atualizado para ${newContext.username} (interação #${updatedContext.interactionCount})`);
    
    return updatedContext;
  }

  // Adiciona mensagem ao histórico
  addToHistory(userId, message) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId);
    history.push(message);
    
    // Mantém apenas as últimas mensagens
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
    
    this.conversationHistory.set(userId, history);
  }

  // Obtém contexto do usuário
  getUserContext(userId) {
    return this.userContexts.get(userId) || null;
  }

  // Obtém histórico de conversa
  getConversationHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }

  // Gera contexto para prompt
  generatePromptContext(userId) {
    const userContext = this.getUserContext(userId);
    const history = this.getConversationHistory(userId);
    
    if (!userContext) return '';
    
    let contextString = `Contexto do usuário:\n`;
    contextString += `- Papel: ${userContext.role}\n`;
    contextString += `- Nome: ${userContext.username}\n`;
    contextString += `- Interações: ${userContext.interactionCount}\n`;
    
    if (history.length > 0) {
      contextString += `- Histórico recente:\n`;
      history.slice(-3).forEach((msg, index) => {
        contextString += `  ${index + 1}. ${msg.content}\n`;
      });
    }
    
    return contextString;
  }

  // Limpa contextos antigos
  cleanupOldContexts() {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [userId, context] of this.userContexts) {
      if (now - context.lastInteraction > oneDay) {
        this.userContexts.delete(userId);
        this.conversationHistory.delete(userId);
        console.log(`[CONTEXT-MANAGER] 🧹 Contexto antigo removido: ${context.username}`);
      }
    }
  }

  // Obtém estatísticas
  getStats() {
    const totalUsers = this.userContexts.size;
    const totalHistoryEntries = Array.from(this.conversationHistory.values())
      .reduce((sum, history) => sum + history.length, 0);
    
    return {
      activeUsers: totalUsers,
      totalHistoryEntries: totalHistoryEntries,
      maxHistorySize: this.maxHistorySize
    };
  }

  // Limpa todos os contextos
  clearAllContexts() {
    this.userContexts.clear();
    this.conversationHistory.clear();
    console.log('[CONTEXT-MANAGER] 🧹 Todos os contextos foram limpos');
  }

  // === NOVAS FUNCIONALIDADES DE MEMÓRIA ===

  // Adiciona mensagem à sessão de conversa
  async appendMessage(guildId, channelId, userId, role, content) {
    try {
      const session = await this.memoryStore.getOrCreateSession(guildId, channelId, userId);
      if (!session) return null;

      const messageId = await this.memoryStore.addMessage(session.id, role, content);
      
      // Atualiza última mensagem do bot se for da Alice
      if (role === 'assistant') {
        await this.memoryStore.updateLastBotMessage(session.id, content);
      }

      console.log(`[CONTEXT-MANAGER] Mensagem ${role} adicionada à sessão ${session.id}`);
      return messageId;
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro ao adicionar mensagem:', error.message);
      return null;
    }
  }

  // Obtém histórico recente da sessão
  async getRecentHistory(guildId, channelId, userId, limit = 8) {
    try {
      const session = await this.memoryStore.getOrCreateSession(guildId, channelId, userId);
      if (!session) return [];

      const messages = await this.memoryStore.getRecentMessages(session.id, limit);
      return messages;
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro ao obter histórico:', error.message);
      return [];
    }
  }

  // Obtém resumos da sessão
  async getSummaries(guildId, channelId, userId) {
    try {
      const session = await this.memoryStore.getOrCreateSession(guildId, channelId, userId);
      if (!session) return [];

      const summaries = await this.memoryStore.getSummaries(session.id);
      return summaries;
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro ao obter resumos:', error.message);
      return [];
    }
  }

  // Obtém última mensagem do bot
  async getLastBotMessage(guildId, channelId, userId) {
    try {
      const session = await this.memoryStore.getOrCreateSession(guildId, channelId, userId);
      if (!session) return null;

      return session.last_bot_message;
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro ao obter última mensagem:', error.message);
      return null;
    }
  }

  // Rotaciona mensagens e sumariza se necessário
  async rotateAndSummarizeIfNeeded(guildId, channelId, userId) {
    try {
      const session = await this.memoryStore.getOrCreateSession(guildId, channelId, userId);
      if (!session) return;

      const messages = await this.memoryStore.getRecentMessages(session.id, 10);
      
      // Verifica se precisa sumarizar
      if (this.summarizer.shouldSummarize(messages.length, session.summary)) {
        console.log(`[CONTEXT-MANAGER] Sumarizando sessão ${session.id} (${messages.length} mensagens)`);
        
        // Rotaciona mensagens (mantém apenas as últimas 4)
        await this.memoryStore.rotateMessages(session.id, 4);
        
        // Gera novo resumo
        const messagesToSummarize = messages.slice(-6); // Últimas 6 mensagens
        const newSummary = await this.summarizer.summarize(messagesToSummarize, session.summary);
        
        // Salva resumo
        await this.memoryStore.addSummary(session.id, newSummary);
        
        console.log(`[CONTEXT-MANAGER] Resumo gerado: ${newSummary.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro na rotação/sumarização:', error.message);
    }
  }

  // Limpa sessão específica
  async clearSession(guildId, channelId, userId) {
    try {
      const session = await this.memoryStore.getOrCreateSession(guildId, channelId, userId);
      if (!session) return;

      await this.memoryStore.clearSession(session.id);
      console.log(`[CONTEXT-MANAGER] Sessão ${session.id} limpa`);
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro ao limpar sessão:', error.message);
    }
  }

  // Gera contexto de conversa para prompt
  async generateConversationContext(guildId, channelId, userId) {
    try {
      const session = await this.memoryStore.getOrCreateSession(guildId, channelId, userId);
      if (!session) return '';

      const recentMessages = await this.memoryStore.getRecentMessages(session.id, 4);
      const summaries = await this.memoryStore.getSummaries(session.id);
      const lastBotMessage = session.last_bot_message;

      let contextString = '';

      // Adiciona resumo se existir
      if (summaries.length > 0) {
        const latestSummary = summaries[0].content;
        contextString += `Resumo da conversa anterior: ${latestSummary}\n\n`;
      }

      // Adiciona histórico recente
      if (recentMessages.length > 0) {
        contextString += 'Conversa recente:\n';
        recentMessages.forEach((msg, index) => {
          const speaker = msg.role === 'user' ? 'Usuário' : 'Alice';
          contextString += `${index + 1}. ${speaker}: ${msg.content}\n`;
        });
        contextString += '\n';
      }

      // Adiciona última mensagem do bot se relevante
      if (lastBotMessage && !recentMessages.some(m => m.role === 'assistant')) {
        contextString += `Última resposta da Alice: ${lastBotMessage}\n\n`;
      }

      return contextString;
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro ao gerar contexto:', error.message);
      return '';
    }
  }

  // Obtém estatísticas de memória
  async getMemoryStats() {
    try {
      const storeStats = await this.memoryStore.getStats();
      const summarizerStats = this.summarizer.getStats();
      
      return {
        ...storeStats,
        summarizer: summarizerStats
      };
    } catch (error) {
      console.error('[CONTEXT-MANAGER] Erro ao obter estatísticas:', error.message);
      return { sessions: 0, messages: 0, summaries: 0, cacheSize: 0 };
    }
  }
}

export default new ContextManager();
