// src/modules/postProcessor.js - Pós-Processamento da Alice
import { formatReply } from '../utils/formatReply.js';
import { getUserRole } from '../utils/helpers.js';
import styleEngine from './styleEngine.js';
import moodEngine from './moodEngine.js';
import variationEngine from './variationEngine.js';
import antiRepeat from './antiRepeat.js';

class PostProcessor {
  constructor() {
    this.processedCount = 0;
    this.errorCount = 0;
  }

  // Processa resposta completa
  async processResponse(response, userId, userContext = {}) {
    try {
      this.processedCount++;
      console.log(`[POST-PROCESSOR] Processando resposta #${this.processedCount} para usuário ${userId}`);

      let processedResponse = response;

      // 1. Anti-repetição
      processedResponse = antiRepeat.processResponse(processedResponse, userId);

      // 2. Garantir saudação adequada ao papel
      processedResponse = this.ensureProperGreeting(processedResponse, userContext);

      // 3. Adicionar variação se necessário
      processedResponse = this.addVariationIfNeeded(processedResponse, userId, userContext);

      // 4. Adicionar expressões se ausentes
      processedResponse = this.addExpressionsIfMissing(processedResponse, userContext);

      // 5. Aplicar formatação final
      processedResponse = formatReply(processedResponse);

      // 6. Validação de segurança
      processedResponse = this.validateSafety(processedResponse);

      console.log(`[POST-PROCESSOR] Resposta processada com sucesso`);
      return processedResponse;

    } catch (error) {
      this.errorCount++;
      console.error(`[POST-PROCESSOR] Erro no processamento:`, error.message);
      
      // Fallback: aplica apenas formatação básica
      return formatReply(response);
    }
  }

  // Garante saudação adequada ao papel do usuário
  ensureProperGreeting(response, userContext) {
    const { role, username } = userContext;
    
    // Define como chamar o usuário
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

    // Se a resposta não menciona o usuário, adiciona saudação
    if (!response.toLowerCase().includes(userCall.toLowerCase()) && 
        !response.toLowerCase().includes('você')) {
      
      const greeting = styleEngine.generateOpening(userCall);
      response = `${greeting} ${response}`;
    }

    return response;
  }

  // Adiciona variação se necessário
  addVariationIfNeeded(response, userId, userContext) {
    const config = styleEngine.getConfig();
    
    // Adiciona variação baseada na taxa configurada
    if (Math.random() < config.style.interjectionRate) {
      response = variationEngine.addVariation(response, 'response', userId);
    }

    return response;
  }

  // Adiciona expressões se ausentes
  addExpressionsIfMissing(response, userContext) {
    const config = styleEngine.getConfig();
    
    // Verifica se já tem expressões (texto entre asteriscos)
    const hasExpression = /\*[^*]+\*/.test(response);
    
    if (!hasExpression && Math.random() < 0.3) {
      const mood = moodEngine.getCurrentMood();
      const expression = moodEngine.generateExpression(mood);
      response = `${expression} ${response}`;
    }

    return response;
  }

  // Validação de segurança
  validateSafety(response) {
    const config = styleEngine.getConfig();
    
    if (!config.style.safety) {
      return response;
    }

    // Remove termos proibidos
    const forbiddenTerms = config.safety.forbiddenTerms || [];
    let safeResponse = response;
    
    forbiddenTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      safeResponse = safeResponse.replace(regex, '[termo removido]');
    });

    // Suaviza conteúdo adulto/tóxico (implementação básica)
    if (config.safety.adultContent === false) {
      // Lista básica de palavras adultas (expandir conforme necessário)
      const adultWords = ['palavra1', 'palavra2']; // Adicionar palavras específicas
      adultWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        safeResponse = safeResponse.replace(regex, '[conteúdo suavizado]');
      });
    }

    return safeResponse;
  }

  // Processa resposta de fallback
  processFallbackResponse(response, userId, userContext = {}) {
    try {
      console.log(`[POST-PROCESSOR] Processando fallback para usuário ${userId}`);
      
      // Aplica apenas formatação básica para fallback
      let processedResponse = this.ensureProperGreeting(response, userContext);
      processedResponse = formatReply(processedResponse);
      
      return processedResponse;
    } catch (error) {
      console.error(`[POST-PROCESSOR] Erro no fallback:`, error.message);
      return formatReply(response);
    }
  }

  // Obtém estatísticas do processador
  getStats() {
    const successRate = this.processedCount > 0 ? 
      ((this.processedCount - this.errorCount) / this.processedCount * 100).toFixed(1) : 0;

    return {
      totalProcessed: this.processedCount,
      totalErrors: this.errorCount,
      successRate: `${successRate}%`,
      antiRepeatStats: antiRepeat.getStats(),
      variationStats: variationEngine.getVariationStats()
    };
  }

  // Reseta estatísticas
  resetStats() {
    this.processedCount = 0;
    this.errorCount = 0;
    antiRepeat.clearAllHistory();
    variationEngine.clearTemplateHistory();
    console.log('[POST-PROCESSOR] Estatísticas resetadas');
  }

  // Atualiza configurações
  updateConfig(config) {
    if (config.antiRepeat) {
      antiRepeat.updateConfig(config.antiRepeat);
    }
    
    if (config.style) {
      styleEngine.updateConfig(config.style);
    }
    
    console.log('[POST-PROCESSOR] Configurações atualizadas');
  }
}

export default new PostProcessor();
