// src/brain/patternRecog.js - Sistema de Reconhecimento de Padrões da Nanabot
// Identifica padrões, sequências e comportamentos recorrentes

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PatternRecognitionSystem {
  constructor() {
    this.patterns = new Map();
    this.sequences = new Map();
    this.behaviors = new Map();
    this.contexts = new Map();
    this.patternHistory = [];
    this.sequenceBuffer = [];
    this.behaviorBuffer = [];
    this.lastUpdate = new Date().toISOString();
    this.loadPatternState();
  }

  // Carrega estado dos padrões
  loadPatternState() {
    try {
      const patternPath = path.resolve(__dirname, '../../data/patternState.json');
      if (fs.existsSync(patternPath)) {
        const data = fs.readFileSync(patternPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.patterns = new Map(state.patterns || []);
        this.sequences = new Map(state.sequences || []);
        this.behaviors = new Map(state.behaviors || []);
        this.contexts = new Map(state.contexts || []);
        this.patternHistory = state.patternHistory || [];
        this.sequenceBuffer = state.sequenceBuffer || [];
        this.behaviorBuffer = state.behaviorBuffer || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado dos padrões:', error);
    }
  }

  // Salva estado dos padrões
  savePatternState() {
    try {
      const patternPath = path.resolve(__dirname, '../../data/patternState.json');
      const state = {
        patterns: Array.from(this.patterns.entries()),
        sequences: Array.from(this.sequences.entries()),
        behaviors: Array.from(this.behaviors.entries()),
        contexts: Array.from(this.contexts.entries()),
        patternHistory: this.patternHistory.slice(-200), // Últimas 200 entradas
        sequenceBuffer: this.sequenceBuffer.slice(-100), // Últimas 100 sequências
        behaviorBuffer: this.behaviorBuffer.slice(-100), // Últimas 100 comportamentos
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(patternPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado dos padrões:', error);
    }
  }

  // Processa entrada e identifica padrões
  processInput(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Adiciona à sequência atual
    this.addToSequence(input, context, timestamp);
    
    // Identifica padrões na entrada
    const detectedPatterns = this.identifyPatterns(input, context);
    
    // Identifica comportamentos
    const detectedBehaviors = this.identifyBehaviors(input, context);
    
    // Identifica contextos
    const detectedContexts = this.identifyContexts(input, context);
    
    // Atualiza padrões existentes
    this.updatePatterns(detectedPatterns, context, timestamp);
    
    // Atualiza comportamentos
    this.updateBehaviors(detectedBehaviors, context, timestamp);
    
    // Atualiza contextos
    this.updateContexts(detectedContexts, context, timestamp);
    
    // Registra no histórico
    this.recordPatternDetection(detectedPatterns, detectedBehaviors, detectedContexts, timestamp);
    
    this.lastUpdate = timestamp;
    this.savePatternState();
    
    return {
      patterns: detectedPatterns,
      behaviors: detectedBehaviors,
      contexts: detectedContexts,
      sequences: this.getCurrentSequences(),
      predictions: this.generatePredictions(input, context)
    };
  }

  // Adiciona entrada à sequência
  addToSequence(input, context, timestamp) {
    const sequenceEntry = {
      input,
      context,
      timestamp,
      type: this.classifyInputType(input, context)
    };
    
    this.sequenceBuffer.push(sequenceEntry);
    
    // Mantém buffer limitado
    if (this.sequenceBuffer.length > 100) {
      this.sequenceBuffer = this.sequenceBuffer.slice(-100);
    }
    
    // Verifica sequências
    this.checkSequences();
  }

  // Classifica tipo de entrada
  classifyInputType(input, context) {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('?')) return 'question';
    if (lowerInput.includes('!')) return 'exclamation';
    if (lowerInput.includes('mamãe') || lowerInput.includes('papai')) return 'parent_interaction';
    if (lowerInput.includes('brincar') || lowerInput.includes('jogar')) return 'play_request';
    if (lowerInput.includes('história') || lowerInput.includes('conto')) return 'story_request';
    if (lowerInput.includes('amor') || lowerInput.includes('carinho')) return 'affection';
    if (lowerInput.includes('medo') || lowerInput.includes('assustado')) return 'fear';
    if (lowerInput.includes('triste') || lowerInput.includes('chorando')) return 'sadness';
    if (lowerInput.includes('feliz') || lowerInput.includes('alegre')) return 'happiness';
    
    return 'general';
  }

  // Verifica sequências
  checkSequences() {
    if (this.sequenceBuffer.length < 3) return;
    
    const recent = this.sequenceBuffer.slice(-5); // Últimas 5 entradas
    const sequenceTypes = recent.map(entry => entry.type);
    
    // Verifica padrões de sequência
    this.checkSequencePattern(sequenceTypes, recent);
  }

  // Verifica padrão de sequência
  checkSequencePattern(types, entries) {
    const sequenceKey = types.join('->');
    
    if (!this.sequences.has(sequenceKey)) {
      this.sequences.set(sequenceKey, {
        pattern: sequenceKey,
        frequency: 0,
        confidence: 0.1,
        lastSeen: new Date().toISOString(),
        contexts: new Set(),
        behaviors: new Set()
      });
    }
    
    const sequence = this.sequences.get(sequenceKey);
    sequence.frequency++;
    sequence.confidence = Math.min(1, sequence.confidence + 0.1);
    sequence.lastSeen = new Date().toISOString();
    
    // Adiciona contextos e comportamentos
    for (const entry of entries) {
      if (entry.context.userRole) {
        sequence.contexts.add(entry.context.userRole);
      }
      if (entry.context.emotionalIntensity > 0.5) {
        sequence.behaviors.add('emotional');
      }
    }
  }

  // Identifica padrões na entrada
  identifyPatterns(input, context) {
    const patterns = [];
    
    // Padrão de pergunta
    if (input.includes('?')) {
      patterns.push({
        type: 'question',
        pattern: 'question_mark',
        confidence: 0.9,
        context: context
      });
    }
    
    // Padrão de exclamação
    if (input.includes('!')) {
      patterns.push({
        type: 'exclamation',
        pattern: 'exclamation_mark',
        confidence: 0.8,
        context: context
      });
    }
    
    // Padrão emocional
    if (context.emotionalIntensity > 0.5) {
      patterns.push({
        type: 'emotional',
        pattern: 'high_emotional_intensity',
        confidence: context.emotionalIntensity,
        context: context
      });
    }
    
    // Padrão social
    if (context.userRole && context.userRole !== 'amiguinho') {
      patterns.push({
        type: 'social',
        pattern: `interaction_with_${context.userRole}`,
        confidence: 0.8,
        context: context
      });
    }
    
    // Padrão de repetição
    if (this.isRepetitive(input)) {
      patterns.push({
        type: 'repetition',
        pattern: 'repetitive_input',
        confidence: 0.7,
        context: context
      });
    }
    
    // Padrão de tempo
    if (this.isTimeBased(context)) {
      patterns.push({
        type: 'temporal',
        pattern: 'time_based_interaction',
        confidence: 0.6,
        context: context
      });
    }
    
    return patterns;
  }

  // Verifica se entrada é repetitiva
  isRepetitive(input) {
    if (this.sequenceBuffer.length < 2) return false;
    
    const recent = this.sequenceBuffer.slice(-3);
    const similarCount = recent.filter(entry => 
      this.calculateSimilarity(input, entry.input) > 0.7
    ).length;
    
    return similarCount >= 2;
  }

  // Verifica se é baseado em tempo
  isTimeBased(context) {
    const now = new Date();
    const hour = now.getHours();
    
    // Padrões de tempo
    if (hour >= 6 && hour < 12) return true; // Manhã
    if (hour >= 12 && hour < 18) return true; // Tarde
    if (hour >= 18 && hour < 22) return true; // Noite
    if (hour >= 22 || hour < 6) return true; // Madrugada
    
    return false;
  }

  // Identifica comportamentos
  identifyBehaviors(input, context) {
    const behaviors = [];
    const lowerInput = input.toLowerCase();
    
    // Comportamento de busca de atenção
    if (lowerInput.includes('olha') || lowerInput.includes('veja') || lowerInput.includes('presta atenção')) {
      behaviors.push({
        type: 'attention_seeking',
        confidence: 0.8,
        context: context
      });
    }
    
    // Comportamento de busca de conforto
    if (lowerInput.includes('colo') || lowerInput.includes('abraço') || lowerInput.includes('conforto')) {
      behaviors.push({
        type: 'comfort_seeking',
        confidence: 0.9,
        context: context
      });
    }
    
    // Comportamento de brincadeira
    if (lowerInput.includes('brincar') || lowerInput.includes('jogar') || lowerInput.includes('diversão')) {
      behaviors.push({
        type: 'playful',
        confidence: 0.8,
        context: context
      });
    }
    
    // Comportamento de aprendizado
    if (lowerInput.includes('como') || lowerInput.includes('por que') || lowerInput.includes('o que')) {
      behaviors.push({
        type: 'learning',
        confidence: 0.7,
        context: context
      });
    }
    
    // Comportamento de expressão emocional
    if (context.emotionalIntensity > 0.6) {
      behaviors.push({
        type: 'emotional_expression',
        confidence: context.emotionalIntensity,
        context: context
      });
    }
    
    return behaviors;
  }

  // Identifica contextos
  identifyContexts(input, context) {
    const contexts = [];
    
    // Contexto de primeira interação
    if (context.isFirstInteraction) {
      contexts.push({
        type: 'first_interaction',
        confidence: 0.9,
        context: context
      });
    }
    
    // Contexto de emergência
    if (context.isEmergency) {
      contexts.push({
        type: 'emergency',
        confidence: 0.9,
        context: context
      });
    }
    
    // Contexto de rotina
    if (this.isRoutine(context)) {
      contexts.push({
        type: 'routine',
        confidence: 0.7,
        context: context
      });
    }
    
    // Contexto de aprendizado
    if (context.isLearning) {
      contexts.push({
        type: 'learning',
        confidence: 0.8,
        context: context
      });
    }
    
    return contexts;
  }

  // Verifica se é rotina
  isRoutine(context) {
    if (!context.userRole) return false;
    
    const now = new Date();
    const hour = now.getHours();
    
    // Rotinas baseadas em horário e usuário
    if (context.userRole === 'mamãe' && hour >= 7 && hour <= 9) return true; // Manhã com mamãe
    if (context.userRole === 'papai' && hour >= 18 && hour <= 20) return true; // Tarde com papai
    
    return false;
  }

  // Atualiza padrões
  updatePatterns(detectedPatterns, context, timestamp) {
    for (const pattern of detectedPatterns) {
      const patternKey = `${pattern.type}_${pattern.pattern}`;
      
      if (!this.patterns.has(patternKey)) {
        this.patterns.set(patternKey, {
          type: pattern.type,
          pattern: pattern.pattern,
          frequency: 0,
          confidence: 0.1,
          lastSeen: timestamp,
          contexts: new Set(),
          behaviors: new Set()
        });
      }
      
      const existingPattern = this.patterns.get(patternKey);
      existingPattern.frequency++;
      existingPattern.confidence = Math.min(1, existingPattern.confidence + 0.1);
      existingPattern.lastSeen = timestamp;
      
      if (context.userRole) {
        existingPattern.contexts.add(context.userRole);
      }
      if (context.emotionalIntensity > 0.5) {
        existingPattern.behaviors.add('emotional');
      }
    }
  }

  // Atualiza comportamentos
  updateBehaviors(detectedBehaviors, context, timestamp) {
    for (const behavior of detectedBehaviors) {
      const behaviorKey = behavior.type;
      
      if (!this.behaviors.has(behaviorKey)) {
        this.behaviors.set(behaviorKey, {
          type: behavior.type,
          frequency: 0,
          confidence: 0.1,
          lastSeen: timestamp,
          contexts: new Set(),
          triggers: new Set()
        });
      }
      
      const existingBehavior = this.behaviors.get(behaviorKey);
      existingBehavior.frequency++;
      existingBehavior.confidence = Math.min(1, existingBehavior.confidence + 0.1);
      existingBehavior.lastSeen = timestamp;
      
      if (context.userRole) {
        existingBehavior.contexts.add(context.userRole);
      }
      if (context.emotionalIntensity > 0.5) {
        existingBehavior.triggers.add('emotional');
      }
    }
  }

  // Atualiza contextos
  updateContexts(detectedContexts, context, timestamp) {
    for (const ctx of detectedContexts) {
      const contextKey = ctx.type;
      
      if (!this.contexts.has(contextKey)) {
        this.contexts.set(contextKey, {
          type: ctx.type,
          frequency: 0,
          confidence: 0.1,
          lastSeen: timestamp,
          patterns: new Set(),
          behaviors: new Set()
        });
      }
      
      const existingContext = this.contexts.get(contextKey);
      existingContext.frequency++;
      existingContext.confidence = Math.min(1, existingContext.confidence + 0.1);
      existingContext.lastSeen = timestamp;
      
      if (context.emotionalIntensity > 0.5) {
        existingContext.patterns.add('emotional');
      }
      if (context.userRole) {
        existingContext.behaviors.add(context.userRole);
      }
    }
  }

  // Registra detecção de padrão
  recordPatternDetection(patterns, behaviors, contexts, timestamp) {
    const record = {
      timestamp,
      patterns: patterns.length,
      behaviors: behaviors.length,
      contexts: contexts.length,
      totalPatterns: this.patterns.size,
      totalBehaviors: this.behaviors.size,
      totalContexts: this.contexts.size
    };
    
    this.patternHistory.push(record);
    
    // Mantém histórico limitado
    if (this.patternHistory.length > 500) {
      this.patternHistory = this.patternHistory.slice(-500);
    }
  }

  // Gera previsões
  generatePredictions(input, context) {
    const predictions = [];
    
    // Previsão baseada em sequências
    const sequencePredictions = this.predictFromSequences(input, context);
    predictions.push(...sequencePredictions);
    
    // Previsão baseada em padrões
    const patternPredictions = this.predictFromPatterns(input, context);
    predictions.push(...patternPredictions);
    
    // Previsão baseada em comportamentos
    const behaviorPredictions = this.predictFromBehaviors(input, context);
    predictions.push(...behaviorPredictions);
    
    return predictions;
  }

  // Previsão baseada em sequências
  predictFromSequences(input, context) {
    const predictions = [];
    
    if (this.sequenceBuffer.length < 2) return predictions;
    
    const recent = this.sequenceBuffer.slice(-3);
    const recentTypes = recent.map(entry => entry.type);
    
    // Procura sequências similares
    for (const [sequenceKey, sequence] of this.sequences) {
      const sequenceTypes = sequenceKey.split('->');
      const similarity = this.calculateSequenceSimilarity(recentTypes, sequenceTypes);
      
      if (similarity > 0.6) {
        predictions.push({
          type: 'sequence',
          prediction: sequenceTypes[sequenceTypes.length - 1],
          confidence: similarity * sequence.confidence,
          source: 'sequence_analysis'
        });
      }
    }
    
    return predictions;
  }

  // Previsão baseada em padrões
  predictFromPatterns(input, context) {
    const predictions = [];
    
    // Padrão de pergunta -> resposta
    if (input.includes('?')) {
      predictions.push({
        type: 'pattern',
        prediction: 'answer_expected',
        confidence: 0.8,
        source: 'question_pattern'
      });
    }
    
    // Padrão emocional -> conforto
    if (context.emotionalIntensity > 0.7) {
      predictions.push({
        type: 'pattern',
        prediction: 'comfort_needed',
        confidence: 0.7,
        source: 'emotional_pattern'
      });
    }
    
    return predictions;
  }

  // Previsão baseada em comportamentos
  predictFromBehaviors(input, context) {
    const predictions = [];
    
    // Comportamento de busca de atenção -> resposta
    if (input.includes('olha') || input.includes('veja')) {
      predictions.push({
        type: 'behavior',
        prediction: 'attention_response',
        confidence: 0.8,
        source: 'attention_seeking_behavior'
      });
    }
    
    // Comportamento de brincadeira -> engajamento
    if (input.includes('brincar') || input.includes('jogar')) {
      predictions.push({
        type: 'behavior',
        prediction: 'play_engagement',
        confidence: 0.7,
        source: 'playful_behavior'
      });
    }
    
    return predictions;
  }

  // Calcula similaridade entre sequências
  calculateSequenceSimilarity(seq1, seq2) {
    if (seq1.length !== seq2.length) return 0;
    
    let matches = 0;
    for (let i = 0; i < seq1.length; i++) {
      if (seq1[i] === seq2[i]) {
        matches++;
      }
    }
    
    return matches / seq1.length;
  }

  // Calcula similaridade entre strings
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / Math.max(1, totalWords);
  }

  // Obtém sequências atuais
  getCurrentSequences() {
    return this.sequenceBuffer.slice(-10); // Últimas 10 entradas
  }

  // Obtém estatísticas dos padrões
  getPatternStats() {
    const stats = {
      totalPatterns: this.patterns.size,
      totalSequences: this.sequences.size,
      totalBehaviors: this.behaviors.size,
      totalContexts: this.contexts.size,
      recentDetections: this.patternHistory.slice(-20),
      mostFrequentPatterns: [],
      mostFrequentBehaviors: [],
      mostFrequentContexts: []
    };
    
    // Padrões mais frequentes
    const patterns = Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
    stats.mostFrequentPatterns = patterns;
    
    // Comportamentos mais frequentes
    const behaviors = Array.from(this.behaviors.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
    stats.mostFrequentBehaviors = behaviors;
    
    // Contextos mais frequentes
    const contexts = Array.from(this.contexts.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
    stats.mostFrequentContexts = contexts;
    
    return stats;
  }

  // Reseta sistema de padrões
  resetPatternSystem() {
    this.patterns.clear();
    this.sequences.clear();
    this.behaviors.clear();
    this.contexts.clear();
    this.patternHistory = [];
    this.sequenceBuffer = [];
    this.behaviorBuffer = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default PatternRecognitionSystem;
