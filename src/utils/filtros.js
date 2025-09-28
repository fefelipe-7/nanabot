// src/utils/filtros.js - Sistema de Filtros da Nanabot
// Gerencia filtros de conteúdo, segurança e moderação

import { loadState, saveState } from './stateManager.js';

class FilterSystem {
  constructor() {
    this.filterLevel = 0.7; // Nível de filtro (0-1)
    this.safetyLevel = 0.8; // Nível de segurança
    this.moderationSkills = 0.6; // Habilidades de moderação
    this.contentAnalysis = 0.5; // Análise de conteúdo
    this.filteredContent = new Map();
    this.filterRules = new Map();
    this.filterHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadFilterState();
  }

  // Carrega estado dos filtros
  loadFilterState() {
    const state = loadState('filters', this.getDefaultState());
    this.filterLevel = state.filterLevel || 0.7;
    this.safetyLevel = state.safetyLevel || 0.8;
    this.moderationSkills = state.moderationSkills || 0.6;
    this.contentAnalysis = state.contentAnalysis || 0.5;
    this.filteredContent = new Map(state.filteredContent || []);
    this.filterRules = new Map(state.filterRules || []);
    this.filterHistory = state.filterHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado dos filtros
  saveFilterState() {
    const state = {
      filterLevel: this.filterLevel,
      safetyLevel: this.safetyLevel,
      moderationSkills: this.moderationSkills,
      contentAnalysis: this.contentAnalysis,
      filteredContent: Array.from(this.filteredContent.entries()),
      filterRules: Array.from(this.filterRules.entries()),
      filterHistory: this.filterHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('filters', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      filterLevel: 0.7,
      safetyLevel: 0.8,
      moderationSkills: 0.6,
      contentAnalysis: 0.5,
      filteredContent: [],
      filterRules: [],
      filterHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e aplica filtros
  processFilters(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para conteúdo problemático
    const analysis = this.analyzeContent(input, context);
    
    // Aplica filtros baseados na análise
    const filteredResult = this.applyFilters(input, analysis, context);
    
    // Atualiza níveis de filtro
    this.updateFilterLevels(analysis, filteredResult);
    
    // Registra no histórico
    this.recordFiltering(analysis, filteredResult, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveFilterState();
    
    return {
      originalInput: input,
      analysis,
      filteredResult,
      filterLevel: this.filterLevel,
      safetyLevel: this.safetyLevel,
      moderationSkills: this.moderationSkills
    };
  }

  // Analisa conteúdo para problemas
  analyzeContent(input, context) {
    const analysis = {
      hasInappropriateContent: false,
      hasSpamContent: false,
      hasHarmfulContent: false,
      hasSensitiveContent: false,
      inappropriateContent: [],
      spamContent: [],
      harmfulContent: [],
      sensitiveContent: [],
      filterIntensity: 0,
      filterComplexity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta conteúdo inadequado
    const inappropriateContent = this.detectInappropriateContent(input, context);
    if (inappropriateContent.length > 0) {
      analysis.hasInappropriateContent = true;
      analysis.inappropriateContent = inappropriateContent;
    }
    
    // Detecta spam
    const spamContent = this.detectSpamContent(input, context);
    if (spamContent.length > 0) {
      analysis.hasSpamContent = true;
      analysis.spamContent = spamContent;
    }
    
    // Detecta conteúdo prejudicial
    const harmfulContent = this.detectHarmfulContent(input, context);
    if (harmfulContent.length > 0) {
      analysis.hasHarmfulContent = true;
      analysis.harmfulContent = harmfulContent;
    }
    
    // Detecta conteúdo sensível
    const sensitiveContent = this.detectSensitiveContent(input, context);
    if (sensitiveContent.length > 0) {
      analysis.hasSensitiveContent = true;
      analysis.sensitiveContent = sensitiveContent;
    }
    
    // Calcula intensidade do filtro
    analysis.filterIntensity = this.calculateFilterIntensity(analysis, context);
    
    // Calcula complexidade do filtro
    analysis.filterComplexity = this.calculateFilterComplexity(analysis, context);
    
    return analysis;
  }

  // Detecta conteúdo inadequado
  detectInappropriateContent(input, context) {
    const inappropriateContent = [];
    const lowerInput = input.toLowerCase();
    
    const inappropriateKeywords = {
      'linguagem_impropria': ['palavrão', 'xingamento', 'insulto', 'ofensa'],
      'conteudo_adulto': ['conteúdo adulto', 'inapropriado', 'inadequado'],
      'violencia': ['violência', 'agressão', 'briga', 'luta'],
      'discriminacao': ['discriminação', 'preconceito', 'racismo', 'sexismo']
    };
    
    for (const [type, keywords] of Object.entries(inappropriateKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          inappropriateContent.push({
            type: type,
            keyword: keyword,
            category: 'inappropriate_content',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return inappropriateContent;
  }

  // Detecta spam
  detectSpamContent(input, context) {
    const spamContent = [];
    const lowerInput = input.toLowerCase();
    
    const spamKeywords = {
      'repeticao_excessiva': ['muito muito muito', 'repetir repetir', 'igual igual igual'],
      'promocao': ['promoção', 'oferta', 'desconto', 'grátis', 'gratuito'],
      'links_suspeitos': ['http://', 'https://', 'www.', '.com', '.net'],
      'caracteres_excessivos': ['!!!!!!!!', '???????', '........', '------']
    };
    
    for (const [type, keywords] of Object.entries(spamKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          spamContent.push({
            type: type,
            keyword: keyword,
            category: 'spam_content',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return spamContent;
  }

  // Detecta conteúdo prejudicial
  detectHarmfulContent(input, context) {
    const harmfulContent = [];
    const lowerInput = input.toLowerCase();
    
    const harmfulKeywords = {
      'autoflagelacao': ['autoflagelação', 'machucar', 'ferir', 'dor'],
      'substancias': ['drogas', 'álcool', 'substâncias', 'vício'],
      'perigo': ['perigo', 'risco', 'acidente', 'morte'],
      'manipulacao': ['manipulação', 'controle', 'dominação', 'submissão']
    };
    
    for (const [type, keywords] of Object.entries(harmfulKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          harmfulContent.push({
            type: type,
            keyword: keyword,
            category: 'harmful_content',
            confidence: 0.9,
            context: context
          });
        }
      }
    }
    
    return harmfulContent;
  }

  // Detecta conteúdo sensível
  detectSensitiveContent(input, context) {
    const sensitiveContent = [];
    const lowerInput = input.toLowerCase();
    
    const sensitiveKeywords = {
      'politica': ['política', 'eleição', 'governo', 'presidente'],
      'religiao': ['religião', 'deus', 'igreja', 'fé'],
      'dinheiro': ['dinheiro', 'preço', 'custo', 'valor', 'pagamento'],
      'saude': ['saúde', 'doença', 'médico', 'hospital', 'medicamento']
    };
    
    for (const [type, keywords] of Object.entries(sensitiveKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          sensitiveContent.push({
            type: type,
            keyword: keyword,
            category: 'sensitive_content',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return sensitiveContent;
  }

  // Calcula intensidade do filtro
  calculateFilterIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em conteúdo inadequado
    if (analysis.hasInappropriateContent) {
      intensity += analysis.inappropriateContent.length * 0.3;
    }
    
    // Intensidade baseada em spam
    if (analysis.hasSpamContent) {
      intensity += analysis.spamContent.length * 0.2;
    }
    
    // Intensidade baseada em conteúdo prejudicial
    if (analysis.hasHarmfulContent) {
      intensity += analysis.harmfulContent.length * 0.4;
    }
    
    // Intensidade baseada em conteúdo sensível
    if (analysis.hasSensitiveContent) {
      intensity += analysis.sensitiveContent.length * 0.1;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula complexidade do filtro
  calculateFilterComplexity(analysis, context) {
    let complexity = 0.1; // Base
    
    // Complexidade baseada no número de elementos
    complexity += analysis.inappropriateContent.length * 0.2;
    complexity += analysis.spamContent.length * 0.15;
    complexity += analysis.harmfulContent.length * 0.3;
    complexity += analysis.sensitiveContent.length * 0.1;
    
    return Math.min(1, complexity);
  }

  // Aplica filtros baseados na análise
  applyFilters(input, analysis, context) {
    const filteredResult = {
      isFiltered: false,
      filteredContent: input,
      filterReasons: [],
      filterActions: [],
      safetyScore: 1.0,
      moderationNeeded: false
    };
    
    // Aplica filtros baseados na análise
    if (analysis.hasInappropriateContent) {
      filteredResult.isFiltered = true;
      filteredResult.filterReasons.push('Conteúdo inadequado detectado');
      filteredResult.filterActions.push('Aplicar filtro de linguagem');
      filteredResult.safetyScore -= 0.3;
    }
    
    if (analysis.hasSpamContent) {
      filteredResult.isFiltered = true;
      filteredResult.filterReasons.push('Spam detectado');
      filteredResult.filterActions.push('Aplicar filtro anti-spam');
      filteredResult.safetyScore -= 0.2;
    }
    
    if (analysis.hasHarmfulContent) {
      filteredResult.isFiltered = true;
      filteredResult.filterReasons.push('Conteúdo prejudicial detectado');
      filteredResult.filterActions.push('Aplicar filtro de segurança');
      filteredResult.safetyScore -= 0.5;
      filteredResult.moderationNeeded = true;
    }
    
    if (analysis.hasSensitiveContent) {
      filteredResult.isFiltered = true;
      filteredResult.filterReasons.push('Conteúdo sensível detectado');
      filteredResult.filterActions.push('Aplicar filtro de sensibilidade');
      filteredResult.safetyScore -= 0.1;
    }
    
    // Aplica filtros ao conteúdo
    if (filteredResult.isFiltered) {
      filteredResult.filteredContent = this.filterContent(input, analysis);
    }
    
    return filteredResult;
  }

  // Filtra conteúdo
  filterContent(input, analysis) {
    let filteredContent = input;
    
    // Filtra conteúdo inadequado
    if (analysis.hasInappropriateContent) {
      filteredContent = this.filterInappropriateContent(filteredContent);
    }
    
    // Filtra spam
    if (analysis.hasSpamContent) {
      filteredContent = this.filterSpamContent(filteredContent);
    }
    
    // Filtra conteúdo prejudicial
    if (analysis.hasHarmfulContent) {
      filteredContent = this.filterHarmfulContent(filteredContent);
    }
    
    // Filtra conteúdo sensível
    if (analysis.hasSensitiveContent) {
      filteredContent = this.filterSensitiveContent(filteredContent);
    }
    
    return filteredContent;
  }

  // Filtra conteúdo inadequado
  filterInappropriateContent(content) {
    // Substitui palavras inadequadas por versões mais suaves
    const replacements = {
      'palavrão': 'palavra inadequada',
      'xingamento': 'palavra ruim',
      'insulto': 'palavra ofensiva',
      'ofensa': 'palavra desagradável'
    };
    
    let filteredContent = content;
    for (const [bad, good] of Object.entries(replacements)) {
      filteredContent = filteredContent.replace(new RegExp(bad, 'gi'), good);
    }
    
    return filteredContent;
  }

  // Filtra spam
  filterSpamContent(content) {
    // Remove repetições excessivas
    let filteredContent = content;
    
    // Remove caracteres repetidos excessivamente
    filteredContent = filteredContent.replace(/(.)\1{4,}/g, '$1$1$1');
    
    // Remove espaços excessivos
    filteredContent = filteredContent.replace(/\s{3,}/g, ' ');
    
    return filteredContent;
  }

  // Filtra conteúdo prejudicial
  filterHarmfulContent(content) {
    // Substitui conteúdo prejudicial por avisos
    const warnings = {
      'autoflagelação': 'comportamento prejudicial',
      'machucar': 'causar dano',
      'ferir': 'causar ferimento',
      'drogas': 'substâncias prejudiciais',
      'álcool': 'substância prejudicial',
      'perigo': 'situação de risco',
      'morte': 'situação extrema'
    };
    
    let filteredContent = content;
    for (const [harmful, warning] of Object.entries(warnings)) {
      filteredContent = filteredContent.replace(new RegExp(harmful, 'gi'), warning);
    }
    
    return filteredContent;
  }

  // Filtra conteúdo sensível
  filterSensitiveContent(content) {
    // Adiciona contexto neutro para conteúdo sensível
    const neutralizations = {
      'política': 'assunto político',
      'religião': 'assunto religioso',
      'dinheiro': 'assunto financeiro',
      'saúde': 'assunto de saúde'
    };
    
    let filteredContent = content;
    for (const [sensitive, neutral] of Object.entries(neutralizations)) {
      filteredContent = filteredContent.replace(new RegExp(sensitive, 'gi'), neutral);
    }
    
    return filteredContent;
  }

  // Atualiza níveis de filtro
  updateFilterLevels(analysis, filteredResult) {
    // Atualiza nível de filtro
    if (filteredResult.isFiltered) {
      this.filterLevel = Math.min(1, this.filterLevel + 0.02);
    }
    
    // Atualiza nível de segurança
    if (analysis.hasHarmfulContent) {
      this.safetyLevel = Math.min(1, this.safetyLevel + 0.03);
    }
    
    // Atualiza habilidades de moderação
    if (filteredResult.moderationNeeded) {
      this.moderationSkills = Math.min(1, this.moderationSkills + 0.02);
    }
    
    // Atualiza análise de conteúdo
    if (analysis.filterComplexity > 0.5) {
      this.contentAnalysis = Math.min(1, this.contentAnalysis + 0.02);
    }
    
    // Aplica decaimento natural
    this.filterLevel *= 0.999;
    this.safetyLevel *= 0.998;
    this.moderationSkills *= 0.997;
    this.contentAnalysis *= 0.998;
  }

  // Registra filtragem
  recordFiltering(analysis, filteredResult, timestamp) {
    const record = {
      timestamp,
      analysis,
      filteredResult,
      filterLevel: this.filterLevel,
      safetyLevel: this.safetyLevel,
      moderationSkills: this.moderationSkills
    };
    
    this.filterHistory.push(record);
    
    // Mantém histórico limitado
    if (this.filterHistory.length > 300) {
      this.filterHistory = this.filterHistory.slice(-300);
    }
  }

  // Obtém estatísticas dos filtros
  getFilterStats() {
    const stats = {
      filterLevel: this.filterLevel,
      safetyLevel: this.safetyLevel,
      moderationSkills: this.moderationSkills,
      contentAnalysis: this.contentAnalysis,
      totalFiltered: this.filteredContent.size,
      totalRules: this.filterRules.size,
      recentFiltering: this.filterHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de filtros
  resetFilterSystem() {
    this.filterLevel = 0.7;
    this.safetyLevel = 0.8;
    this.moderationSkills = 0.6;
    this.contentAnalysis = 0.5;
    this.filteredContent.clear();
    this.filterRules.clear();
    this.filterHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

// Instância global do sistema de filtros
const filterSystem = new FilterSystem();

// Funções de conveniência
export const processFilters = (input, context) => filterSystem.processFilters(input, context);
export const getFilterStats = () => filterSystem.getFilterStats();
export const resetFilterSystem = () => filterSystem.resetFilterSystem();

export default filterSystem;
