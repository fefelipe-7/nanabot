// src/modules/antiRepeat.js - Sistema Anti-Repetição da Alice
class AntiRepeat {
  constructor() {
    this.userResponses = new Map(); // userId -> [responses recentes]
    this.maxHistory = 5; // Máximo de respostas para comparar
    this.similarityThreshold = 0.8; // Limite de similaridade (0-1)
  }

  // Gera shingles (n-gramas) do texto
  generateShingles(text, n = 3) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const shingles = new Set();
    for (let i = 0; i <= words.length - n; i++) {
      const shingle = words.slice(i, i + n).join(' ');
      shingles.add(shingle);
    }
    
    return shingles;
  }

  // Calcula similaridade Jaccard entre dois conjuntos
  calculateJaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Verifica se a resposta é muito similar às anteriores
  isTooSimilar(newResponse, userId) {
    if (!this.userResponses.has(userId)) {
      return false;
    }

    const recentResponses = this.userResponses.get(userId);
    const newShingles = this.generateShingles(newResponse);

    for (const oldResponse of recentResponses) {
      const oldShingles = this.generateShingles(oldResponse);
      const similarity = this.calculateJaccardSimilarity(newShingles, oldShingles);
      
      if (similarity > this.similarityThreshold) {
        console.log(`[ANTI-REPEAT] Resposta muito similar detectada (${similarity.toFixed(2)}) para usuário ${userId}`);
        return true;
      }
    }

    return false;
  }

  // Registra nova resposta do usuário
  registerResponse(userId, response) {
    if (!this.userResponses.has(userId)) {
      this.userResponses.set(userId, []);
    }

    const userResponses = this.userResponses.get(userId);
    userResponses.push(response);

    // Mantém apenas as respostas mais recentes
    if (userResponses.length > this.maxHistory) {
      userResponses.shift();
    }

    console.log(`[ANTI-REPEAT] Resposta registrada para usuário ${userId} (${userResponses.length}/${this.maxHistory})`);
  }

  // Ajusta resposta para reduzir similaridade
  adjustResponse(response, userId) {
    if (!this.isTooSimilar(response, userId)) {
      return response;
    }

    console.log(`[ANTI-REPEAT] Ajustando resposta para usuário ${userId}`);

    // Estratégias de ajuste
    const adjustments = [
      // Adiciona expressão no início
      () => `*olha com curiosidade* ${response}`,
      
      // Adiciona interjeição
      () => `Hmm... ${response}`,
      
      // Adiciona variação no final
      () => `${response} E você, o que acha?`,
      
      // Reformula com sinônimos
      () => this.replaceWithSynonyms(response),
      
      // Adiciona contexto emocional
      () => `*fica pensativa* ${response}`
    ];

    // Tenta diferentes ajustes até encontrar um que não seja muito similar
    for (const adjustment of adjustments) {
      const adjustedResponse = adjustment();
      if (!this.isTooSimilar(adjustedResponse, userId)) {
        return adjustedResponse;
      }
    }

    // Se todos os ajustes falharem, adiciona uma expressão simples
    return `*sorri* ${response}`;
  }

  // Substitui palavras por sinônimos simples
  replaceWithSynonyms(text) {
    const synonyms = {
      'legal': 'bacana',
      'bom': 'ótimo',
      'feliz': 'alegre',
      'brincar': 'jogar',
      'casa': 'lar',
      'amigo': 'amiguinho'
    };

    let result = text;
    Object.keys(synonyms).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, synonyms[word]);
    });

    return result;
  }

  // Processa resposta completa (verifica + ajusta + registra)
  processResponse(response, userId) {
    // Verifica se é muito similar
    if (this.isTooSimilar(response, userId)) {
      response = this.adjustResponse(response, userId);
    }

    // Registra a resposta final
    this.registerResponse(userId, response);

    return response;
  }

  // Limpa histórico de um usuário específico
  clearUserHistory(userId) {
    this.userResponses.delete(userId);
    console.log(`[ANTI-REPEAT] Histórico limpo para usuário ${userId}`);
  }

  // Limpa todo o histórico
  clearAllHistory() {
    this.userResponses.clear();
    console.log('[ANTI-REPEAT] Todo o histórico foi limpo');
  }

  // Obtém estatísticas de anti-repetição
  getStats() {
    const totalUsers = this.userResponses.size;
    const totalResponses = Array.from(this.userResponses.values())
      .reduce((sum, responses) => sum + responses.length, 0);

    return {
      totalUsers,
      totalResponses,
      averageResponsesPerUser: totalUsers > 0 ? totalResponses / totalUsers : 0,
      similarityThreshold: this.similarityThreshold,
      maxHistory: this.maxHistory
    };
  }

  // Atualiza configurações
  updateConfig(config) {
    if (config.similarityThreshold !== undefined) {
      this.similarityThreshold = Math.max(0, Math.min(1, config.similarityThreshold));
    }
    if (config.maxHistory !== undefined) {
      this.maxHistory = Math.max(1, config.maxHistory);
    }
    console.log('[ANTI-REPEAT] Configurações atualizadas:', config);
  }
}

export default new AntiRepeat();
