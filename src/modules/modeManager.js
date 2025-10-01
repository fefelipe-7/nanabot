// src/modules/modeManager.js - Gerenciador de Modos e Slot-Filling
import memoryStore from './memoryStore.js';

class ModeManager {
  constructor() {
    this.activeModes = new Map(); // Cache de modos ativos
    this.cleanupInterval = 60 * 1000; // Limpeza a cada minuto
    this.startCleanupTimer();
  }

  // Inicia modo para usuário/canal
  async startMode(guildId, channelId, userId, modeType, stateData = {}, ttlSeconds = 300) {
    try {
      const expiresAt = new Date(Date.now() + (ttlSeconds * 1000));
      const stateJson = JSON.stringify(stateData);
      
      await memoryStore.runQuery(
        'INSERT OR REPLACE INTO stories_state (user_id, guild_id, channel_id, mode, state_json, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, guildId, channelId, modeType, stateJson, expiresAt.toISOString()]
      );
      
      // Adiciona ao cache
      const cacheKey = `${guildId}:${channelId}:${userId}`;
      this.activeModes.set(cacheKey, {
        mode: modeType,
        state: stateData,
        expiresAt: expiresAt.getTime()
      });
      
      console.log(`[MODE-MANAGER] Modo iniciado: ${modeType} para ${userId} (TTL: ${ttlSeconds}s)`);
      return true;
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao iniciar modo:', error.message);
      return false;
    }
  }

  // Verifica se usuário está em modo ativo
  async isInMode(guildId, channelId, userId, modeType = null) {
    try {
      const cacheKey = `${guildId}:${channelId}:${userId}`;
      const cached = this.activeModes.get(cacheKey);
      
      if (cached && cached.expiresAt > Date.now()) {
        if (!modeType || cached.mode === modeType) {
          return {
            active: true,
            mode: cached.mode,
            state: cached.state
          };
        }
      }
      
      // Busca no banco se não estiver no cache
      const result = await memoryStore.runQuery(
        'SELECT * FROM stories_state WHERE guild_id = ? AND channel_id = ? AND user_id = ? AND expires_at > datetime("now")',
        [guildId, channelId, userId]
      );
      
      if (result.length > 0) {
        const modeData = result[0];
        const state = JSON.parse(modeData.state_json || '{}');
        
        // Atualiza cache
        this.activeModes.set(cacheKey, {
          mode: modeData.mode,
          state: state,
          expiresAt: new Date(modeData.expires_at).getTime()
        });
        
        if (!modeType || modeData.mode === modeType) {
          return {
            active: true,
            mode: modeData.mode,
            state: state
          };
        }
      }
      
      return { active: false };
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao verificar modo:', error.message);
      return { active: false };
    }
  }

  // Atualiza estado do modo
  async updateModeState(guildId, channelId, userId, newState) {
    try {
      const stateJson = JSON.stringify(newState);
      
      await memoryStore.runQuery(
        'UPDATE stories_state SET state_json = ? WHERE guild_id = ? AND channel_id = ? AND user_id = ?',
        [stateJson, guildId, channelId, userId]
      );
      
      // Atualiza cache
      const cacheKey = `${guildId}:${channelId}:${userId}`;
      const cached = this.activeModes.get(cacheKey);
      if (cached) {
        cached.state = newState;
      }
      
      console.log(`[MODE-MANAGER] Estado atualizado para ${userId}`);
      return true;
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao atualizar estado:', error.message);
      return false;
    }
  }

  // Finaliza modo
  async endMode(guildId, channelId, userId, reason = 'manual') {
    try {
      await memoryStore.runQuery(
        'DELETE FROM stories_state WHERE guild_id = ? AND channel_id = ? AND user_id = ?',
        [guildId, channelId, userId]
      );
      
      // Remove do cache
      const cacheKey = `${guildId}:${channelId}:${userId}`;
      this.activeModes.delete(cacheKey);
      
      console.log(`[MODE-MANAGER] Modo finalizado para ${userId} (razão: ${reason})`);
      return true;
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao finalizar modo:', error.message);
      return false;
    }
  }

  // Verifica comandos de consolação
  async checkConsolationCommand(guildId, channelId, userId, commandName) {
    try {
      const modeInfo = await this.isInMode(guildId, channelId, userId, 'crying');
      
      if (!modeInfo.active) return false;
      
      // Comandos que podem consolar
      const consolationCommands = ['abracar', 'consolar', 'abraço'];
      
      if (consolationCommands.includes(commandName)) {
        await this.endMode(guildId, channelId, userId, 'consolado');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao verificar consolação:', error.message);
      return false;
    }
  }

  // Slot-filling: pergunta e aguarda resposta
  async startSlotFilling(guildId, channelId, userId, question, expectedType = 'any', ttlSeconds = 60) {
    try {
      const stateData = {
        type: 'slot_filling',
        question: question,
        expectedType: expectedType,
        waitingFor: true
      };
      
      return await this.startMode(guildId, channelId, userId, 'slot_filling', stateData, ttlSeconds);
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao iniciar slot-filling:', error.message);
      return false;
    }
  }

  // Processa resposta do slot-filling
  async processSlotFillingResponse(guildId, channelId, userId, response) {
    try {
      const modeInfo = await this.isInMode(guildId, channelId, userId, 'slot_filling');
      
      if (!modeInfo.active) return null;
      
      const newState = {
        ...modeInfo.state,
        waitingFor: false,
        userResponse: response,
        completed: true
      };
      
      await this.updateModeState(guildId, channelId, userId, newState);
      
      console.log(`[MODE-MANAGER] Slot-filling processado para ${userId}: "${response}"`);
      return newState;
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao processar slot-filling:', error.message);
      return null;
    }
  }

  // Verifica se usuário está aguardando slot-filling
  async isWaitingForSlotFilling(guildId, channelId, userId) {
    try {
      const modeInfo = await this.isInMode(guildId, channelId, userId, 'slot_filling');
      
      if (!modeInfo.active) return null;
      
      if (modeInfo.state.waitingFor) {
        return {
          question: modeInfo.state.question,
          expectedType: modeInfo.state.expectedType
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao verificar slot-filling:', error.message);
      return null;
    }
  }

  // Limpeza automática de modos expirados
  async cleanupExpiredModes() {
    try {
      // Remove do banco
      await memoryStore.runQuery(
        'DELETE FROM stories_state WHERE expires_at < datetime("now")'
      );
      
      // Remove do cache
      const now = Date.now();
      for (const [key, value] of this.activeModes.entries()) {
        if (value.expiresAt < now) {
          this.activeModes.delete(key);
        }
      }
      
      console.log('[MODE-MANAGER] Limpeza de modos expirados concluída');
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro na limpeza:', error.message);
    }
  }

  // Inicia timer de limpeza
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredModes();
    }, this.cleanupInterval);
  }

  // Obtém estatísticas dos modos
  async getModeStats() {
    try {
      const stats = await memoryStore.runQuery(
        'SELECT mode, COUNT(*) as count FROM stories_state WHERE expires_at > datetime("now") GROUP BY mode'
      );
      
      return {
        activeModes: stats.reduce((acc, row) => {
          acc[row.mode] = row.count;
          return acc;
        }, {}),
        cacheSize: this.activeModes.size
      };
      
    } catch (error) {
      console.error('[MODE-MANAGER] Erro ao obter stats:', error.message);
      return { activeModes: {}, cacheSize: 0 };
    }
  }
}

export default new ModeManager();
