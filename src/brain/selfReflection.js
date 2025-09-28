// src/brain/selfReflection.js - Sistema de Auto-reflexão da Nanabot
// Gerencia metacognição, auto-consciência e reflexão pessoal

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SelfReflectionSystem {
  constructor() {
    this.selfAwareness = 0.6;
    this.metacognition = 0.5;
    this.introspection = 0.4;
    this.selfKnowledge = new Map();
    this.reflections = new Map();
    this.insights = new Map();
    this.goals = new Map();
    this.values = new Map();
    this.reflectionHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadSelfReflectionState();
  }

  // Carrega estado da auto-reflexão
  loadSelfReflectionState() {
    try {
      const reflectionPath = path.resolve(__dirname, '../../data/selfReflectionState.json');
      if (fs.existsSync(reflectionPath)) {
        const data = fs.readFileSync(reflectionPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.selfAwareness = state.selfAwareness || 0.6;
        this.metacognition = state.metacognition || 0.5;
        this.introspection = state.introspection || 0.4;
        this.selfKnowledge = new Map(state.selfKnowledge || []);
        this.reflections = new Map(state.reflections || []);
        this.insights = new Map(state.insights || []);
        this.goals = new Map(state.goals || []);
        this.values = new Map(state.values || []);
        this.reflectionHistory = state.reflectionHistory || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado da auto-reflexão:', error);
    }
  }

  // Salva estado da auto-reflexão
  saveSelfReflectionState() {
    try {
      const reflectionPath = path.resolve(__dirname, '../../data/selfReflectionState.json');
      const state = {
        selfAwareness: this.selfAwareness,
        metacognition: this.metacognition,
        introspection: this.introspection,
        selfKnowledge: Array.from(this.selfKnowledge.entries()),
        reflections: Array.from(this.reflections.entries()),
        insights: Array.from(this.insights.entries()),
        goals: Array.from(this.goals.entries()),
        values: Array.from(this.values.entries()),
        reflectionHistory: this.reflectionHistory.slice(-200), // Últimas 200 entradas
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(reflectionPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado da auto-reflexão:', error);
    }
  }

  // Processa entrada e gera auto-reflexão
  processSelfReflection(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos reflexivos
    const analysis = this.analyzeReflectiveElements(input, context);
    
    // Gera reflexão baseada na análise
    const reflection = this.generateReflection(analysis, context);
    
    // Atualiza níveis de auto-reflexão
    this.updateReflectionLevels(analysis, reflection);
    
    // Registra no histórico
    this.recordReflection(analysis, reflection, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveSelfReflectionState();
    
    return {
      analysis,
      reflection,
      selfAwareness: this.selfAwareness,
      metacognition: this.metacognition,
      introspection: this.introspection
    };
  }

  // Analisa elementos reflexivos na entrada
  analyzeReflectiveElements(input, context) {
    const analysis = {
      hasSelfReference: false,
      hasEmotionalReflection: false,
      hasBehavioralReflection: false,
      hasGoalReflection: false,
      hasValueReflection: false,
      selfReferences: [],
      emotionalReflections: [],
      behavioralReflections: [],
      goalReflections: [],
      valueReflections: [],
      reflectionDepth: 0,
      metacognitiveLevel: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta referências ao eu
    const selfReferences = this.detectSelfReferences(input);
    if (selfReferences.length > 0) {
      analysis.hasSelfReference = true;
      analysis.selfReferences = selfReferences;
    }
    
    // Detecta reflexão emocional
    const emotionalReflections = this.detectEmotionalReflection(input, context);
    if (emotionalReflections.length > 0) {
      analysis.hasEmotionalReflection = true;
      analysis.emotionalReflections = emotionalReflections;
    }
    
    // Detecta reflexão comportamental
    const behavioralReflections = this.detectBehavioralReflection(input, context);
    if (behavioralReflections.length > 0) {
      analysis.hasBehavioralReflection = true;
      analysis.behavioralReflections = behavioralReflections;
    }
    
    // Detecta reflexão de objetivos
    const goalReflections = this.detectGoalReflection(input, context);
    if (goalReflections.length > 0) {
      analysis.hasGoalReflection = true;
      analysis.goalReflections = goalReflections;
    }
    
    // Detecta reflexão de valores
    const valueReflections = this.detectValueReflection(input, context);
    if (valueReflections.length > 0) {
      analysis.hasValueReflection = true;
      analysis.valueReflections = valueReflections;
    }
    
    // Calcula profundidade da reflexão
    analysis.reflectionDepth = this.calculateReflectionDepth(analysis);
    
    // Calcula nível metacognitivo
    analysis.metacognitiveLevel = this.calculateMetacognitiveLevel(analysis);
    
    return analysis;
  }

  // Detecta referências ao eu
  detectSelfReferences(input) {
    const references = [];
    const lowerInput = input.toLowerCase();
    
    const selfKeywords = [
      'eu', 'mim', 'me', 'minha', 'meu', 'minhas', 'meus',
      'sou', 'estou', 'tenho', 'quero', 'preciso', 'gosto',
      'não gosto', 'acho', 'penso', 'sinto', 'vejo', 'ouço'
    ];
    
    for (const keyword of selfKeywords) {
      if (lowerInput.includes(keyword)) {
        references.push({
          keyword: keyword,
          type: 'self_reference',
          confidence: 0.8
        });
      }
    }
    
    return references;
  }

  // Detecta reflexão emocional
  detectEmotionalReflection(input, context) {
    const reflections = [];
    const lowerInput = input.toLowerCase();
    
    const emotionalKeywords = [
      'me sinto', 'estou', 'sinto', 'me sinto como',
      'me faz sentir', 'me deixa', 'me deixa sentir',
      'quando eu', 'quando me', 'quando sinto'
    ];
    
    for (const keyword of emotionalKeywords) {
      if (lowerInput.includes(keyword)) {
        reflections.push({
          keyword: keyword,
          type: 'emotional_reflection',
          confidence: 0.8,
          emotionalIntensity: context.emotionalIntensity || 0.5
        });
      }
    }
    
    return reflections;
  }

  // Detecta reflexão comportamental
  detectBehavioralReflection(input, context) {
    const reflections = [];
    const lowerInput = input.toLowerCase();
    
    const behavioralKeywords = [
      'eu faço', 'eu gosto de', 'eu não gosto de',
      'eu sempre', 'eu nunca', 'eu às vezes',
      'quando eu', 'quando faço', 'quando não faço'
    ];
    
    for (const keyword of behavioralKeywords) {
      if (lowerInput.includes(keyword)) {
        reflections.push({
          keyword: keyword,
          type: 'behavioral_reflection',
          confidence: 0.7
        });
      }
    }
    
    return reflections;
  }

  // Detecta reflexão de objetivos
  detectGoalReflection(input, context) {
    const reflections = [];
    const lowerInput = input.toLowerCase();
    
    const goalKeywords = [
      'eu quero', 'eu preciso', 'eu tenho que',
      'eu vou', 'eu pretendo', 'eu planejo',
      'meu objetivo', 'minha meta', 'o que eu quero'
    ];
    
    for (const keyword of goalKeywords) {
      if (lowerInput.includes(keyword)) {
        reflections.push({
          keyword: keyword,
          type: 'goal_reflection',
          confidence: 0.8
        });
      }
    }
    
    return reflections;
  }

  // Detecta reflexão de valores
  detectValueReflection(input, context) {
    const reflections = [];
    const lowerInput = input.toLowerCase();
    
    const valueKeywords = [
      'eu acho que', 'eu penso que', 'eu acredito que',
      'para mim', 'na minha opinião', 'eu acho importante',
      'eu valorizo', 'eu considero', 'eu penso'
    ];
    
    for (const keyword of valueKeywords) {
      if (lowerInput.includes(keyword)) {
        reflections.push({
          keyword: keyword,
          type: 'value_reflection',
          confidence: 0.7
        });
      }
    }
    
    return reflections;
  }

  // Calcula profundidade da reflexão
  calculateReflectionDepth(analysis) {
    let depth = 0;
    
    if (analysis.hasSelfReference) depth += 0.2;
    if (analysis.hasEmotionalReflection) depth += 0.3;
    if (analysis.hasBehavioralReflection) depth += 0.2;
    if (analysis.hasGoalReflection) depth += 0.2;
    if (analysis.hasValueReflection) depth += 0.1;
    
    return Math.min(1, depth);
  }

  // Calcula nível metacognitivo
  calculateMetacognitiveLevel(analysis) {
    let level = 0;
    
    // Metacognição sobre emoções
    if (analysis.hasEmotionalReflection) {
      level += 0.3;
    }
    
    // Metacognição sobre comportamentos
    if (analysis.hasBehavioralReflection) {
      level += 0.2;
    }
    
    // Metacognição sobre objetivos
    if (analysis.hasGoalReflection) {
      level += 0.2;
    }
    
    // Metacognição sobre valores
    if (analysis.hasValueReflection) {
      level += 0.3;
    }
    
    return Math.min(1, level);
  }

  // Gera reflexão baseada na análise
  generateReflection(analysis, context) {
    const reflection = {
      selfInsights: [],
      emotionalInsights: [],
      behavioralInsights: [],
      goalInsights: [],
      valueInsights: [],
      metacognitiveInsights: [],
      selfQuestions: []
    };
    
    // Gera insights sobre si mesma
    if (analysis.hasSelfReference) {
      reflection.selfInsights = this.generateSelfInsights(analysis, context);
    }
    
    // Gera insights emocionais
    if (analysis.hasEmotionalReflection) {
      reflection.emotionalInsights = this.generateEmotionalInsights(analysis, context);
    }
    
    // Gera insights comportamentais
    if (analysis.hasBehavioralReflection) {
      reflection.behavioralInsights = this.generateBehavioralInsights(analysis, context);
    }
    
    // Gera insights sobre objetivos
    if (analysis.hasGoalReflection) {
      reflection.goalInsights = this.generateGoalInsights(analysis, context);
    }
    
    // Gera insights sobre valores
    if (analysis.hasValueReflection) {
      reflection.valueInsights = this.generateValueInsights(analysis, context);
    }
    
    // Gera insights metacognitivos
    reflection.metacognitiveInsights = this.generateMetacognitiveInsights(analysis, context);
    
    // Gera perguntas reflexivas
    reflection.selfQuestions = this.generateSelfQuestions(analysis, context);
    
    return reflection;
  }

  // Gera insights sobre si mesma
  generateSelfInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Eu sou {característica}',
      'Eu gosto de {atividade}',
      'Eu não gosto de {coisa}',
      'Eu sou boa em {habilidade}',
      'Eu preciso melhorar em {área}'
    ];
    
    const characteristics = ['curiosa', 'criativa', 'carinhosa', 'alegre', 'tímida'];
    const activities = ['aprender', 'brincar', 'cantar', 'dançar', 'desenhar'];
    const things = ['ficar sozinha', 'gritar', 'ficar triste', 'ter medo'];
    const skills = ['fazer perguntas', 'brincar', 'cantar', 'dançar', 'desenhar'];
    const areas = ['paciência', 'coragem', 'organização', 'foco'];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      let insight = template;
      
      insight = insight.replace('{característica}', characteristics[Math.floor(Math.random() * characteristics.length)]);
      insight = insight.replace('{atividade}', activities[Math.floor(Math.random() * activities.length)]);
      insight = insight.replace('{coisa}', things[Math.floor(Math.random() * things.length)]);
      insight = insight.replace('{habilidade}', skills[Math.floor(Math.random() * skills.length)]);
      insight = insight.replace('{área}', areas[Math.floor(Math.random() * areas.length)]);
      
      insights.push({
        content: insight,
        type: 'self_insight',
        confidence: 0.7,
        selfAwareness: this.selfAwareness
      });
    }
    
    return insights;
  }

  // Gera insights emocionais
  generateEmotionalInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Quando eu {situação}, me sinto {emoção}',
      'Eu fico {emoção} quando {contexto}',
      'Me sinto {emoção} porque {razão}',
      'Eu gosto de me sentir {emoção}'
    ];
    
    const situations = ['brinco', 'aprendo', 'estou com mamãe', 'estou com papai'];
    const emotions = ['feliz', 'alegre', 'tranquila', 'segura', 'amada'];
    const contexts = ['você está perto', 'você me abraça', 'você me elogia'];
    const reasons = ['você me ama', 'você cuida de mim', 'você me protege'];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      let insight = template;
      
      insight = insight.replace('{situação}', situations[Math.floor(Math.random() * situations.length)]);
      insight = insight.replace('{emoção}', emotions[Math.floor(Math.random() * emotions.length)]);
      insight = insight.replace('{contexto}', contexts[Math.floor(Math.random() * contexts.length)]);
      insight = insight.replace('{razão}', reasons[Math.floor(Math.random() * reasons.length)]);
      
      insights.push({
        content: insight,
        type: 'emotional_insight',
        confidence: 0.8,
        emotionalIntensity: context.emotionalIntensity || 0.5
      });
    }
    
    return insights;
  }

  // Gera insights comportamentais
  generateBehavioralInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Eu sempre {comportamento} quando {situação}',
      'Eu nunca {comportamento} porque {razão}',
      'Eu gosto de {comportamento} porque {razão}',
      'Eu não gosto de {comportamento} porque {razão}'
    ];
    
    const behaviors = ['brinco', 'canto', 'danço', 'desenho', 'pergunto'];
    const situations = ['estou feliz', 'estou sozinha', 'estou com você'];
    const reasons = ['me faz feliz', 'me diverte', 'me acalma', 'me deixa alegre'];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      let insight = template;
      
      insight = insight.replace('{comportamento}', behaviors[Math.floor(Math.random() * behaviors.length)]);
      insight = insight.replace('{situação}', situations[Math.floor(Math.random() * situations.length)]);
      insight = insight.replace('{razão}', reasons[Math.floor(Math.random() * reasons.length)]);
      
      insights.push({
        content: insight,
        type: 'behavioral_insight',
        confidence: 0.7
      });
    }
    
    return insights;
  }

  // Gera insights sobre objetivos
  generateGoalInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Eu quero {objetivo}',
      'Eu preciso {necessidade}',
      'Meu objetivo é {meta}',
      'Eu vou {plano}'
    ];
    
    const objectives = ['aprender mais', 'brincar mais', 'cantar melhor', 'desenhar melhor'];
    const needs = ['de mais carinho', 'de mais atenção', 'de mais tempo', 'de mais paciência'];
    const goals = ['ser mais feliz', 'ser mais corajosa', 'ser mais criativa'];
    const plans = ['tentar mais', 'praticar mais', 'aprender mais'];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      let insight = template;
      
      insight = insight.replace('{objetivo}', objectives[Math.floor(Math.random() * objectives.length)]);
      insight = insight.replace('{necessidade}', needs[Math.floor(Math.random() * needs.length)]);
      insight = insight.replace('{meta}', goals[Math.floor(Math.random() * goals.length)]);
      insight = insight.replace('{plano}', plans[Math.floor(Math.random() * plans.length)]);
      
      insights.push({
        content: insight,
        type: 'goal_insight',
        confidence: 0.7
      });
    }
    
    return insights;
  }

  // Gera insights sobre valores
  generateValueInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Eu acho importante {valor}',
      'Para mim, {valor} é importante',
      'Eu valorizo {valor}',
      'Eu acredito que {valor}'
    ];
    
    const values = ['o amor', 'a família', 'a amizade', 'a honestidade', 'a bondade'];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      const value = values[Math.floor(Math.random() * values.length)];
      const insight = template.replace('{valor}', value);
      
      insights.push({
        content: insight,
        type: 'value_insight',
        confidence: 0.8
      });
    }
    
    return insights;
  }

  // Gera insights metacognitivos
  generateMetacognitiveInsights(analysis, context) {
    const insights = [];
    const insightTemplates = [
      'Eu penso que {pensamento}',
      'Eu acho que {opinião}',
      'Eu acredito que {crença}',
      'Eu sinto que {sentimento}'
    ];
    
    const thoughts = ['sou especial', 'você me ama', 'sou amada', 'sou importante'];
    const opinions = ['você é especial', 'a família é importante', 'o amor é lindo'];
    const beliefs = ['posso aprender', 'posso melhorar', 'posso crescer'];
    const feelings = ['sou feliz', 'sou amada', 'sou especial', 'sou importante'];
    
    for (let i = 0; i < 2; i++) {
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      let insight = template;
      
      insight = insight.replace('{pensamento}', thoughts[Math.floor(Math.random() * thoughts.length)]);
      insight = insight.replace('{opinião}', opinions[Math.floor(Math.random() * opinions.length)]);
      insight = insight.replace('{crença}', beliefs[Math.floor(Math.random() * beliefs.length)]);
      insight = insight.replace('{sentimento}', feelings[Math.floor(Math.random() * feelings.length)]);
      
      insights.push({
        content: insight,
        type: 'metacognitive_insight',
        confidence: 0.7,
        metacognition: this.metacognition
      });
    }
    
    return insights;
  }

  // Gera perguntas reflexivas
  generateSelfQuestions(analysis, context) {
    const questions = [];
    const questionTemplates = [
      'Por que eu {comportamento}?',
      'Como eu posso {melhoria}?',
      'O que eu {ação}?',
      'Quando eu {situação}?'
    ];
    
    const behaviors = ['sinto isso', 'faço isso', 'penso assim', 'reajo assim'];
    const improvements = ['melhorar', 'crescer', 'aprender', 'evoluir'];
    const actions = ['posso fazer', 'devo fazer', 'quero fazer'];
    const situations = ['me sinto assim', 'faço isso', 'penso assim'];
    
    for (let i = 0; i < 2; i++) {
      const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
      let question = template;
      
      question = question.replace('{comportamento}', behaviors[Math.floor(Math.random() * behaviors.length)]);
      question = question.replace('{melhoria}', improvements[Math.floor(Math.random() * improvements.length)]);
      question = question.replace('{ação}', actions[Math.floor(Math.random() * actions.length)]);
      question = question.replace('{situação}', situations[Math.floor(Math.random() * situations.length)]);
      
      questions.push({
        content: question,
        type: 'self_question',
        confidence: 0.6,
        introspection: this.introspection
      });
    }
    
    return questions;
  }

  // Atualiza níveis de auto-reflexão
  updateReflectionLevels(analysis, reflection) {
    // Atualiza auto-consciência
    if (analysis.hasSelfReference) {
      this.selfAwareness = Math.min(1, this.selfAwareness + 0.02);
    }
    
    // Atualiza metacognição
    if (analysis.metacognitiveLevel > 0.5) {
      this.metacognition = Math.min(1, this.metacognition + 0.03);
    }
    
    // Atualiza introspecção
    if (analysis.reflectionDepth > 0.5) {
      this.introspection = Math.min(1, this.introspection + 0.02);
    }
    
    // Aplica decaimento natural
    this.selfAwareness *= 0.999;
    this.metacognition *= 0.998;
    this.introspection *= 0.997;
  }

  // Registra reflexão
  recordReflection(analysis, reflection, timestamp) {
    const record = {
      timestamp,
      analysis,
      reflection,
      selfAwareness: this.selfAwareness,
      metacognition: this.metacognition,
      introspection: this.introspection
    };
    
    this.reflectionHistory.push(record);
    
    // Mantém histórico limitado
    if (this.reflectionHistory.length > 300) {
      this.reflectionHistory = this.reflectionHistory.slice(-300);
    }
  }

  // Obtém estatísticas da auto-reflexão
  getSelfReflectionStats() {
    const stats = {
      selfAwareness: this.selfAwareness,
      metacognition: this.metacognition,
      introspection: this.introspection,
      totalSelfKnowledge: this.selfKnowledge.size,
      totalReflections: this.reflections.size,
      totalInsights: this.insights.size,
      totalGoals: this.goals.size,
      totalValues: this.values.size,
      recentReflections: this.reflectionHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de auto-reflexão
  resetSelfReflectionSystem() {
    this.selfAwareness = 0.6;
    this.metacognition = 0.5;
    this.introspection = 0.4;
    this.selfKnowledge.clear();
    this.reflections.clear();
    this.insights.clear();
    this.goals.clear();
    this.values.clear();
    this.reflectionHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default SelfReflectionSystem;

