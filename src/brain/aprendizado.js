// src/brain/aprendizado.js - Sistema de Aprendizado da Nanabot
// Coordena todo o processo de aprendizado e evolução

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AprendizadoSystem {
  constructor() {
    this.learningRate = 0.1;
    this.memoryConsolidation = 0.8;
    this.adaptationSpeed = 0.5;
    this.curiosityLevel = 0.7;
    this.experienceBuffer = [];
    this.learningHistory = [];
    this.skills = new Map();
    this.concepts = new Map();
    this.patterns = new Map();
    this.lastUpdate = new Date().toISOString();
    this.loadLearningState();
  }

  // Carrega estado do aprendizado
  loadLearningState() {
    try {
      const learningPath = path.resolve(__dirname, '../../data/learningState.json');
      if (fs.existsSync(learningPath)) {
        const data = fs.readFileSync(learningPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.learningRate = state.learningRate || 0.1;
        this.memoryConsolidation = state.memoryConsolidation || 0.8;
        this.adaptationSpeed = state.adaptationSpeed || 0.5;
        this.curiosityLevel = state.curiosityLevel || 0.7;
        this.experienceBuffer = state.experienceBuffer || [];
        this.learningHistory = state.learningHistory || [];
        this.skills = new Map(state.skills || []);
        this.concepts = new Map(state.concepts || []);
        this.patterns = new Map(state.patterns || []);
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado do aprendizado:', error);
    }
  }

  // Salva estado do aprendizado
  saveLearningState() {
    try {
      const learningPath = path.resolve(__dirname, '../../data/learningState.json');
      const state = {
        learningRate: this.learningRate,
        memoryConsolidation: this.memoryConsolidation,
        adaptationSpeed: this.adaptationSpeed,
        curiosityLevel: this.curiosityLevel,
        experienceBuffer: this.experienceBuffer.slice(-100), // Últimas 100 experiências
        learningHistory: this.learningHistory.slice(-200), // Últimas 200 entradas
        skills: Array.from(this.skills.entries()),
        concepts: Array.from(this.concepts.entries()),
        patterns: Array.from(this.patterns.entries()),
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(learningPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado do aprendizado:', error);
    }
  }

  // Processa uma experiência de aprendizado
  processExperience(experience, context = {}) {
    const now = new Date();
    const learningResult = {
      timestamp: now.toISOString(),
      experience: experience,
      context: context,
      learningType: this.determineLearningType(experience),
      success: false,
      insights: [],
      skillsLearned: [],
      conceptsLearned: [],
      patternsLearned: []
    };

    try {
      // Analisa a experiência
      const analysis = this.analyzeExperience(experience, context);
      
      // Aplica aprendizado baseado no tipo
      switch (learningResult.learningType) {
        case 'skill':
          learningResult.skillsLearned = this.learnSkill(experience, context, analysis);
          break;
        case 'concept':
          learningResult.conceptsLearned = this.learnConcept(experience, context, analysis);
          break;
        case 'pattern':
          learningResult.patternsLearned = this.learnPattern(experience, context, analysis);
          break;
        case 'social':
          learningResult.insights = this.learnSocialBehavior(experience, context, analysis);
          break;
        case 'emotional':
          learningResult.insights = this.learnEmotionalResponse(experience, context, analysis);
          break;
        default:
          learningResult.insights = this.learnGeneral(experience, context, analysis);
      }

      // Consolida memória
      this.consolidateMemory(learningResult);
      
      // Atualiza taxa de aprendizado
      this.updateLearningRate(learningResult);
      
      // Registra no histórico
      this.recordLearning(learningResult);
      
      learningResult.success = true;
      
    } catch (error) {
      console.error('Erro no processamento de aprendizado:', error);
      learningResult.error = error.message;
    }

    this.lastUpdate = now.toISOString();
    this.saveLearningState();
    
    return learningResult;
  }

  // Determina tipo de aprendizado
  determineLearningType(experience) {
    const input = experience.input || '';
    const context = experience.context || {};
    
    // Aprendizado de habilidade
    if (input.includes('como') || input.includes('fazer') || input.includes('aprender')) {
      return 'skill';
    }
    
    // Aprendizado de conceito
    if (input.includes('o que é') || input.includes('significa') || input.includes('definição')) {
      return 'concept';
    }
    
    // Aprendizado de padrão
    if (context.isRepetitive || context.hasPattern) {
      return 'pattern';
    }
    
    // Aprendizado social
    if (context.userRole && context.userRole !== 'amiguinho') {
      return 'social';
    }
    
    // Aprendizado emocional
    if (context.emotionalIntensity > 0.5) {
      return 'emotional';
    }
    
    return 'general';
  }

  // Analisa experiência
  analyzeExperience(experience, context) {
    const analysis = {
      complexity: this.calculateComplexity(experience),
      novelty: this.calculateNovelty(experience),
      importance: this.calculateImportance(experience, context),
      emotionalWeight: context.emotionalIntensity || 0,
      socialWeight: this.calculateSocialWeight(context),
      learningPotential: 0
    };
    
    // Calcula potencial de aprendizado
    analysis.learningPotential = (
      analysis.complexity * 0.3 +
      analysis.novelty * 0.4 +
      analysis.importance * 0.2 +
      analysis.emotionalWeight * 0.1
    );
    
    return analysis;
  }

  // Calcula complexidade da experiência
  calculateComplexity(experience) {
    const input = experience.input || '';
    const words = input.split(' ').length;
    const sentences = input.split(/[.!?]+/).length;
    const questions = (input.match(/\?/g) || []).length;
    
    return Math.min(1, (words / 20) * 0.4 + (sentences / 5) * 0.3 + (questions / 3) * 0.3);
  }

  // Calcula novidade da experiência
  calculateNovelty(experience) {
    const input = experience.input || '';
    const recentExperiences = this.experienceBuffer.slice(-10);
    
    let similarity = 0;
    for (const recent of recentExperiences) {
      similarity += this.calculateSimilarity(input, recent.input || '');
    }
    
    const averageSimilarity = similarity / Math.max(1, recentExperiences.length);
    return 1 - averageSimilarity; // Maior novidade = menor similaridade
  }

  // Calcula importância da experiência
  calculateImportance(experience, context) {
    let importance = 0.1; // Base
    
    // Importância por contexto social
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      importance += 0.3;
    }
    
    // Importância por intensidade emocional
    if (context.emotionalIntensity > 0.7) {
      importance += 0.2;
    }
    
    // Importância por repetição
    if (context.isRepetitive) {
      importance += 0.1;
    }
    
    // Importância por feedback
    if (context.feedback === 'positive') {
      importance += 0.2;
    } else if (context.feedback === 'negative') {
      importance += 0.1;
    }
    
    return Math.min(1, importance);
  }

  // Calcula peso social
  calculateSocialWeight(context) {
    const socialWeights = {
      'mamãe': 0.9,
      'papai': 0.9,
      'outro de papai': 0.7,
      'amiguinho': 0.3
    };
    
    return socialWeights[context.userRole] || 0.1;
  }

  // Calcula similaridade entre duas entradas
  calculateSimilarity(input1, input2) {
    if (!input1 || !input2) return 0;
    
    const words1 = input1.toLowerCase().split(' ');
    const words2 = input2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / Math.max(1, totalWords);
  }

  // Aprende uma habilidade
  learnSkill(experience, context, analysis) {
    const skillsLearned = [];
    const input = experience.input || '';
    
    // Extrai habilidades da entrada
    const skillKeywords = {
      'comunicação': ['falar', 'conversar', 'explicar', 'contar'],
      'criatividade': ['criar', 'inventar', 'desenhar', 'imaginar'],
      'social': ['brincar', 'compartilhar', 'ajudar', 'cooperar'],
      'emocional': ['calma', 'paciência', 'empatia', 'controle'],
      'cognitivo': ['pensar', 'resolver', 'aprender', 'entender']
    };
    
    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      for (const keyword of keywords) {
        if (input.toLowerCase().includes(keyword)) {
          const skillLevel = this.updateSkill(skill, analysis.learningPotential, context);
          skillsLearned.push({ skill, level: skillLevel, confidence: analysis.learningPotential });
        }
      }
    }
    
    return skillsLearned;
  }

  // Atualiza habilidade
  updateSkill(skillName, learningPotential, context) {
    const currentSkill = this.skills.get(skillName) || {
      name: skillName,
      level: 0.1,
      confidence: 0.1,
      experiences: 0,
      lastUpdate: new Date().toISOString()
    };
    
    // Calcula mudança baseada no potencial de aprendizado
    const change = learningPotential * this.learningRate * (context.socialWeight || 0.5);
    
    // Atualiza nível da habilidade
    currentSkill.level = Math.max(0, Math.min(1, currentSkill.level + change));
    
    // Atualiza confiança
    currentSkill.confidence = Math.min(1, currentSkill.confidence + change * 0.5);
    
    // Atualiza contadores
    currentSkill.experiences++;
    currentSkill.lastUpdate = new Date().toISOString();
    
    this.skills.set(skillName, currentSkill);
    
    return currentSkill.level;
  }

  // Aprende um conceito
  learnConcept(experience, context, analysis) {
    const conceptsLearned = [];
    const input = experience.input || '';
    
    // Extrai conceitos da entrada
    const conceptKeywords = {
      'família': ['mamãe', 'papai', 'família', 'parentes'],
      'amor': ['amor', 'carinho', 'afeição', 'querer'],
      'natureza': ['flor', 'árvore', 'sol', 'lua', 'estrela'],
      'animais': ['gato', 'cachorro', 'passarinho', 'animal'],
      'brincadeira': ['brincar', 'jogar', 'diversão', 'brincadeira'],
      'escola': ['escola', 'aula', 'professor', 'aprender']
    };
    
    for (const [concept, keywords] of Object.entries(conceptKeywords)) {
      for (const keyword of keywords) {
        if (input.toLowerCase().includes(keyword)) {
          const conceptLevel = this.updateConcept(concept, analysis.learningPotential, context);
          conceptsLearned.push({ concept, level: conceptLevel, confidence: analysis.learningPotential });
        }
      }
    }
    
    return conceptsLearned;
  }

  // Atualiza conceito
  updateConcept(conceptName, learningPotential, context) {
    const currentConcept = this.concepts.get(conceptName) || {
      name: conceptName,
      level: 0.1,
      confidence: 0.1,
      experiences: 0,
      associations: [],
      lastUpdate: new Date().toISOString()
    };
    
    // Calcula mudança baseada no potencial de aprendizado
    const change = learningPotential * this.learningRate * (context.socialWeight || 0.5);
    
    // Atualiza nível do conceito
    currentConcept.level = Math.max(0, Math.min(1, currentConcept.level + change));
    
    // Atualiza confiança
    currentConcept.confidence = Math.min(1, currentConcept.confidence + change * 0.5);
    
    // Adiciona associações
    if (context.emotionalIntensity > 0.5) {
      currentConcept.associations.push({
        type: 'emotional',
        value: context.emotionalIntensity,
        timestamp: new Date().toISOString()
      });
    }
    
    // Atualiza contadores
    currentConcept.experiences++;
    currentConcept.lastUpdate = new Date().toISOString();
    
    this.concepts.set(conceptName, currentConcept);
    
    return currentConcept.level;
  }

  // Aprende um padrão
  learnPattern(experience, context, analysis) {
    const patternsLearned = [];
    const input = experience.input || '';
    
    // Identifica padrões na entrada
    const patterns = this.identifyPatterns(input, context);
    
    for (const pattern of patterns) {
      const patternLevel = this.updatePattern(pattern, analysis.learningPotential, context);
      patternsLearned.push({ pattern: pattern.type, level: patternLevel, confidence: analysis.learningPotential });
    }
    
    return patternsLearned;
  }

  // Identifica padrões
  identifyPatterns(input, context) {
    const patterns = [];
    
    // Padrão de pergunta
    if (input.includes('?')) {
      patterns.push({ type: 'question', value: input, confidence: 0.8 });
    }
    
    // Padrão de exclamação
    if (input.includes('!')) {
      patterns.push({ type: 'exclamation', value: input, confidence: 0.7 });
    }
    
    // Padrão emocional
    if (context.emotionalIntensity > 0.5) {
      patterns.push({ type: 'emotional', value: context.emotionalIntensity, confidence: 0.6 });
    }
    
    // Padrão social
    if (context.userRole && context.userRole !== 'amiguinho') {
      patterns.push({ type: 'social', value: context.userRole, confidence: 0.9 });
    }
    
    return patterns;
  }

  // Atualiza padrão
  updatePattern(pattern, learningPotential, context) {
    const patternKey = `${pattern.type}_${pattern.value}`;
    const currentPattern = this.patterns.get(patternKey) || {
      type: pattern.type,
      value: pattern.value,
      frequency: 0,
      confidence: 0.1,
      lastSeen: new Date().toISOString()
    };
    
    // Atualiza frequência
    currentPattern.frequency++;
    
    // Atualiza confiança
    currentPattern.confidence = Math.min(1, currentPattern.confidence + learningPotential * 0.1);
    
    // Atualiza última aparição
    currentPattern.lastSeen = new Date().toISOString();
    
    this.patterns.set(patternKey, currentPattern);
    
    return currentPattern.confidence;
  }

  // Aprende comportamento social
  learnSocialBehavior(experience, context, analysis) {
    const insights = [];
    
    // Aprende sobre relacionamentos
    if (context.userRole) {
      const relationshipInsight = this.learnRelationship(context.userRole, analysis);
      if (relationshipInsight) {
        insights.push(relationshipInsight);
      }
    }
    
    // Aprende sobre comunicação
    const communicationInsight = this.learnCommunication(experience, context, analysis);
    if (communicationInsight) {
      insights.push(communicationInsight);
    }
    
    return insights;
  }

  // Aprende relacionamento
  learnRelationship(userRole, analysis) {
    const relationshipKey = `relationship_${userRole}`;
    const currentRelationship = this.concepts.get(relationshipKey) || {
      name: relationshipKey,
      level: 0.1,
      confidence: 0.1,
      experiences: 0,
      lastUpdate: new Date().toISOString()
    };
    
    // Atualiza nível do relacionamento
    const change = analysis.learningPotential * this.learningRate;
    currentRelationship.level = Math.max(0, Math.min(1, currentRelationship.level + change));
    currentRelationship.confidence = Math.min(1, currentRelationship.confidence + change * 0.5);
    currentRelationship.experiences++;
    currentRelationship.lastUpdate = new Date().toISOString();
    
    this.concepts.set(relationshipKey, currentRelationship);
    
    return {
      type: 'relationship',
      target: userRole,
      level: currentRelationship.level,
      confidence: currentRelationship.confidence
    };
  }

  // Aprende comunicação
  learnCommunication(experience, context, analysis) {
    const input = experience.input || '';
    
    // Aprende sobre tom de voz
    let toneInsight = null;
    if (input.includes('!')) {
      toneInsight = { type: 'tone', value: 'excited', confidence: 0.8 };
    } else if (input.includes('?')) {
      toneInsight = { type: 'tone', value: 'questioning', confidence: 0.7 };
    } else if (input.includes('...')) {
      toneInsight = { type: 'tone', value: 'thoughtful', confidence: 0.6 };
    }
    
    return toneInsight;
  }

  // Aprende resposta emocional
  learnEmotionalResponse(experience, context, analysis) {
    const insights = [];
    
    // Aprende sobre regulação emocional
    if (context.emotionalIntensity > 0.7) {
      insights.push({
        type: 'emotional_regulation',
        value: 'high_intensity',
        confidence: 0.8,
        strategy: 'deep_breathing'
      });
    }
    
    // Aprende sobre expressão emocional
    if (context.emotionalIntensity > 0.5) {
      insights.push({
        type: 'emotional_expression',
        value: 'intense',
        confidence: 0.7,
        strategy: 'verbal_expression'
      });
    }
    
    return insights;
  }

  // Aprende geral
  learnGeneral(experience, context, analysis) {
    const insights = [];
    
    // Aprende sobre curiosidade
    if (analysis.novelty > 0.7) {
      insights.push({
        type: 'curiosity',
        value: 'high_novelty',
        confidence: 0.8,
        strategy: 'explore_more'
      });
    }
    
    // Aprende sobre importância
    if (analysis.importance > 0.7) {
      insights.push({
        type: 'importance',
        value: 'high_importance',
        confidence: 0.9,
        strategy: 'remember_well'
      });
    }
    
    return insights;
  }

  // Consolida memória
  consolidateMemory(learningResult) {
    // Adiciona experiência ao buffer
    this.experienceBuffer.push({
      input: learningResult.experience.input,
      context: learningResult.context,
      timestamp: learningResult.timestamp,
      learningType: learningResult.learningType
    });
    
    // Mantém buffer limitado
    if (this.experienceBuffer.length > 100) {
      this.experienceBuffer = this.experienceBuffer.slice(-100);
    }
    
    // Aplica consolidação de memória
    this.applyMemoryConsolidation(learningResult);
  }

  // Aplica consolidação de memória
  applyMemoryConsolidation(learningResult) {
    const consolidationFactor = this.memoryConsolidation;
    
    // Consolida habilidades
    for (const skill of learningResult.skillsLearned) {
      const currentSkill = this.skills.get(skill.skill);
      if (currentSkill) {
        currentSkill.confidence = Math.min(1, currentSkill.confidence + consolidationFactor * 0.1);
      }
    }
    
    // Consolida conceitos
    for (const concept of learningResult.conceptsLearned) {
      const currentConcept = this.concepts.get(concept.concept);
      if (currentConcept) {
        currentConcept.confidence = Math.min(1, currentConcept.confidence + consolidationFactor * 0.1);
      }
    }
  }

  // Atualiza taxa de aprendizado
  updateLearningRate(learningResult) {
    if (learningResult.success) {
      // Aumenta taxa de aprendizado com sucesso
      this.learningRate = Math.min(0.5, this.learningRate + 0.01);
    } else {
      // Diminui taxa de aprendizado com falha
      this.learningRate = Math.max(0.01, this.learningRate - 0.005);
    }
  }

  // Registra aprendizado
  recordLearning(learningResult) {
    this.learningHistory.push(learningResult);
    
    // Mantém histórico limitado
    if (this.learningHistory.length > 500) {
      this.learningHistory = this.learningHistory.slice(-500);
    }
  }

  // Obtém estatísticas de aprendizado
  getLearningStats() {
    const stats = {
      totalExperiences: this.experienceBuffer.length,
      totalLearning: this.learningHistory.length,
      learningRate: this.learningRate,
      memoryConsolidation: this.memoryConsolidation,
      adaptationSpeed: this.adaptationSpeed,
      curiosityLevel: this.curiosityLevel,
      skillsCount: this.skills.size,
      conceptsCount: this.concepts.size,
      patternsCount: this.patterns.size,
      recentLearning: this.learningHistory.slice(-10)
    };
    
    return stats;
  }

  // Obtém habilidades atuais
  getCurrentSkills() {
    const skills = [];
    for (const [name, skill] of this.skills) {
      skills.push({
        name: skill.name,
        level: skill.level,
        confidence: skill.confidence,
        experiences: skill.experiences,
        lastUpdate: skill.lastUpdate
      });
    }
    
    return skills.sort((a, b) => b.level - a.level);
  }

  // Obtém conceitos atuais
  getCurrentConcepts() {
    const concepts = [];
    for (const [name, concept] of this.concepts) {
      concepts.push({
        name: concept.name,
        level: concept.level,
        confidence: concept.confidence,
        experiences: concept.experiences,
        associations: concept.associations,
        lastUpdate: concept.lastUpdate
      });
    }
    
    return concepts.sort((a, b) => b.level - a.level);
  }

  // Obtém padrões atuais
  getCurrentPatterns() {
    const patterns = [];
    for (const [key, pattern] of this.patterns) {
      patterns.push({
        type: pattern.type,
        value: pattern.value,
        frequency: pattern.frequency,
        confidence: pattern.confidence,
        lastSeen: pattern.lastSeen
      });
    }
    
    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  // Reseta sistema de aprendizado
  resetLearningSystem() {
    this.learningRate = 0.1;
    this.memoryConsolidation = 0.8;
    this.adaptationSpeed = 0.5;
    this.curiosityLevel = 0.7;
    this.experienceBuffer = [];
    this.learningHistory = [];
    this.skills.clear();
    this.concepts.clear();
    this.patterns.clear();
    this.lastUpdate = new Date().toISOString();
  }
}

export default AprendizadoSystem;
