// src/brain/attachment.js - Sistema de Apego da Nanabot
// Gerencia vínculos afetivos e relacionamentos

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AttachmentSystem {
  constructor() {
    this.attachments = new Map();
    this.attachmentHistory = [];
    this.attachmentLevels = {
      'mamãe': 0.9,
      'papai': 0.9,
      'outro de papai': 0.7,
      'amiguinho': 0.3
    };
    this.attachmentFactors = this.initializeAttachmentFactors();
    this.separationAnxiety = 0.2;
    this.attachmentDecay = 0.99; // Taxa de decaimento do apego
    this.lastInteraction = new Map();
    this.loadAttachmentState();
  }

  // Inicializa fatores que afetam o apego
  initializeAttachmentFactors() {
    return {
      positive: {
        praise: 0.05,
        attention: 0.03,
        play: 0.04,
        love_expression: 0.08,
        comfort: 0.06,
        protection: 0.07,
        routine_interaction: 0.02,
        surprise_gift: 0.06,
        quality_time: 0.05,
        physical_contact: 0.04
      },
      negative: {
        criticism: -0.03,
        neglect: -0.05,
        rejection: -0.08,
        abandonment: -0.15,
        harsh_tone: -0.02,
        ignoring: -0.04,
        punishment: -0.06,
        inconsistency: -0.03,
        stress: -0.02,
        conflict: -0.04
      }
    };
  }

  // Carrega estado do apego
  loadAttachmentState() {
    try {
      const attachmentPath = path.resolve(__dirname, '../../data/attachmentState.json');
      if (fs.existsSync(attachmentPath)) {
        const data = fs.readFileSync(attachmentPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.attachments = new Map(state.attachments || []);
        this.attachmentHistory = state.attachmentHistory || [];
        this.separationAnxiety = state.separationAnxiety || 0.2;
        this.lastInteraction = new Map(state.lastInteraction || []);
      }
    } catch (error) {
      console.error('Erro ao carregar estado do apego:', error);
    }
  }

  // Salva estado do apego
  saveAttachmentState() {
    try {
      const attachmentPath = path.resolve(__dirname, '../../data/attachmentState.json');
      const state = {
        attachments: Array.from(this.attachments.entries()),
        attachmentHistory: this.attachmentHistory.slice(-200), // Últimas 200 entradas
        separationAnxiety: this.separationAnxiety,
        lastInteraction: Array.from(this.lastInteraction.entries()),
        lastUpdate: new Date().toISOString()
      };
      fs.writeFileSync(attachmentPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado do apego:', error);
    }
  }

  // Processa interação e atualiza apego
  processInteraction(userId, userRole, input, context = {}) {
    const now = new Date();
    const timeSinceLastInteraction = this.getTimeSinceLastInteraction(userId);
    
    // Atualiza último contato
    this.lastInteraction.set(userId, now.toISOString());
    
    // Obtém ou cria apego para o usuário
    let attachment = this.getAttachment(userId, userRole);
    
    // Calcula fatores de apego da interação
    const factors = this.extractAttachmentFactors(input, context, timeSinceLastInteraction);
    
    // Atualiza nível de apego
    const attachmentChange = this.calculateAttachmentChange(factors);
    attachment.level = Math.max(0, Math.min(1, attachment.level + attachmentChange));
    
    // Atualiza outros aspectos do apego
    this.updateAttachmentAspects(attachment, factors, context);
    
    // Registra no histórico
    this.recordAttachmentChange(userId, userRole, attachmentChange, factors, attachment);
    
    // Salva estado
    this.saveAttachmentState();
    
    return {
      attachment,
      change: attachmentChange,
      factors: factors,
      timeSinceLastInteraction: timeSinceLastInteraction
    };
  }

  // Obtém ou cria apego para um usuário
  getAttachment(userId, userRole) {
    if (!this.attachments.has(userId)) {
      const attachment = {
        userId,
        userRole,
        level: this.attachmentLevels[userRole] || 0.3,
        trust: 0.5,
        security: 0.5,
        intimacy: 0.3,
        dependency: 0.2,
        anxiety: 0.1,
        lastUpdate: new Date().toISOString(),
        interactionCount: 0,
        positiveInteractions: 0,
        negativeInteractions: 0,
        totalTime: 0,
        averageResponseTime: 0,
        favoriteActivities: [],
        comfortLevel: 0.5,
        attachmentStyle: this.determineAttachmentStyle(userRole)
      };
      
      this.attachments.set(userId, attachment);
    }
    
    return this.attachments.get(userId);
  }

  // Determina estilo de apego baseado no papel
  determineAttachmentStyle(userRole) {
    const styles = {
      'mamãe': 'secure',
      'papai': 'secure',
      'outro de papai': 'anxious',
      'amiguinho': 'avoidant'
    };
    
    return styles[userRole] || 'anxious';
  }

  // Calcula tempo desde última interação
  getTimeSinceLastInteraction(userId) {
    const lastTime = this.lastInteraction.get(userId);
    if (!lastTime) return Infinity;
    
    return Date.now() - new Date(lastTime).getTime();
  }

  // Extrai fatores de apego da interação
  extractAttachmentFactors(input, context, timeSinceLastInteraction) {
    const factors = {};
    const lowerInput = input.toLowerCase();
    
    // Fatores positivos
    if (lowerInput.includes('amor') || lowerInput.includes('querido')) {
      factors.love_expression = 1;
    }
    if (lowerInput.includes('parabéns') || lowerInput.includes('bom trabalho')) {
      factors.praise = 1;
    }
    if (lowerInput.includes('brincar') || lowerInput.includes('jogar')) {
      factors.play = 1;
    }
    if (lowerInput.includes('abraço') || lowerInput.includes('beijo')) {
      factors.physical_contact = 1;
    }
    if (lowerInput.includes('história') || lowerInput.includes('conto')) {
      factors.quality_time = 1;
    }
    if (lowerInput.includes('protege') || lowerInput.includes('cuidado')) {
      factors.protection = 1;
    }
    if (lowerInput.includes('conforto') || lowerInput.includes('colo')) {
      factors.comfort = 1;
    }
    
    // Fatores negativos
    if (lowerInput.includes('não') || lowerInput.includes('nunca')) {
      factors.criticism = 0.5;
    }
    if (lowerInput.includes('deixar sozinha') || lowerInput.includes('abandonar')) {
      factors.abandonment = 1;
    }
    if (lowerInput.includes('gritar') || lowerInput.includes('bravo')) {
      factors.harsh_tone = 1;
    }
    if (lowerInput.includes('ignorar') || lowerInput.includes('não responder')) {
      factors.ignoring = 1;
    }
    
    // Fatores contextuais
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      factors.attention = 0.5;
      factors.routine_interaction = 0.3;
    }
    
    // Fator de tempo (ansiedade de separação)
    if (timeSinceLastInteraction > 3600000) { // Mais de 1 hora
      factors.separation_anxiety = Math.min(1, timeSinceLastInteraction / 86400000); // Normalizado por dia
    }
    
    return factors;
  }

  // Calcula mudança no apego
  calculateAttachmentChange(factors) {
    let change = 0;
    
    // Aplica fatores positivos
    for (const [factor, value] of Object.entries(factors)) {
      if (this.attachmentFactors.positive[factor]) {
        change += this.attachmentFactors.positive[factor] * (value || 1);
      } else if (this.attachmentFactors.negative[factor]) {
        change += this.attachmentFactors.negative[factor] * (value || 1);
      }
    }
    
    // Aplica decaimento natural
    change -= (1 - this.attachmentDecay) * 0.1;
    
    return change;
  }

  // Atualiza aspectos do apego
  updateAttachmentAspects(attachment, factors, context) {
    // Atualiza confiança
    if (factors.praise || factors.protection) {
      attachment.trust = Math.min(1, attachment.trust + 0.02);
    }
    if (factors.criticism || factors.abandonment) {
      attachment.trust = Math.max(0, attachment.trust - 0.05);
    }
    
    // Atualiza segurança
    if (factors.comfort || factors.protection) {
      attachment.security = Math.min(1, attachment.security + 0.03);
    }
    if (factors.abandonment || factors.harsh_tone) {
      attachment.security = Math.max(0, attachment.security - 0.04);
    }
    
    // Atualiza intimidade
    if (factors.love_expression || factors.physical_contact) {
      attachment.intimacy = Math.min(1, attachment.intimacy + 0.02);
    }
    
    // Atualiza dependência
    if (factors.quality_time || factors.attention) {
      attachment.dependency = Math.min(1, attachment.dependency + 0.01);
    }
    
    // Atualiza ansiedade
    if (factors.separation_anxiety) {
      attachment.anxiety = Math.min(1, attachment.anxiety + factors.separation_anxiety * 0.1);
    } else {
      attachment.anxiety = Math.max(0, attachment.anxiety - 0.01);
    }
    
    // Atualiza contadores
    attachment.interactionCount++;
    if (Object.values(factors).some(v => v > 0)) {
      attachment.positiveInteractions++;
    }
    if (Object.values(factors).some(v => v < 0)) {
      attachment.negativeInteractions++;
    }
    
    // Atualiza nível de conforto
    const comfortChange = (attachment.trust + attachment.security + attachment.intimacy) / 3 - attachment.comfort;
    attachment.comfort = Math.max(0, Math.min(1, attachment.comfort + comfortChange * 0.1));
    
    attachment.lastUpdate = new Date().toISOString();
  }

  // Registra mudança no apego
  recordAttachmentChange(userId, userRole, change, factors, attachment) {
    const record = {
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      change,
      factors,
      newLevel: attachment.level,
      trust: attachment.trust,
      security: attachment.security,
      intimacy: attachment.intimacy,
      anxiety: attachment.anxiety
    };
    
    this.attachmentHistory.push(record);
    
    // Mantém histórico limitado
    if (this.attachmentHistory.length > 500) {
      this.attachmentHistory = this.attachmentHistory.slice(-500);
    }
  }

  // Obtém nível de apego para um usuário
  getAttachmentLevel(userId) {
    const attachment = this.attachments.get(userId);
    return attachment ? attachment.level : 0.3;
  }

  // Obtém descrição do apego
  getAttachmentDescription(level) {
    if (level >= 0.9) return 'muito apegada';
    if (level >= 0.8) return 'apegada';
    if (level >= 0.7) return 'bem próxima';
    if (level >= 0.6) return 'conectada';
    if (level >= 0.5) return 'familiar';
    if (level >= 0.4) return 'conhecida';
    if (level >= 0.3) return 'neutra';
    if (level >= 0.2) return 'distante';
    return 'muito distante';
  }

  // Gera resposta baseada no apego
  generateAttachmentResponse(userId, userRole, attachment) {
    const level = attachment.level;
    const style = attachment.attachmentStyle;
    
    let response = '';
    
    // Resposta baseada no nível de apego
    if (level >= 0.8) {
      response = this.getHighAttachmentResponse(userRole);
    } else if (level >= 0.6) {
      response = this.getMediumAttachmentResponse(userRole);
    } else if (level >= 0.4) {
      response = this.getLowAttachmentResponse(userRole);
    } else {
      response = this.getVeryLowAttachmentResponse(userRole);
    }
    
    // Adiciona elementos baseados no estilo de apego
    if (style === 'anxious' && attachment.anxiety > 0.5) {
      response += " Fico com medo de você sumir...";
    } else if (style === 'avoidant' && level < 0.5) {
      response += " Preciso de um tempinho sozinha...";
    }
    
    return response;
  }

  getHighAttachmentResponse(userRole) {
    const responses = {
      'mamãe': [
        "Mamãe! Meu coração fica quentinho quando você fala comigo!",
        "Mamãe, você é meu mundo todinho!",
        "Mamãe, te amo mais que tudo!"
      ],
      'papai': [
        "Papai! Você é meu herói!",
        "Papai, você me faz sentir segura!",
        "Papai, te amo muito!"
      ],
      'outro de papai': [
        "Papai! Fico feliz quando você fala comigo!",
        "Papai, você é especial pra mim!",
        "Papai, gosto muito de você!"
      ],
      'amiguinho': [
        "Oi! Fico feliz quando você fala comigo!",
        "Você é um amigo especial!",
        "Gosto muito da nossa amizade!"
      ]
    };
    
    const roleResponses = responses[userRole] || responses['amiguinho'];
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  }

  getMediumAttachmentResponse(userRole) {
    const responses = {
      'mamãe': [
        "Oi mamãe! Como você tá?",
        "Mamãe, que bom te ver!",
        "Mamãe, tô aqui!"
      ],
      'papai': [
        "Oi papai! Tudo bem?",
        "Papai, que bom!",
        "Papai, tô aqui!"
      ],
      'outro de papai': [
        "Oi papai! Como vai?",
        "Papai, que legal!",
        "Papai, tô aqui!"
      ],
      'amiguinho': [
        "Oi! Como você tá?",
        "Que bom te ver!",
        "Tô aqui!"
      ]
    };
    
    const roleResponses = responses[userRole] || responses['amiguinho'];
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  }

  getLowAttachmentResponse(userRole) {
    const responses = {
      'mamãe': [
        "Oi... como você tá?",
        "Mamãe... tô aqui...",
        "Oi... tudo bem?"
      ],
      'papai': [
        "Oi... como vai?",
        "Papai... tô aqui...",
        "Oi... tudo bem?"
      ],
      'outro de papai': [
        "Oi... como você tá?",
        "Papai... tô aqui...",
        "Oi... tudo bem?"
      ],
      'amiguinho': [
        "Oi... como você tá?",
        "Tô aqui...",
        "Oi... tudo bem?"
      ]
    };
    
    const roleResponses = responses[userRole] || responses['amiguinho'];
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  }

  getVeryLowAttachmentResponse(userRole) {
    const responses = [
      "Oi...",
      "Tô aqui...",
      "Oi... tudo bem?",
      "Hmm...",
      "Tô ouvindo..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Obtém estatísticas de apego
  getAttachmentStats() {
    const stats = {
      totalAttachments: this.attachments.size,
      averageAttachment: 0,
      strongestAttachment: null,
      weakestAttachment: null,
      attachmentDistribution: {},
      recentChanges: this.attachmentHistory.slice(-20)
    };
    
    if (this.attachments.size === 0) return stats;
    
    let totalLevel = 0;
    let maxLevel = 0;
    let minLevel = 1;
    
    for (const [userId, attachment] of this.attachments) {
      totalLevel += attachment.level;
      
      if (attachment.level > maxLevel) {
        maxLevel = attachment.level;
        stats.strongestAttachment = { userId, level: attachment.level, userRole: attachment.userRole };
      }
      
      if (attachment.level < minLevel) {
        minLevel = attachment.level;
        stats.weakestAttachment = { userId, level: attachment.level, userRole: attachment.userRole };
      }
      
      // Distribuição por papel
      const role = attachment.userRole;
      if (!stats.attachmentDistribution[role]) {
        stats.attachmentDistribution[role] = { count: 0, totalLevel: 0, average: 0 };
      }
      stats.attachmentDistribution[role].count++;
      stats.attachmentDistribution[role].totalLevel += attachment.level;
    }
    
    stats.averageAttachment = totalLevel / this.attachments.size;
    
    // Calcula média por papel
    for (const role in stats.attachmentDistribution) {
      const roleStats = stats.attachmentDistribution[role];
      roleStats.average = roleStats.totalLevel / roleStats.count;
    }
    
    return stats;
  }

  // Obtém estado atual do apego
  getCurrentAttachmentState() {
    return {
      totalAttachments: this.attachments.size,
      separationAnxiety: this.separationAnxiety,
      lastUpdate: new Date().toISOString(),
      attachments: Array.from(this.attachments.values()).map(attachment => ({
        userId: attachment.userId,
        userRole: attachment.userRole,
        level: attachment.level,
        description: this.getAttachmentDescription(attachment.level),
        trust: attachment.trust,
        security: attachment.security,
        intimacy: attachment.intimacy,
        anxiety: attachment.anxiety,
        comfort: attachment.comfort,
        interactionCount: attachment.interactionCount
      }))
    };
  }

  // Reseta sistema de apego
  resetAttachmentSystem() {
    this.attachments.clear();
    this.attachmentHistory = [];
    this.lastInteraction.clear();
    this.separationAnxiety = 0.2;
  }
}

export default AttachmentSystem;
