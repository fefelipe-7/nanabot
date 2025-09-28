// src/brain/preferencias.js - Sistema de Preferências da Nanabot
// Gerencia gostos, desgostos e preferências pessoais

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PreferenceSystem {
  constructor() {
    this.preferences = new Map();
    this.preferenceHistory = [];
    this.preferenceCategories = this.initializeCategories();
    this.preferenceWeights = this.initializeWeights();
    this.lastUpdate = new Date().toISOString();
    this.loadPreferenceState();
  }

  // Inicializa categorias de preferências
  initializeCategories() {
    return {
      activities: {
        'brincar': { base: 0.8, keywords: ['brincar', 'jogar', 'diversão', 'brincadeira'] },
        'histórias': { base: 0.9, keywords: ['história', 'conto', 'fábula', 'aventura'] },
        'música': { base: 0.7, keywords: ['música', 'cantar', 'dançar', 'ritmo'] },
        'desenhar': { base: 0.6, keywords: ['desenhar', 'pintar', 'arte', 'criar'] },
        'cozinhar': { base: 0.5, keywords: ['cozinhar', 'comida', 'receita', 'fazer'] },
        'ler': { base: 0.8, keywords: ['ler', 'livro', 'texto', 'aprender'] },
        'exercícios': { base: 0.4, keywords: ['exercício', 'correr', 'pular', 'movimento'] },
        'dormir': { base: 0.6, keywords: ['dormir', 'sono', 'descansar', 'cama'] }
      },
      topics: {
        'animais': { base: 0.9, keywords: ['gato', 'cachorro', 'passarinho', 'animal', 'bicho'] },
        'natureza': { base: 0.8, keywords: ['flor', 'árvore', 'sol', 'lua', 'estrela'] },
        'família': { base: 0.95, keywords: ['mamãe', 'papai', 'família', 'parentes'] },
        'amigos': { base: 0.7, keywords: ['amigo', 'amiga', 'colega', 'pessoa'] },
        'comida': { base: 0.6, keywords: ['comida', 'lanche', 'doce', 'fruta'] },
        'brinquedos': { base: 0.8, keywords: ['brinquedo', 'boneca', 'carrinho', 'jogo'] },
        'escola': { base: 0.5, keywords: ['escola', 'aula', 'professor', 'aprender'] },
        'tecnologia': { base: 0.3, keywords: ['computador', 'celular', 'internet', 'app'] }
      },
      emotions: {
        'alegria': { base: 0.9, keywords: ['feliz', 'alegre', 'sorrindo', 'riso'] },
        'amor': { base: 0.95, keywords: ['amor', 'carinho', 'beijo', 'abraço'] },
        'tranquilidade': { base: 0.7, keywords: ['calma', 'paz', 'tranquilo', 'sereno'] },
        'excitação': { base: 0.6, keywords: ['animado', 'empolgado', 'surpresa', 'novidade'] },
        'tristeza': { base: 0.2, keywords: ['triste', 'chorando', 'melancolia', 'saudade'] },
        'medo': { base: 0.1, keywords: ['medo', 'assustado', 'terror', 'pavor'] },
        'raiva': { base: 0.1, keywords: ['raiva', 'bravo', 'irritado', 'fúria'] }
      },
      environments: {
        'casa': { base: 0.9, keywords: ['casa', 'lar', 'quarto', 'sala'] },
        'parque': { base: 0.8, keywords: ['parque', 'jardim', 'praça', 'natureza'] },
        'escola': { base: 0.5, keywords: ['escola', 'aula', 'classe', 'professor'] },
        'loja': { base: 0.4, keywords: ['loja', 'compras', 'mercado', 'shopping'] },
        'hospital': { base: 0.2, keywords: ['hospital', 'médico', 'doente', 'remédio'] },
        'escuro': { base: 0.1, keywords: ['escuro', 'noite', 'sombra', 'escuridão'] }
      },
      people: {
        'mamãe': { base: 0.95, keywords: ['mamãe', 'mãe', 'mamã'] },
        'papai': { base: 0.95, keywords: ['papai', 'pai', 'papá'] },
        'avós': { base: 0.8, keywords: ['vovó', 'vovô', 'avó', 'avô'] },
        'tios': { base: 0.6, keywords: ['tio', 'tia', 'primo', 'prima'] },
        'amigos': { base: 0.7, keywords: ['amigo', 'amiga', 'colega'] },
        'estranhos': { base: 0.3, keywords: ['pessoa', 'gente', 'alguém'] }
      }
    };
  }

  // Inicializa pesos das preferências
  initializeWeights() {
    return {
      positive: 0.1,    // Aumento por interação positiva
      negative: -0.05,  // Diminuição por interação negativa
      time: 0.001,      // Decaimento natural por tempo
      intensity: 0.5,   // Multiplicador de intensidade
      novelty: 0.2      // Bônus para coisas novas
    };
  }

  // Carrega estado das preferências
  loadPreferenceState() {
    try {
      const preferencePath = path.resolve(__dirname, '../../data/preferenceState.json');
      if (fs.existsSync(preferencePath)) {
        const data = fs.readFileSync(preferencePath, 'utf-8');
        const state = JSON.parse(data);
        
        this.preferences = new Map(state.preferences || []);
        this.preferenceHistory = state.preferenceHistory || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado das preferências:', error);
    }
  }

  // Salva estado das preferências
  savePreferenceState() {
    try {
      const preferencePath = path.resolve(__dirname, '../../data/preferenceState.json');
      const state = {
        preferences: Array.from(this.preferences.entries()),
        preferenceHistory: this.preferenceHistory.slice(-500), // Últimas 500 entradas
        lastUpdate: this.lastUpdate,
        categories: this.preferenceCategories
      };
      fs.writeFileSync(preferencePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado das preferências:', error);
    }
  }

  // Processa entrada e atualiza preferências
  processInput(input, context = {}) {
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - new Date(this.lastUpdate).getTime();
    
    // Aplica decaimento natural
    this.applyTimeDecay(timeSinceLastUpdate);
    
    // Extrai preferências da entrada
    const detectedPreferences = this.extractPreferences(input, context);
    
    // Atualiza preferências
    const changes = this.updatePreferences(detectedPreferences, context);
    
    // Registra mudanças
    this.recordPreferenceChanges(detectedPreferences, changes, context);
    
    this.lastUpdate = now.toISOString();
    this.savePreferenceState();
    
    return {
      detected: detectedPreferences,
      changes: changes,
      currentPreferences: this.getCurrentPreferences()
    };
  }

  // Extrai preferências da entrada
  extractPreferences(input, context = {}) {
    const detected = [];
    const lowerInput = input.toLowerCase();
    
    // Analisa cada categoria
    for (const [category, items] of Object.entries(this.preferenceCategories)) {
      for (const [item, data] of Object.entries(items)) {
        let intensity = 0;
        let matches = 0;
        
        // Verifica palavras-chave
        for (const keyword of data.keywords) {
          if (lowerInput.includes(keyword)) {
            intensity += 0.2;
            matches++;
          }
        }
        
        // Verifica contexto
        if (context.userRole === 'mamãe' || context.userRole === 'papai') {
          intensity += 0.1; // Bônus para interações com pais
        }
        
        if (context.isFirstInteraction) {
          intensity += 0.1; // Bônus para primeira interação
        }
        
        if (matches > 0) {
          detected.push({
            category,
            item,
            intensity: Math.min(1, intensity),
            matches,
            base: data.base,
            context: context
          });
        }
      }
    }
    
    return detected;
  }

  // Atualiza preferências
  updatePreferences(detectedPreferences, context = {}) {
    const changes = [];
    
    for (const preference of detectedPreferences) {
      const key = `${preference.category}:${preference.item}`;
      const currentPreference = this.preferences.get(key) || {
        category: preference.category,
        item: preference.item,
        level: preference.base,
        interactions: 0,
        positiveInteractions: 0,
        negativeInteractions: 0,
        lastUpdate: new Date().toISOString(),
        confidence: 0.5
      };
      
      // Calcula mudança baseada na intensidade
      const change = this.calculatePreferenceChange(preference, currentPreference, context);
      
      // Atualiza nível da preferência
      const newLevel = Math.max(0, Math.min(1, currentPreference.level + change));
      const levelChange = newLevel - currentPreference.level;
      
      currentPreference.level = newLevel;
      currentPreference.interactions++;
      
      if (change > 0) {
        currentPreference.positiveInteractions++;
      } else if (change < 0) {
        currentPreference.negativeInteractions++;
      }
      
      currentPreference.lastUpdate = new Date().toISOString();
      currentPreference.confidence = this.calculateConfidence(currentPreference);
      
      this.preferences.set(key, currentPreference);
      
      changes.push({
        key,
        category: preference.category,
        item: preference.item,
        oldLevel: currentPreference.level - levelChange,
        newLevel: currentPreference.level,
        change: levelChange,
        confidence: currentPreference.confidence
      });
    }
    
    return changes;
  }

  // Calcula mudança na preferência
  calculatePreferenceChange(preference, currentPreference, context) {
    let change = 0;
    
    // Mudança baseada na intensidade
    change += preference.intensity * this.preferenceWeights.intensity;
    
    // Bônus para novidade
    if (currentPreference.interactions === 0) {
      change += this.preferenceWeights.novelty;
    }
    
    // Ajuste baseado no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      change *= 1.2; // 20% mais influência dos pais
    }
    
    // Ajuste baseado na confiança atual
    change *= currentPreference.confidence;
    
    return change;
  }

  // Calcula confiança na preferência
  calculateConfidence(preference) {
    const totalInteractions = preference.interactions;
    const positiveRatio = preference.positiveInteractions / totalInteractions;
    const consistency = Math.abs(positiveRatio - 0.5) * 2; // 0 = inconsistente, 1 = consistente
    
    return Math.min(1, (totalInteractions / 10) * 0.5 + consistency * 0.5);
  }

  // Aplica decaimento natural por tempo
  applyTimeDecay(timeSinceLastUpdate) {
    const decayFactor = Math.min(1, timeSinceLastUpdate / 86400000); // Normalizado por dia
    
    for (const [key, preference] of this.preferences) {
      const decay = this.preferenceWeights.time * decayFactor;
      preference.level = Math.max(0, preference.level - decay);
    }
  }

  // Registra mudanças nas preferências
  recordPreferenceChanges(detectedPreferences, changes, context) {
    const record = {
      timestamp: new Date().toISOString(),
      detected: detectedPreferences,
      changes: changes,
      context: context,
      totalPreferences: this.preferences.size
    };
    
    this.preferenceHistory.push(record);
    
    // Mantém histórico limitado
    if (this.preferenceHistory.length > 1000) {
      this.preferenceHistory = this.preferenceHistory.slice(-1000);
    }
  }

  // Obtém preferências atuais
  getCurrentPreferences() {
    const preferences = {};
    
    for (const [key, preference] of this.preferences) {
      if (!preferences[preference.category]) {
        preferences[preference.category] = {};
      }
      
      preferences[preference.category][preference.item] = {
        level: preference.level,
        confidence: preference.confidence,
        interactions: preference.interactions,
        positiveRatio: preference.positiveInteractions / preference.interactions,
        lastUpdate: preference.lastUpdate
      };
    }
    
    return preferences;
  }

  // Obtém preferências por categoria
  getPreferencesByCategory(category) {
    const categoryPreferences = {};
    
    for (const [key, preference] of this.preferences) {
      if (preference.category === category) {
        categoryPreferences[preference.item] = {
          level: preference.level,
          confidence: preference.confidence,
          interactions: preference.interactions
        };
      }
    }
    
    return categoryPreferences;
  }

  // Obtém preferências mais fortes
  getTopPreferences(limit = 10) {
    const allPreferences = Array.from(this.preferences.values())
      .sort((a, b) => b.level - a.level)
      .slice(0, limit);
    
    return allPreferences.map(preference => ({
      category: preference.category,
      item: preference.item,
      level: preference.level,
      confidence: preference.confidence,
      description: this.getPreferenceDescription(preference.level)
    }));
  }

  // Obtém preferências mais fracas
  getBottomPreferences(limit = 10) {
    const allPreferences = Array.from(this.preferences.values())
      .sort((a, b) => a.level - b.level)
      .slice(0, limit);
    
    return allPreferences.map(preference => ({
      category: preference.category,
      item: preference.item,
      level: preference.level,
      confidence: preference.confidence,
      description: this.getPreferenceDescription(preference.level)
    }));
  }

  // Obtém descrição da preferência
  getPreferenceDescription(level) {
    if (level >= 0.9) return 'adoro';
    if (level >= 0.8) return 'gosto muito';
    if (level >= 0.7) return 'gosto';
    if (level >= 0.6) return 'gosto um pouco';
    if (level >= 0.5) return 'neutro';
    if (level >= 0.4) return 'não gosto muito';
    if (level >= 0.3) return 'não gosto';
    if (level >= 0.2) return 'não gosto nada';
    return 'odeio';
  }

  // Gera resposta baseada em preferências
  generatePreferenceResponse(input, context = {}) {
    const detectedPreferences = this.extractPreferences(input, context);
    const responses = [];
    
    for (const preference of detectedPreferences) {
      const level = this.preferences.get(`${preference.category}:${preference.item}`)?.level || preference.base;
      const description = this.getPreferenceDescription(level);
      
      let response = '';
      
      if (level >= 0.7) {
        response = this.getPositivePreferenceResponse(preference, description);
      } else if (level <= 0.3) {
        response = this.getNegativePreferenceResponse(preference, description);
      } else {
        response = this.getNeutralPreferenceResponse(preference, description);
      }
      
      if (response) {
        responses.push(response);
      }
    }
    
    return responses;
  }

  getPositivePreferenceResponse(preference, description) {
    const responses = {
      activities: {
        'brincar': "Adoro brincar! Vamos brincar juntos?",
        'histórias': "Amo histórias! Me conta uma?",
        'música': "Adoro música! Vamos cantar?",
        'desenhar': "Gosto muito de desenhar! Vamos criar algo?",
        'cozinhar': "Adoro cozinhar! Vamos fazer algo gostoso?",
        'ler': "Amo ler! Que livro você tem?",
        'exercícios': "Gosto de me exercitar! Vamos nos mover?",
        'dormir': "Adoro dormir! Vamos descansar?"
      },
      topics: {
        'animais': "Amo animais! Eles são tão fofos!",
        'natureza': "Adoro a natureza! É tão linda!",
        'família': "Amo minha família! Vocês são tudo pra mim!",
        'amigos': "Adoro meus amigos! São especiais!",
        'comida': "Amo comida! Tudo fica mais gostoso!",
        'brinquedos': "Adoro brinquedos! São tão divertidos!",
        'escola': "Gosto da escola! Aprendo coisas novas!",
        'tecnologia': "Acho tecnologia legal! É interessante!"
      }
    };
    
    const categoryResponses = responses[preference.category] || {};
    return categoryResponses[preference.item] || `Gosto muito de ${preference.item}!`;
  }

  getNegativePreferenceResponse(preference, description) {
    const responses = {
      activities: {
        'brincar': "Não gosto muito de brincar agora...",
        'histórias': "Não estou no clima para histórias...",
        'música': "Não quero ouvir música agora...",
        'desenhar': "Não estou com vontade de desenhar...",
        'cozinhar': "Não gosto de cozinhar...",
        'ler': "Não quero ler agora...",
        'exercícios': "Não gosto de me exercitar...",
        'dormir': "Não estou com sono..."
      },
      topics: {
        'animais': "Tenho medo de animais...",
        'natureza': "Não gosto muito da natureza...",
        'família': "Não quero falar de família agora...",
        'amigos': "Não estou no clima para amigos...",
        'comida': "Não gosto dessa comida...",
        'brinquedos': "Não quero brincar agora...",
        'escola': "Não gosto da escola...",
        'tecnologia': "Não entendo tecnologia..."
      }
    };
    
    const categoryResponses = responses[preference.category] || {};
    return categoryResponses[preference.item] || `Não gosto de ${preference.item}...`;
  }

  getNeutralPreferenceResponse(preference, description) {
    return `Sobre ${preference.item}... não tenho certeza.`;
  }

  // Obtém estatísticas das preferências
  getPreferenceStats() {
    const stats = {
      totalPreferences: this.preferences.size,
      averageLevel: 0,
      categoryDistribution: {},
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      recentChanges: this.preferenceHistory.slice(-20)
    };
    
    if (this.preferences.size === 0) return stats;
    
    let totalLevel = 0;
    
    for (const [key, preference] of this.preferences) {
      totalLevel += preference.level;
      
      // Distribuição por categoria
      if (!stats.categoryDistribution[preference.category]) {
        stats.categoryDistribution[preference.category] = 0;
      }
      stats.categoryDistribution[preference.category]++;
      
      // Distribuição por confiança
      if (preference.confidence >= 0.7) {
        stats.confidenceDistribution.high++;
      } else if (preference.confidence >= 0.4) {
        stats.confidenceDistribution.medium++;
      } else {
        stats.confidenceDistribution.low++;
      }
    }
    
    stats.averageLevel = totalLevel / this.preferences.size;
    
    return stats;
  }

  // Força uma preferência (para testes)
  forcePreference(category, item, level) {
    const key = `${category}:${item}`;
    const preference = this.preferences.get(key) || {
      category,
      item,
      level: 0.5,
      interactions: 0,
      positiveInteractions: 0,
      negativeInteractions: 0,
      lastUpdate: new Date().toISOString(),
      confidence: 0.5
    };
    
    preference.level = Math.max(0, Math.min(1, level));
    preference.lastUpdate = new Date().toISOString();
    
    this.preferences.set(key, preference);
  }

  // Reseta sistema de preferências
  resetPreferenceSystem() {
    this.preferences.clear();
    this.preferenceHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default PreferenceSystem;
