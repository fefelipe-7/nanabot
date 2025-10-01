// src/modules/variationEngine.js - Motor de Variação da Alice
import styleEngine from './styleEngine.js';

class VariationEngine {
  constructor() {
    this.synonyms = {
      // Sinônimos infantis para palavras comuns
      'legal': ['legal', 'bacana', 'massa', 'da hora', 'show'],
      'bom': ['bom', 'ótimo', 'maravilhoso', 'incrível', 'fantástico'],
      'feliz': ['feliz', 'alegre', 'contente', 'radiante', 'eufórica'],
      'brincar': ['brincar', 'jogar', 'se divertir', 'passear', 'dançar'],
      'comer': ['comer', 'lanchar', 'petiscar', 'devorar', 'saborear'],
      'dormir': ['dormir', 'descansar', 'tirar uma soneca', 'cochilar'],
      'casa': ['casa', 'lar', 'moradia', 'cantinho'],
      'amigo': ['amigo', 'amiguinho', 'companheiro', 'parceiro'],
      'mamãe': ['mamãe', 'mamá', 'mãe', 'mamãezinha'],
      'papai': ['papai', 'papá', 'pai', 'papazinho']
    };

    this.templates = {
      greetings: [
        "Oi {user}! Como você está?",
        "Olá {user}! Que bom te ver!",
        "E aí {user}! Tudo bem?",
        "Oi {user}! Como vai?",
        "Olá {user}! Que alegria!"
      ],
      responses: [
        "Ah, entendi! {response}",
        "Que interessante! {response}",
        "Nossa, que legal! {response}",
        "Uau! {response}",
        "Ai que fofo! {response}"
      ],
      questions: [
        "Você quer saber o que eu acho?",
        "Posso te contar uma coisa?",
        "Você sabia que...",
        "Eu tenho uma pergunta...",
        "Você pode me ajudar?"
      ],
      expressions: [
        "*olha com curiosidade*",
        "*inclina a cabeça*",
        "*sorri docemente*",
        "*fica pensativa*",
        "*bate palmas*",
        "*pula de alegria*",
        "*dá uma risadinha*",
        "*fica toda fofa*"
      ]
    };

    this.usedTemplates = new Map(); // userId -> [templates usados recentemente]
  }

  // Substitui palavras por sinônimos infantis
  replaceWithSynonyms(text) {
    let result = text;
    
    Object.keys(this.synonyms).forEach(word => {
      const synonyms = this.synonyms[word];
      const randomSynonym = synonyms[Math.floor(Math.random() * synonyms.length)];
      
      // Substitui apenas se a palavra estiver isolada (não parte de outra palavra)
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, randomSynonym);
    });

    return result;
  }

  // Gera variação de saudação
  generateGreetingVariation(userCall) {
    const greetings = this.templates.greetings;
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    return greeting.replace('{user}', userCall);
  }

  // Gera variação de resposta
  generateResponseVariation(response) {
    const responseTemplates = this.templates.responses;
    const template = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
    return template.replace('{response}', response);
  }

  // Gera pergunta de variação
  generateQuestionVariation() {
    const questions = this.templates.questions;
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // Gera expressão de variação
  generateExpressionVariation() {
    const expressions = this.templates.expressions;
    return expressions[Math.floor(Math.random() * expressions.length)];
  }

  // Adiciona variação ao texto baseado no contexto
  addVariation(text, context = 'normal', userId = null) {
    let variedText = text;

    // Evita repetir templates recentes para o mesmo usuário
    if (userId && this.usedTemplates.has(userId)) {
      const recentTemplates = this.usedTemplates.get(userId);
      // Remove templates antigos (mantém apenas os últimos 5)
      if (recentTemplates.length > 5) {
        recentTemplates.shift();
      }
    }

    // Adiciona sinônimos
    if (Math.random() < 0.3) {
      variedText = this.replaceWithSynonyms(variedText);
    }

    // Adiciona expressão baseada no contexto
    if (Math.random() < 0.4) {
      const expression = this.generateExpressionVariation();
      variedText = `${expression} ${variedText}`;
    }

    // Adiciona pergunta de follow-up
    if (context === 'response' && Math.random() < 0.3) {
      const question = this.generateQuestionVariation();
      variedText += ` ${question}`;
    }

    return variedText;
  }

  // Gera micro-template personalizado
  generateMicroTemplate(type, userCall = '') {
    const templates = this.templates[type] || this.templates.responses;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{user}', userCall);
  }

  // Registra template usado para evitar repetição
  registerTemplateUsage(userId, template) {
    if (!this.usedTemplates.has(userId)) {
      this.usedTemplates.set(userId, []);
    }
    
    const userTemplates = this.usedTemplates.get(userId);
    userTemplates.push(template);
    
    // Limita histórico por usuário
    if (userTemplates.length > 10) {
      userTemplates.shift();
    }
  }

  // Verifica se template foi usado recentemente
  isTemplateRecentlyUsed(userId, template) {
    if (!this.usedTemplates.has(userId)) return false;
    
    const userTemplates = this.usedTemplates.get(userId);
    return userTemplates.includes(template);
  }

  // Limpa histórico de templates
  clearTemplateHistory(userId = null) {
    if (userId) {
      this.usedTemplates.delete(userId);
    } else {
      this.usedTemplates.clear();
    }
  }

  // Obtém estatísticas de variação
  getVariationStats() {
    const totalUsers = this.usedTemplates.size;
    const totalTemplates = Array.from(this.usedTemplates.values())
      .reduce((sum, templates) => sum + templates.length, 0);
    
    return {
      totalUsers,
      totalTemplates,
      averageTemplatesPerUser: totalUsers > 0 ? totalTemplates / totalUsers : 0
    };
  }
}

export default new VariationEngine();
