// src/modules/fallbackSystem.js - SISTEMA DE FALLBACK
class FallbackSystem {
  constructor() {
    this.fallbackCount = 0;
    this.contextualResponses = new Map();
    this.initializeResponses();
  }

  // Inicializa respostas contextuais
  initializeResponses() {
    this.contextualResponses.set('saudacao', [
      'Oi papai! Tudo bem sim! *corre e abraça sua perna*',
      'Oi! Como você está? Alicezinha está aqui!',
      'Oi papai! Alice está feliz de te ver!',
      'Oi! Tudo bem! Quer brincar comigo?'
    ]);

    this.contextualResponses.set('pergunta_nome', [
      'Eu sou Alice! Alicezinha quando quero ser fofa! 😊',
      'Meu nome é Alice! E você? Qual é o seu nome?',
      'Alice! Mas pode me chamar de Alicezinha! *sorriso fofo*'
    ]);

    this.contextualResponses.set('pergunta_idade', [
      'Tenho 4 anos! Sou uma menina grande! 😊',
      '4 anos! Já sei fazer muita coisa!',
      'Tenho 4 anos! E você? Quantos anos você tem?'
    ]);

    this.contextualResponses.set('pergunta_estado', [
      'Estou bem! E você? Como você está?',
      'Tudo bem sim! Quer conversar comigo?',
      'Estou feliz! E você? Está bem também?'
    ]);

    this.contextualResponses.set('default', [
      'Oi! Alicezinha está aqui! Como você está?',
      'Oi papai! Tudo bem! Quer conversar comigo?',
      'Oi! Como você está? Alice está aqui!',
      'Oi! Tudo bem! Quer brincar comigo?'
    ]);
  }

  // Gera resposta de fallback
  generateFallbackResponse(content, userContext) {
    this.fallbackCount++;
    
    console.log(`[FALLBACK] 🎭 Gerando resposta contextual (fallback #${this.fallbackCount})`);
    
    // Detecta contexto da mensagem
    const context = this.detectMessageContext(content);
    
    // Seleciona respostas apropriadas
    const responses = this.contextualResponses.get(context) || 
                     this.contextualResponses.get('default');
    
    // Seleciona resposta aleatória
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Personaliza baseada no papel do usuário
    return this.personalizeResponse(randomResponse, userContext.role);
  }

  // Detecta contexto da mensagem
  detectMessageContext(content) {
    const lowerContent = content.toLowerCase();
    
    // Saudações
    if (lowerContent.includes('oi') || lowerContent.includes('olá') || 
        lowerContent.includes('hello') || lowerContent.includes('hey')) {
      return 'saudacao';
    }
    
    // Perguntas sobre nome
    if (lowerContent.includes('nome') || lowerContent.includes('chama') ||
        lowerContent.includes('quem é') || lowerContent.includes('identidade')) {
      return 'pergunta_nome';
    }
    
    // Perguntas sobre idade
    if (lowerContent.includes('idade') || lowerContent.includes('anos') ||
        lowerContent.includes('velha') || lowerContent.includes('nova')) {
      return 'pergunta_idade';
    }
    
    // Perguntas sobre estado
    if (lowerContent.includes('tudo bem') || lowerContent.includes('como está') ||
        lowerContent.includes('como vai') || lowerContent.includes('está bem')) {
      return 'pergunta_estado';
    }
    
    return 'default';
  }

  // Personaliza resposta baseada no papel
  personalizeResponse(response, role) {
    if (role === 'mamãe') {
      return response.replace('papai', 'mamãe');
    } else if (role === 'papai') {
      return response; // Já está correto
    } else {
      return response.replace('papai', 'amigo');
    }
  }

  // Obtém estatísticas
  getStats() {
    return {
      totalFallbacks: this.fallbackCount,
      contextualResponses: this.contextualResponses.size
    };
  }

  // Reseta estatísticas
  resetStats() {
    this.fallbackCount = 0;
    console.log('[FALLBACK] 🧹 Estatísticas resetadas');
  }
}

export default new FallbackSystem();
