// src/commands/memoria.js - Comando unificado n!memoria
import { formatReply } from '../utils/formatReply.js';
import storyTeller from '../modules/storyTeller.js';
import emotionBase from '../modules/emotionBase.js';
import contextManager from '../modules/contextManager.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'memoria',
  description: 'A Alice resgata lembranças ou cria memórias fofinhas',
  category: 'historias',
  aliases: ['lembrança', 'lembranca', 'memory', 'lembrar'],
  
  async execute(message, client) {
    console.log(`[MEMORIA-COMMAND] 🧠 Executando comando memoria para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Busca histórico real
      const contextHistory = await this.getContextHistory(guildId, channelId, userId);
      
      // Determina se deve usar IA
      const useAI = config.useAI && await this.isAIAvailable();
      
      // Gera memória
      const memory = await storyTeller.generateMemory(contextHistory, useAI);
      
      // Aplica variação emocional
      const finalMemory = emotionBase.applyEmotionVariation(memory, emotionBase.getIntensityByMood());
      
      await message.reply(formatReply(finalMemory));
      console.log(`[MEMORIA-COMMAND] ✅ Memória gerada com sucesso`);
      
    } catch (error) {
      console.error(`[MEMORIA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Tenho muitas lembranças especiais nossas guardadas no coração! 💕'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.memoria || {};
    } catch (error) {
      console.error('[MEMORIA-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Obtém histórico de contexto
  async getContextHistory(guildId, channelId, userId) {
    try {
      // Busca histórico recente
      const recentHistory = await contextManager.getRecentHistory(guildId, channelId, userId, 10);
      
      // Busca resumos
      const summaries = await contextManager.getSummaries(guildId, channelId, userId);
      
      // Combina histórico e resumos
      const contextHistory = [];
      
      // Adiciona resumos primeiro (mais relevantes)
      summaries.forEach(summary => {
        contextHistory.push({
          content: summary.content,
          role: 'summary',
          created_at: summary.created_at
        });
      });
      
      // Adiciona histórico recente
      recentHistory.forEach(msg => {
        contextHistory.push({
          content: msg.content,
          role: msg.role,
          created_at: msg.created_at
        });
      });
      
      console.log(`[MEMORIA-COMMAND] 📚 Histórico obtido: ${contextHistory.length} itens`);
      return contextHistory;
      
    } catch (error) {
      console.error('[MEMORIA-COMMAND] Erro ao obter histórico:', error.message);
      return [];
    }
  },

  // Verifica se IA está disponível
  async isAIAvailable() {
    try {
      const apiRotator = await import('../utils/apiRotator.js');
      const stats = apiRotator.default.getStats();
      return stats.activeModels > 0;
    } catch (error) {
      return false;
    }
  }
};
