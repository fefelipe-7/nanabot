// src/modules/affectionService.js - Serviço de Afeto
import memoryStore from './memoryStore.js';

class AffectionService {
  constructor() {
    this.cache = new Map(); // Cache de scores por usuário
    this.cacheTTL = 5 * 60 * 1000; // 5 minutos
  }

  // Calcula nível de afeto do usuário (0-1)
  async calculateAffectionLevel(guildId, userId) {
    try {
      const cacheKey = `${guildId}:${userId}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
        return cached.score;
      }

      // Busca estatísticas do usuário
      const stats = await this.getUserStats(guildId, userId);
      
      // Calcula score baseado em múltiplos fatores
      let score = 0;
      
      // Fator 1: Abraços dados (peso 0.3)
      const hugsScore = Math.min(stats.hugs_given / 10, 1) * 0.3;
      score += hugsScore;
      
      // Fator 2: Score de amor (peso 0.4)
      const loveScore = Math.min(stats.love_score / 20, 1) * 0.4;
      score += loveScore;
      
      // Fator 3: Recência da interação (peso 0.3)
      const recencyScore = this.calculateRecencyScore(stats.last_interaction) * 0.3;
      score += recencyScore;
      
      // Normaliza para 0-1
      score = Math.min(Math.max(score, 0), 1);
      
      // Cache o resultado
      this.cache.set(cacheKey, {
        score: score,
        timestamp: Date.now()
      });
      
      console.log(`[AFFECTION-SERVICE] Score calculado para ${userId}: ${score.toFixed(2)}`);
      return score;
      
    } catch (error) {
      console.error('[AFFECTION-SERVICE] Erro ao calcular afeto:', error.message);
      return 0.5; // Score neutro em caso de erro
    }
  }

  // Obtém estatísticas do usuário
  async getUserStats(guildId, userId) {
    try {
      const stats = await memoryStore.runQuery(
        'SELECT * FROM affection_stats WHERE guild_id = ? AND user_id = ?',
        [guildId, userId]
      );
      
      if (stats.length > 0) {
        return stats[0];
      }
      
      // Cria entrada inicial se não existir
      await memoryStore.runQuery(
        'INSERT INTO affection_stats (user_id, guild_id, hugs_given, love_score, last_interaction) VALUES (?, ?, 0, 0, ?)',
        [userId, guildId, new Date().toISOString()]
      );
      
      return {
        user_id: userId,
        guild_id: guildId,
        hugs_given: 0,
        love_score: 0,
        last_interaction: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('[AFFECTION-SERVICE] Erro ao obter stats:', error.message);
      return {
        user_id: userId,
        guild_id: guildId,
        hugs_given: 0,
        love_score: 0,
        last_interaction: new Date().toISOString()
      };
    }
  }

  // Calcula score de recência (0-1)
  calculateRecencyScore(lastInteraction) {
    if (!lastInteraction) return 0;
    
    const now = new Date();
    const last = new Date(lastInteraction);
    const diffHours = (now - last) / (1000 * 60 * 60);
    
    // Score decai com o tempo
    if (diffHours < 1) return 1.0;
    if (diffHours < 24) return 0.8;
    if (diffHours < 72) return 0.5;
    if (diffHours < 168) return 0.2; // 1 semana
    return 0.1;
  }

  // Incrementa contador de abraços
  async incrementHugs(guildId, userId) {
    try {
      await memoryStore.runQuery(
        'INSERT OR REPLACE INTO affection_stats (user_id, guild_id, hugs_given, love_score, last_interaction) VALUES (?, ?, COALESCE((SELECT hugs_given FROM affection_stats WHERE guild_id = ? AND user_id = ?), 0) + 1, COALESCE((SELECT love_score FROM affection_stats WHERE guild_id = ? AND user_id = ?), 0) + 1, ?)',
        [userId, guildId, guildId, userId, guildId, userId, new Date().toISOString()]
      );
      
      // Limpa cache
      this.cache.delete(`${guildId}:${userId}`);
      
      console.log(`[AFFECTION-SERVICE] Abraço registrado para ${userId}`);
      
    } catch (error) {
      console.error('[AFFECTION-SERVICE] Erro ao incrementar abraços:', error.message);
    }
  }

  // Incrementa score de amor
  async incrementLoveScore(guildId, userId, amount = 1) {
    try {
      await memoryStore.runQuery(
        'INSERT OR REPLACE INTO affection_stats (user_id, guild_id, hugs_given, love_score, last_interaction) VALUES (?, ?, COALESCE((SELECT hugs_given FROM affection_stats WHERE guild_id = ? AND user_id = ?), 0), COALESCE((SELECT love_score FROM affection_stats WHERE guild_id = ? AND user_id = ?), 0) + ?, ?)',
        [userId, guildId, guildId, userId, guildId, userId, amount, new Date().toISOString()]
      );
      
      // Limpa cache
      this.cache.delete(`${guildId}:${userId}`);
      
      console.log(`[AFFECTION-SERVICE] Love score incrementado para ${userId}: +${amount}`);
      
    } catch (error) {
      console.error('[AFFECTION-SERVICE] Erro ao incrementar love score:', error.message);
    }
  }

  // Atualiza última interação
  async updateLastInteraction(guildId, userId) {
    try {
      await memoryStore.runQuery(
        'INSERT OR REPLACE INTO affection_stats (user_id, guild_id, hugs_given, love_score, last_interaction) VALUES (?, ?, COALESCE((SELECT hugs_given FROM affection_stats WHERE guild_id = ? AND user_id = ?), 0), COALESCE((SELECT love_score FROM affection_stats WHERE guild_id = ? AND user_id = ?), 0), ?)',
        [userId, guildId, guildId, userId, guildId, userId, new Date().toISOString()]
      );
      
      // Limpa cache
      this.cache.delete(`${guildId}:${userId}`);
      
    } catch (error) {
      console.error('[AFFECTION-SERVICE] Erro ao atualizar interação:', error.message);
    }
  }

  // Determina faixa de afeto (baixo/médio/alto)
  getAffectionLevel(score) {
    if (score < 0.3) return 'baixo';
    if (score < 0.7) return 'medio';
    return 'alto';
  }

  // Verifica se usuário está sendo repetitivo
  async checkRepetition(guildId, userId, commandName) {
    try {
      // Busca comandos recentes do usuário
      const recentCommands = await memoryStore.runQuery(
        'SELECT content FROM conversation_messages WHERE role = ? AND created_at > datetime("now", "-1 hour") ORDER BY created_at DESC LIMIT 10',
        ['user']
      );
      
      // Conta repetições do mesmo comando
      const repetitions = recentCommands.filter(msg => 
        msg.content.includes(`n!${commandName}`)
      ).length;
      
      return repetitions;
      
    } catch (error) {
      console.error('[AFFECTION-SERVICE] Erro ao verificar repetição:', error.message);
      return 0;
    }
  }

  // Limpa cache expirado
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }
}

export default new AffectionService();
