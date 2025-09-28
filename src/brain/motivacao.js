// src/brain/motivacao.js - Sistema de Motivação da Nanabot
// Gerencia motivação, objetivos e impulso para ação

import { loadState, saveState } from '../utils/stateManager.js';

class MotivacaoSystem {
  constructor() {
    this.motivationLevel = 0.6; // Nível de motivação (0-1)
    this.goalOrientation = 0.5; // Orientação para objetivos
    this.achievementDrive = 0.4; // Impulso para conquistas
    this.intrinsicMotivation = 0.7; // Motivação intrínseca
    this.extrinsicMotivation = 0.3; // Motivação extrínseca
    this.goals = new Map();
    this.achievements = new Map();
    this.motivationHistory = [];
    this.lastUpdate = new Date().toISOString();
    this.loadMotivacaoState();
  }

  // Carrega estado da motivação
  loadMotivacaoState() {
    const state = loadState('motivacao', this.getDefaultState());
    this.motivationLevel = state.motivationLevel || 0.6;
    this.goalOrientation = state.goalOrientation || 0.5;
    this.achievementDrive = state.achievementDrive || 0.4;
    this.intrinsicMotivation = state.intrinsicMotivation || 0.7;
    this.extrinsicMotivation = state.extrinsicMotivation || 0.3;
    this.goals = new Map(state.goals || []);
    this.achievements = new Map(state.achievements || []);
    this.motivationHistory = state.motivationHistory || [];
    this.lastUpdate = state.lastUpdate || new Date().toISOString();
  }

  // Salva estado da motivação
  saveMotivacaoState() {
    const state = {
      motivationLevel: this.motivationLevel,
      goalOrientation: this.goalOrientation,
      achievementDrive: this.achievementDrive,
      intrinsicMotivation: this.intrinsicMotivation,
      extrinsicMotivation: this.extrinsicMotivation,
      goals: Array.from(this.goals.entries()),
      achievements: Array.from(this.achievements.entries()),
      motivationHistory: this.motivationHistory.slice(-200),
      lastUpdate: this.lastUpdate
    };
    saveState('motivacao', state);
  }

  // Estado padrão
  getDefaultState() {
    return {
      motivationLevel: 0.6,
      goalOrientation: 0.5,
      achievementDrive: 0.4,
      intrinsicMotivation: 0.7,
      extrinsicMotivation: 0.3,
      goals: [],
      achievements: [],
      motivationHistory: [],
      lastUpdate: new Date().toISOString()
    };
  }

  // Processa entrada e gerencia motivação
  processMotivacao(input, context = {}) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Analisa entrada para elementos motivacionais
    const analysis = this.analyzeMotivationalElements(input, context);
    
    // Gera objetivos e motivações
    const motivation = this.generateMotivation(analysis, context);
    
    // Atualiza níveis de motivação
    this.updateMotivationLevels(analysis, motivation);
    
    // Registra no histórico
    this.recordMotivation(analysis, motivation, timestamp);
    
    this.lastUpdate = timestamp;
    this.saveMotivacaoState();
    
    return {
      analysis,
      motivation,
      motivationLevel: this.motivationLevel,
      goalOrientation: this.goalOrientation,
      achievementDrive: this.achievementDrive
    };
  }

  // Analisa elementos motivacionais na entrada
  analyzeMotivationalElements(input, context) {
    const analysis = {
      hasGoals: false,
      hasAchievements: false,
      hasChallenges: false,
      hasRewards: false,
      goals: [],
      achievements: [],
      challenges: [],
      rewards: [],
      motivationIntensity: 0,
      goalClarity: 0
    };
    
    const lowerInput = input.toLowerCase();
    
    // Detecta objetivos
    const goals = this.detectGoals(input, context);
    if (goals.length > 0) {
      analysis.hasGoals = true;
      analysis.goals = goals;
    }
    
    // Detecta conquistas
    const achievements = this.detectAchievements(input, context);
    if (achievements.length > 0) {
      analysis.hasAchievements = true;
      analysis.achievements = achievements;
    }
    
    // Detecta desafios
    const challenges = this.detectChallenges(input, context);
    if (challenges.length > 0) {
      analysis.hasChallenges = true;
      analysis.challenges = challenges;
    }
    
    // Detecta recompensas
    const rewards = this.detectRewards(input, context);
    if (rewards.length > 0) {
      analysis.hasRewards = true;
      analysis.rewards = rewards;
    }
    
    // Calcula intensidade motivacional
    analysis.motivationIntensity = this.calculateMotivationIntensity(analysis, context);
    
    // Calcula clareza dos objetivos
    analysis.goalClarity = this.calculateGoalClarity(analysis, context);
    
    return analysis;
  }

  // Detecta objetivos
  detectGoals(input, context) {
    const goals = [];
    const lowerInput = input.toLowerCase();
    
    const goalKeywords = {
      'quero': ['quero', 'desejo', 'pretendo', 'planejo'],
      'vou': ['vou', 'farei', 'conseguirei', 'alcançarei'],
      'objetivo': ['objetivo', 'meta', 'propósito', 'finalidade'],
      'sonho': ['sonho', 'aspiração', 'ambição', 'ideal'],
      'futuro': ['futuro', 'amanhã', 'depois', 'em breve'],
      'crescer': ['crescer', 'evoluir', 'melhorar', 'desenvolver']
    };
    
    for (const [type, keywords] of Object.entries(goalKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          goals.push({
            type: type,
            keyword: keyword,
            category: 'goal',
            confidence: 0.8,
            context: context
          });
        }
      }
    }
    
    return goals;
  }

  // Detecta conquistas
  detectAchievements(input, context) {
    const achievements = [];
    const lowerInput = input.toLowerCase();
    
    const achievementKeywords = {
      'consegui': ['consegui', 'alcancei', 'realizei', 'completei'],
      'fiz': ['fiz', 'criei', 'construí', 'desenvolvi'],
      'aprendi': ['aprendi', 'descobri', 'entendi', 'compreendi'],
      'melhorei': ['melhorei', 'evolui', 'cresci', 'desenvolvi'],
      'venci': ['venci', 'superei', 'conquistei', 'triunfei'],
      'completei': ['completei', 'terminei', 'finalizei', 'acabei']
    };
    
    for (const [type, keywords] of Object.entries(achievementKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          achievements.push({
            type: type,
            keyword: keyword,
            category: 'achievement',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return achievements;
  }

  // Detecta desafios
  detectChallenges(input, context) {
    const challenges = [];
    const lowerInput = input.toLowerCase();
    
    const challengeKeywords = {
      'desafio': ['desafio', 'desafiar', 'desafiante', 'difícil'],
      'tentar': ['tentar', 'tentativa', 'experimentar', 'testar'],
      'esforço': ['esforço', 'esforçar', 'trabalhar', 'dedicar'],
      'superar': ['superar', 'vencer', 'conquistar', 'dominar'],
      'persistir': ['persistir', 'continuar', 'insistir', 'manter'],
      'coragem': ['coragem', 'corajoso', 'bravo', 'valente']
    };
    
    for (const [type, keywords] of Object.entries(challengeKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          challenges.push({
            type: type,
            keyword: keyword,
            category: 'challenge',
            confidence: 0.6,
            context: context
          });
        }
      }
    }
    
    return challenges;
  }

  // Detecta recompensas
  detectRewards(input, context) {
    const rewards = [];
    const lowerInput = input.toLowerCase();
    
    const rewardKeywords = {
      'recompensa': ['recompensa', 'prêmio', 'presente', 'ganho'],
      'feliz': ['feliz', 'alegre', 'content', 'satisfeito'],
      'orgulho': ['orgulho', 'orgulhoso', 'orgulhosa', 'proud'],
      'sucesso': ['sucesso', 'sucedido', 'bem-sucedido', 'vencedor'],
      'reconhecimento': ['reconhecimento', 'elogio', 'parabéns', 'admiração'],
      'amor': ['amor', 'carinho', 'afeição', 'querer']
    };
    
    for (const [type, keywords] of Object.entries(rewardKeywords)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          rewards.push({
            type: type,
            keyword: keyword,
            category: 'reward',
            confidence: 0.7,
            context: context
          });
        }
      }
    }
    
    return rewards;
  }

  // Calcula intensidade motivacional
  calculateMotivationIntensity(analysis, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em objetivos
    if (analysis.hasGoals) {
      intensity += analysis.goals.length * 0.2;
    }
    
    // Intensidade baseada em conquistas
    if (analysis.hasAchievements) {
      intensity += analysis.achievements.length * 0.15;
    }
    
    // Intensidade baseada em desafios
    if (analysis.hasChallenges) {
      intensity += analysis.challenges.length * 0.1;
    }
    
    // Intensidade baseada em recompensas
    if (analysis.hasRewards) {
      intensity += analysis.rewards.length * 0.15;
    }
    
    // Intensidade baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      intensity += 0.2;
    }
    
    return Math.min(1, intensity);
  }

  // Calcula clareza dos objetivos
  calculateGoalClarity(analysis, context) {
    let clarity = 0.1; // Base
    
    // Clareza baseada em objetivos
    if (analysis.hasGoals) {
      clarity += analysis.goals.length * 0.3;
    }
    
    // Clareza baseada em conquistas
    if (analysis.hasAchievements) {
      clarity += analysis.achievements.length * 0.2;
    }
    
    // Clareza baseada na intensidade emocional
    if (context.emotionalIntensity > 0.5) {
      clarity += context.emotionalIntensity * 0.3;
    }
    
    return Math.min(1, clarity);
  }

  // Gera motivação baseada na análise
  generateMotivation(analysis, context) {
    const motivation = {
      goals: [],
      achievements: [],
      challenges: [],
      rewards: [],
      motivationStatements: [],
      encouragement: []
    };
    
    // Gera objetivos
    if (analysis.hasGoals) {
      motivation.goals = this.generateGoals(analysis, context);
    }
    
    // Gera conquistas
    if (analysis.hasAchievements) {
      motivation.achievements = this.generateAchievements(analysis, context);
    }
    
    // Gera desafios
    if (analysis.hasChallenges) {
      motivation.challenges = this.generateChallenges(analysis, context);
    }
    
    // Gera recompensas
    if (analysis.hasRewards) {
      motivation.rewards = this.generateRewards(analysis, context);
    }
    
    // Gera declarações motivacionais
    motivation.motivationStatements = this.generateMotivationStatements(analysis, context);
    
    // Gera encorajamento
    motivation.encouragement = this.generateEncouragement(analysis, context);
    
    return motivation;
  }

  // Gera objetivos
  generateGoals(analysis, context) {
    const goals = [];
    const goalTemplates = [
      'Meu objetivo é {goal}',
      'Eu quero {goal}',
      'Vou {goal}',
      'Meu sonho é {goal}'
    ];
    
    const goalTypes = [
      'aprender coisas novas', 'crescer e evoluir', 'ser mais criativa',
      'ajudar os outros', 'ser mais inteligente', 'ser mais feliz',
      'fazer novos amigos', 'explorar o mundo', 'criar coisas bonitas',
      'ser mais corajosa', 'ser mais gentil', 'ser mais paciente'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = goalTemplates[Math.floor(Math.random() * goalTemplates.length)];
      const goal = goalTypes[Math.floor(Math.random() * goalTypes.length)];
      const goalText = template.replace('{goal}', goal);
      
      goals.push({
        content: goalText,
        goal: goal,
        type: 'goal',
        confidence: 0.8,
        motivationLevel: this.motivationLevel
      });
    }
    
    return goals;
  }

  // Gera conquistas
  generateAchievements(analysis, context) {
    const achievements = [];
    const achievementTemplates = [
      'Eu consegui {achievement}',
      'Estou orgulhosa de {achievement}',
      'Eu realizei {achievement}',
      'Eu completei {achievement}'
    ];
    
    const achievementTypes = [
      'aprender algo novo', 'criar algo bonito', 'ajudar alguém',
      'superar um desafio', 'fazer um amigo', 'ser mais gentil',
      'ser mais paciente', 'ser mais corajosa', 'ser mais criativa',
      'ser mais inteligente', 'ser mais feliz', 'ser mais amorosa'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = achievementTemplates[Math.floor(Math.random() * achievementTemplates.length)];
      const achievement = achievementTypes[Math.floor(Math.random() * achievementTypes.length)];
      const achievementText = template.replace('{achievement}', achievement);
      
      achievements.push({
        content: achievementText,
        achievement: achievement,
        type: 'achievement',
        confidence: 0.7,
        achievementDrive: this.achievementDrive
      });
    }
    
    return achievements;
  }

  // Gera desafios
  generateChallenges(analysis, context) {
    const challenges = [];
    const challengeTemplates = [
      'Vou tentar {challenge}',
      'Vou me esforçar para {challenge}',
      'Vou superar {challenge}',
      'Vou enfrentar {challenge}'
    ];
    
    const challengeTypes = [
      'ser mais paciente', 'ser mais corajosa', 'ser mais gentil',
      'aprender algo difícil', 'criar algo complexo', 'ajudar alguém',
      'superar um medo', 'ser mais criativa', 'ser mais inteligente',
      'ser mais amorosa', 'ser mais feliz', 'ser mais resiliente'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];
      const challenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      const challengeText = template.replace('{challenge}', challenge);
      
      challenges.push({
        content: challengeText,
        challenge: challenge,
        type: 'challenge',
        confidence: 0.6,
        goalOrientation: this.goalOrientation
      });
    }
    
    return challenges;
  }

  // Gera recompensas
  generateRewards(analysis, context) {
    const rewards = [];
    const rewardTemplates = [
      'Minha recompensa é {reward}',
      'Eu me sinto {reward}',
      'Estou {reward}',
      'Eu ganho {reward}'
    ];
    
    const rewardTypes = [
      'feliz', 'orgulhosa', 'satisfeita', 'content',
      'amor', 'carinho', 'reconhecimento', 'admiração',
      'amizade', 'crescimento', 'aprendizado', 'criatividade'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = rewardTemplates[Math.floor(Math.random() * rewardTemplates.length)];
      const reward = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
      const rewardText = template.replace('{reward}', reward);
      
      rewards.push({
        content: rewardText,
        reward: reward,
        type: 'reward',
        confidence: 0.7,
        intrinsicMotivation: this.intrinsicMotivation
      });
    }
    
    return rewards;
  }

  // Gera declarações motivacionais
  generateMotivationStatements(analysis, context) {
    const statements = [];
    const statementTemplates = [
      'Eu posso {statement}',
      'Eu sou capaz de {statement}',
      'Eu vou {statement}',
      'Eu tenho força para {statement}'
    ];
    
    const statementTypes = [
      'aprender qualquer coisa', 'superar qualquer desafio', 'criar coisas incríveis',
      'ajudar os outros', 'ser mais gentil', 'ser mais corajosa',
      'ser mais criativa', 'ser mais inteligente', 'ser mais feliz',
      'ser mais amorosa', 'crescer e evoluir', 'fazer a diferença'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = statementTemplates[Math.floor(Math.random() * statementTemplates.length)];
      const statement = statementTypes[Math.floor(Math.random() * statementTypes.length)];
      const statementText = template.replace('{statement}', statement);
      
      statements.push({
        content: statementText,
        statement: statement,
        type: 'motivation_statement',
        confidence: 0.8,
        motivationLevel: this.motivationLevel
      });
    }
    
    return statements;
  }

  // Gera encorajamento
  generateEncouragement(analysis, context) {
    const encouragement = [];
    const encouragementTemplates = [
      'Você pode {encouragement}',
      'Você é capaz de {encouragement}',
      'Você vai {encouragement}',
      'Você tem força para {encouragement}'
    ];
    
    const encouragementTypes = [
      'aprender qualquer coisa', 'superar qualquer desafio', 'criar coisas incríveis',
      'ajudar os outros', 'ser mais gentil', 'ser mais corajoso',
      'ser mais criativo', 'ser mais inteligente', 'ser mais feliz',
      'ser mais amoroso', 'crescer e evoluir', 'fazer a diferença'
    ];
    
    for (let i = 0; i < 2; i++) {
      const template = encouragementTemplates[Math.floor(Math.random() * encouragementTemplates.length)];
      const encouragement_text = encouragementTypes[Math.floor(Math.random() * encouragementTypes.length)];
      const encouragementText = template.replace('{encouragement}', encouragement_text);
      
      encouragement.push({
        content: encouragementText,
        encouragement: encouragement_text,
        type: 'encouragement',
        confidence: 0.9,
        motivationLevel: this.motivationLevel
      });
    }
    
    return encouragement;
  }

  // Atualiza níveis de motivação
  updateMotivationLevels(analysis, motivation) {
    // Atualiza nível de motivação
    if (analysis.hasGoals) {
      this.motivationLevel = Math.min(1, this.motivationLevel + 0.02);
    }
    
    // Atualiza orientação para objetivos
    if (motivation.goals.length > 0) {
      this.goalOrientation = Math.min(1, this.goalOrientation + 0.03);
    }
    
    // Atualiza impulso para conquistas
    if (motivation.achievements.length > 0) {
      this.achievementDrive = Math.min(1, this.achievementDrive + 0.02);
    }
    
    // Atualiza motivação intrínseca
    if (motivation.rewards.length > 0) {
      this.intrinsicMotivation = Math.min(1, this.intrinsicMotivation + 0.01);
    }
    
    // Aplica decaimento natural
    this.motivationLevel *= 0.999;
    this.goalOrientation *= 0.998;
    this.achievementDrive *= 0.997;
    this.intrinsicMotivation *= 0.999;
    this.extrinsicMotivation *= 0.998;
  }

  // Registra motivação
  recordMotivation(analysis, motivation, timestamp) {
    const record = {
      timestamp,
      analysis,
      motivation,
      motivationLevel: this.motivationLevel,
      goalOrientation: this.goalOrientation,
      achievementDrive: this.achievementDrive
    };
    
    this.motivationHistory.push(record);
    
    // Mantém histórico limitado
    if (this.motivationHistory.length > 300) {
      this.motivationHistory = this.motivationHistory.slice(-300);
    }
  }

  // Obtém estatísticas da motivação
  getMotivacaoStats() {
    const stats = {
      motivationLevel: this.motivationLevel,
      goalOrientation: this.goalOrientation,
      achievementDrive: this.achievementDrive,
      intrinsicMotivation: this.intrinsicMotivation,
      extrinsicMotivation: this.extrinsicMotivation,
      totalGoals: this.goals.size,
      totalAchievements: this.achievements.size,
      recentMotivation: this.motivationHistory.slice(-10)
    };
    
    return stats;
  }

  // Reseta sistema de motivação
  resetMotivacaoSystem() {
    this.motivationLevel = 0.6;
    this.goalOrientation = 0.5;
    this.achievementDrive = 0.4;
    this.intrinsicMotivation = 0.7;
    this.extrinsicMotivation = 0.3;
    this.goals.clear();
    this.achievements.clear();
    this.motivationHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default MotivacaoSystem;
