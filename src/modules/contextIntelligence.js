// src/modules/contextIntelligence.js - Inteligência Contextual para Comandos
import contextManager from './contextManager.js';
import affectionService from './affectionService.js';
import memoryStore from './memoryStore.js';

class ContextIntelligence {
  constructor() {
    this.userProfiles = new Map(); // Cache de perfis de usuário
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  // Analisa contexto completo do usuário
  async analyzeUserContext(guildId, userId, channelId) {
    try {
      const profile = await this.buildUserProfile(guildId, userId, channelId);
      return profile;
    } catch (error) {
      console.error('[CONTEXT-INTELLIGENCE] Erro ao analisar contexto:', error.message);
      return this.getDefaultProfile();
    }
  }

  // Constrói perfil completo do usuário
  async buildUserProfile(guildId, userId, channelId) {
    const cacheKey = `${guildId}_${userId}`;
    const cached = this.userProfiles.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.profile;
    }

    const profile = {
      // Dados básicos
      userId: userId,
      guildId: guildId,
      channelId: channelId,
      
      // Nível de afeto
      affectionLevel: await affectionService.calculateAffectionLevel(guildId, userId),
      affectionLevelName: affectionService.getAffectionLevel(
        await affectionService.calculateAffectionLevel(guildId, userId)
      ),
      
      // Estatísticas de interação
      stats: await affectionService.getUserStats(guildId, userId),
      
      // Histórico de conversa
      conversationHistory: await this.getConversationContext(guildId, channelId, userId),
      
      // Preferências detectadas
      preferences: await this.detectPreferences(guildId, userId),
      
      // Padrões de comportamento
      behaviorPatterns: await this.analyzeBehaviorPatterns(guildId, userId),
      
      // Contexto temporal
      temporalContext: this.getTemporalContext(),
      
      // Contexto do canal
      channelContext: await this.getChannelContext(channelId),
      
      // Relacionamento com Alice
      relationshipStatus: await this.getRelationshipStatus(guildId, userId)
    };

    // Cache do perfil
    this.userProfiles.set(cacheKey, {
      profile: profile,
      timestamp: Date.now()
    });

    return profile;
  }

  // Obtém contexto de conversa
  async getConversationContext(guildId, channelId, userId) {
    try {
      const recentHistory = await contextManager.getRecentHistory(guildId, channelId, userId, 5);
      const summaries = await contextManager.getSummaries(guildId, channelId, userId, 3);
      
      return {
        recentMessages: recentHistory,
        summaries: summaries,
        lastBotMessage: await contextManager.getLastBotMessage(guildId, channelId, userId)
      };
    } catch (error) {
      console.error('[CONTEXT-INTELLIGENCE] Erro ao obter contexto de conversa:', error.message);
      return { recentMessages: [], summaries: [], lastBotMessage: null };
    }
  }

  // Detecta preferências do usuário
  async detectPreferences(guildId, userId) {
    try {
      const conversationContext = await this.getConversationContext(guildId, null, userId);
      const preferences = {
        topics: [],
        activities: [],
        personality: 'unknown',
        communicationStyle: 'casual'
      };

      // Analisa mensagens recentes para detectar interesses
      const recentMessages = conversationContext.recentMessages || [];
      
      for (const msg of recentMessages) {
        if (msg.role === 'user') {
          const content = msg.content.toLowerCase();
          
          // Detecta tópicos de interesse
          if (content.includes('jogo') || content.includes('game')) {
            preferences.topics.push('games');
          }
          if (content.includes('filme') || content.includes('cinema')) {
            preferences.topics.push('movies');
          }
          if (content.includes('música') || content.includes('cantar')) {
            preferences.topics.push('music');
          }
          if (content.includes('comida') || content.includes('comer')) {
            preferences.topics.push('food');
          }
          
          // Detecta estilo de comunicação
          if (content.includes('!') || content.includes('?')) {
            preferences.communicationStyle = 'enthusiastic';
          }
          if (content.length > 100) {
            preferences.communicationStyle = 'detailed';
          }
        }
      }

      return preferences;
    } catch (error) {
      console.error('[CONTEXT-INTELLIGENCE] Erro ao detectar preferências:', error.message);
      return { topics: [], activities: [], personality: 'unknown', communicationStyle: 'casual' };
    }
  }

  // Analisa padrões de comportamento
  async analyzeBehaviorPatterns(guildId, userId) {
    try {
      const stats = await affectionService.getUserStats(guildId, userId);
      
      const patterns = {
        activityLevel: 'moderate',
        commandFrequency: 'normal',
        preferredTimeOfDay: 'unknown',
        interactionStyle: 'balanced'
      };

      // Analisa frequência de comandos
      if (stats.totalInteractions > 100) {
        patterns.activityLevel = 'high';
        patterns.commandFrequency = 'frequent';
      } else if (stats.totalInteractions < 10) {
        patterns.activityLevel = 'low';
        patterns.commandFrequency = 'rare';
      }

      // Analisa estilo de interação
      const hugRatio = stats.hugs_given / Math.max(stats.totalInteractions, 1);
      if (hugRatio > 0.3) {
        patterns.interactionStyle = 'affectionate';
      } else if (hugRatio < 0.1) {
        patterns.interactionStyle = 'reserved';
      }

      return patterns;
    } catch (error) {
      console.error('[CONTEXT-INTELLIGENCE] Erro ao analisar padrões:', error.message);
      return {
        activityLevel: 'moderate',
        commandFrequency: 'normal',
        preferredTimeOfDay: 'unknown',
        interactionStyle: 'balanced'
      };
    }
  }

  // Obtém contexto temporal
  getTemporalContext() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    return {
      timeOfDay: this.getTimeOfDay(hour),
      dayOfWeek: this.getDayOfWeek(dayOfWeek),
      season: this.getSeason(now.getMonth()),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      hour: hour
    };
  }

  // Obtém contexto do canal
  async getChannelContext(channelId) {
    // Implementar lógica específica do canal se necessário
    return {
      type: 'text',
      activity: 'normal',
      participants: 'unknown'
    };
  }

  // Obtém status do relacionamento
  async getRelationshipStatus(guildId, userId) {
    try {
      const affectionLevel = await affectionService.calculateAffectionLevel(guildId, userId);
      const stats = await affectionService.getUserStats(guildId, userId);
      
      if (affectionLevel > 0.8) {
        return 'best_friend';
      } else if (affectionLevel > 0.6) {
        return 'close_friend';
      } else if (affectionLevel > 0.4) {
        return 'friend';
      } else if (affectionLevel > 0.2) {
        return 'acquaintance';
      } else {
        return 'stranger';
      }
    } catch (error) {
      console.error('[CONTEXT-INTELLIGENCE] Erro ao obter status do relacionamento:', error.message);
      return 'stranger';
    }
  }

  // Utilitários para contexto temporal
  getTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  getDayOfWeek(day) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[day];
  }

  getSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  // Perfil padrão
  getDefaultProfile() {
    return {
      userId: 'unknown',
      guildId: 'unknown',
      channelId: 'unknown',
      affectionLevel: 0.5,
      affectionLevelName: 'medio',
      stats: { hugs_given: 0, love_score: 0, totalInteractions: 0 },
      conversationHistory: { recentMessages: [], summaries: [], lastBotMessage: null },
      preferences: { topics: [], activities: [], personality: 'unknown', communicationStyle: 'casual' },
      behaviorPatterns: { activityLevel: 'moderate', commandFrequency: 'normal', interactionStyle: 'balanced' },
      temporalContext: { timeOfDay: 'afternoon', dayOfWeek: 'monday', season: 'spring', isWeekend: false },
      channelContext: { type: 'text', activity: 'normal' },
      relationshipStatus: 'stranger'
    };
  }

  // Limpa cache expirado
  cleanupCache() {
    const now = Date.now();
    for (const [key, data] of this.userProfiles.entries()) {
      if ((now - data.timestamp) > this.cacheExpiry) {
        this.userProfiles.delete(key);
      }
    }
  }

  // Obtém estatísticas
  getStats() {
    return {
      cachedProfiles: this.userProfiles.size,
      cacheExpiry: this.cacheExpiry
    };
  }
}

export default new ContextIntelligence();
