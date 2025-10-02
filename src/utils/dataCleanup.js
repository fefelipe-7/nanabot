// src/utils/dataCleanup.js - Sistema de limpeza automática de dados
import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';

class DataCleanupSystem {
  constructor() {
    this.dataPath = './data';
    this.maxHistoryEntries = 100;
    this.maxExperienceBuffer = 50;
    this.maxPatternEntries = 20;
    this.maxAttachmentEntries = 10;
    this.cleanupInterval = 24 * 60 * 60 * 1000; // 24 horas
    this.lastCleanup = null;
    this.cleanupCount = 0;
    this.optimizedFilesCount = 0;
    this.deletedFilesCount = 0;
    this.isStarted = false;
  }

  async start() {
    logger.info('[DATA-CLEANUP] 🧹 Iniciando sistema de limpeza automática...');
    
    this.isStarted = true;
    
    // Executa limpeza inicial
    await this.performCleanup();
    
    // Configura limpeza periódica
    setInterval(async () => {
      await this.performCleanup();
    }, this.cleanupInterval);
    
    logger.info(`[DATA-CLEANUP] ✅ Sistema configurado para limpeza a cada ${this.cleanupInterval / 1000 / 60 / 60} horas`);
  }

  async performCleanup() {
    try {
      logger.info('[DATA-CLEANUP] 🔄 Executando limpeza de dados...');
      
      const cleanupTasks = [
        this.cleanupPreferenceHistory(),
        this.cleanupSocialLearningHistory(),
        this.cleanupLearningBuffer(),
        this.cleanupPatternHistory(),
        this.cleanupFilterHistory(),
        this.cleanupAttachmentData(),
        this.cleanupKnowledgeBase(),
        this.cleanupEstiloHistory()
      ];

      const results = await Promise.allSettled(cleanupTasks);
      
      let successCount = 0;
      let failCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          this.optimizedFilesCount += result.value || 1; // Conta arquivos otimizados
          logger.debug(`[DATA-CLEANUP] ✅ Tarefa ${index + 1} concluída`);
        } else {
          failCount++;
          logger.error(`[DATA-CLEANUP] ❌ Tarefa ${index + 1} falhou:`, result.reason);
        }
      });

      this.lastCleanup = new Date().toISOString();
      this.cleanupCount++;
      
      logger.info(`[DATA-CLEANUP] 🎯 Limpeza concluída: ${successCount} sucessos, ${failCount} falhas`);
      
    } catch (error) {
      logger.error('[DATA-CLEANUP] 💥 Erro durante limpeza:', error.message);
    }
  }

  async cleanupPreferenceHistory() {
    try {
      const filePath = path.join(this.dataPath, 'preferenceState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.preferenceHistory && data.preferenceHistory.length > this.maxHistoryEntries) {
        data.preferenceHistory = data.preferenceHistory.slice(-this.maxHistoryEntries);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.debug('[DATA-CLEANUP] 📊 Histórico de preferências otimizado');
      }
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar preferências:', error.message);
    }
  }

  async cleanupSocialLearningHistory() {
    try {
      const filePath = path.join(this.dataPath, 'socialLearningState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      // Manter apenas insights e skills mais recentes e relevantes
      if (data.keyInsights && data.keyInsights.length > 10) {
        data.keyInsights = data.keyInsights
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);
      }
      
      if (data.keySkills && data.keySkills.length > 5) {
        data.keySkills = data.keySkills
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
      }
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      logger.debug('[DATA-CLEANUP] 🧠 Dados de aprendizado social otimizados');
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar aprendizado social:', error.message);
    }
  }

  async cleanupLearningBuffer() {
    try {
      const filePath = path.join(this.dataPath, 'learningState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.recentExperiences && data.recentExperiences.length > this.maxExperienceBuffer) {
        data.recentExperiences = data.recentExperiences
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, this.maxExperienceBuffer);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.debug('[DATA-CLEANUP] 📚 Buffer de experiências otimizado');
      }
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar buffer de aprendizado:', error.message);
    }
  }

  async cleanupPatternHistory() {
    try {
      const filePath = path.join(this.dataPath, 'patternState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.activePatterns && data.activePatterns.length > this.maxPatternEntries) {
        data.activePatterns = data.activePatterns
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, this.maxPatternEntries);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.debug('[DATA-CLEANUP] 🔍 Padrões otimizados');
      }
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar padrões:', error.message);
    }
  }

  async cleanupFilterHistory() {
    try {
      const filePath = path.join(this.dataPath, 'filtersState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.recentActivity && data.recentActivity.length > 50) {
        data.recentActivity = data.recentActivity
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 50);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.debug('[DATA-CLEANUP] 🛡️ Histórico de filtros otimizado');
      }
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar filtros:', error.message);
    }
  }

  async cleanupAttachmentData() {
    try {
      const filePath = path.join(this.dataPath, 'attachmentState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.activeAttachments && data.activeAttachments.length > this.maxAttachmentEntries) {
        data.activeAttachments = data.activeAttachments
          .sort((a, b) => b.interactionCount - a.interactionCount)
          .slice(0, this.maxAttachmentEntries);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.debug('[DATA-CLEANUP] 💝 Dados de apego otimizados');
      }
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar dados de apego:', error.message);
    }
  }

  async cleanupKnowledgeBase() {
    try {
      const filePath = path.join(this.dataPath, 'knowledgeState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.knowledgeBase && data.knowledgeBase.length > 100) {
        data.knowledgeBase = data.knowledgeBase
          .sort((a, b) => b[1].importance - a[1].importance)
          .slice(0, 100);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.debug('[DATA-CLEANUP] 📖 Base de conhecimento otimizada');
      }
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar base de conhecimento:', error.message);
    }
  }

  async cleanupEstiloHistory() {
    try {
      const filePath = path.join(this.dataPath, 'estiloState.json');
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.estiloHistory && data.estiloHistory.length > 50) {
        data.estiloHistory = data.estiloHistory
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 50);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        logger.debug('[DATA-CLEANUP] 🎨 Histórico de estilo otimizado');
      }
    } catch (error) {
      logger.error('[DATA-CLEANUP] Erro ao limpar histórico de estilo:', error.message);
    }
  }

  async forceCleanup() {
    logger.info('[DATA-CLEANUP] 🚀 Executando limpeza forçada...');
    await this.performCleanup();
  }

  getStats() {
    const nextCleanup = this.lastCleanup 
      ? new Date(new Date(this.lastCleanup).getTime() + this.cleanupInterval).toLocaleString('pt-BR')
      : 'N/A';
    
    return {
      isStarted: this.isStarted,
      cleanupCount: this.cleanupCount,
      optimizedFilesCount: this.optimizedFilesCount,
      deletedFilesCount: this.deletedFilesCount,
      lastCleanupTime: this.lastCleanup ? new Date(this.lastCleanup).toLocaleString('pt-BR') : 'Nunca',
      nextCleanup: nextCleanup,
      cleanupInterval: this.cleanupInterval,
      maxHistoryEntries: this.maxHistoryEntries,
      maxExperienceBuffer: this.maxExperienceBuffer,
      maxPatternEntries: this.maxPatternEntries,
      maxAttachmentEntries: this.maxAttachmentEntries,
      isActive: this.isStarted
    };
  }
}

export default new DataCleanupSystem();
