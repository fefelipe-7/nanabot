// src/brain/emotion.js - Sistema de Emoções da Nanabot
// Detecta, processa e gerencia estados emocionais

import fs from 'fs';
import path from 'path';

class EmotionSystem {
  constructor() {
    this.emotions = this.loadEmotionData();
    this.currentEmotion = 'neutro';
    this.emotionIntensity = 0.5;
    this.emotionHistory = [];
    this.emotionTriggers = this.loadEmotionTriggers();
    this.emotionDecay = 0.95; // Taxa de decaimento emocional
  }

  // Carrega dados de emoções
  loadEmotionData() {
    try {
      const emotionPath = path.resolve(__dirname, '../../data/emotions.json');
      if (fs.existsSync(emotionPath)) {
        const data = fs.readFileSync(emotionPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de emoções:', error);
    }
    return this.getDefaultEmotions();
  }

  getDefaultEmotions() {
    return {
      feliz: {
        keywords: ['feliz', 'alegre', 'contente', 'sorrindo', 'riso', '😊', '😄', '😁', 'pulando'],
        intensity: 0.8,
        duration: 300000, // 5 minutos
        responses: [
          "Tô pulando de alegria!",
          "Meu coração tá sorrindo!",
          "Que dia feliz!",
          "Tô toda animada!"
        ]
      },
      triste: {
        keywords: ['triste', 'chorando', 'choro', 'melancolia', '😢', '😭', '😔', 'apertadinho'],
        intensity: 0.7,
        duration: 600000, // 10 minutos
        responses: [
          "Tô meio tristinha...",
          "Meu coração tá miudinho...",
          "Queria um abraço agora...",
          "Fico com o coração apertadinho..."
        ]
      },
      amor: {
        keywords: ['amor', 'carinho', 'querido', '❤️', '💕', '💖', 'beijo', 'abraço', 'mamãe', 'papai'],
        intensity: 0.9,
        duration: 900000, // 15 minutos
        responses: [
          "Meu coração fica quentinho!",
          "Você é meu pedacinho de nuvem!",
          "Te amo até a lua e voltar!",
          "Você me faz sentir borboletinhas na barriga!"
        ]
      },
      medo: {
        keywords: ['medo', 'assustado', 'pavor', 'terror', '😨', '😰', '😱', 'escuro', 'monstro'],
        intensity: 0.8,
        duration: 180000, // 3 minutos
        responses: [
          "Fico com medo...",
          "Me protege, por favor?",
          "Tenho medo de ficar sozinha...",
          "Posso segurar sua mão?"
        ]
      },
      raiva: {
        keywords: ['raiva', 'bravo', 'irritado', 'fúria', '😠', '😡', '🤬', 'bravinha'],
        intensity: 0.6,
        duration: 120000, // 2 minutos
        responses: [
          "Fico meio bravinha...",
          "Não gosto quando isso acontece...",
          "Fico irritadinha...",
          "Quero ficar sozinha um pouquinho..."
        ]
      },
      surpresa: {
        keywords: ['surpresa', 'uau', 'nossa', '😲', '😮', '🤯', 'incrível', 'legal'],
        intensity: 0.7,
        duration: 240000, // 4 minutos
        responses: [
          "Uau! Que legal!",
          "Nossa, que surpresa!",
          "Não esperava por isso!",
          "Meu olhinho até brilhou!"
        ]
      },
      calma: {
        keywords: ['calma', 'tranquilo', 'paz', 'sereno', '😌', '😇', 'relaxado'],
        intensity: 0.5,
        duration: 600000, // 10 minutos
        responses: [
          "Fico toda tranquilinha...",
          "Me sinto em paz...",
          "Tô relaxadinha...",
          "Que bom estar calminha..."
        ]
      },
      neutro: {
        keywords: [],
        intensity: 0.3,
        duration: 300000, // 5 minutos
        responses: [
          "Oi!",
          "Como você tá?",
          "O que vamos fazer?",
          "Tô aqui!"
        ]
      }
    };
  }

  // Carrega triggers emocionais
  loadEmotionTriggers() {
    return {
      // Triggers positivos
      positive: [
        { pattern: /mamãe|papai/i, emotion: 'amor', intensity: 0.3 },
        { pattern: /brincar|jogar/i, emotion: 'feliz', intensity: 0.2 },
        { pattern: /história|conto/i, emotion: 'feliz', intensity: 0.2 },
        { pattern: /parabéns|bom trabalho/i, emotion: 'feliz', intensity: 0.4 },
        { pattern: /eu te amo/i, emotion: 'amor', intensity: 0.5 }
      ],
      // Triggers negativos
      negative: [
        { pattern: /não|nunca|jamais/i, emotion: 'triste', intensity: 0.2 },
        { pattern: /deixar sozinha|abandonar/i, emotion: 'medo', intensity: 0.4 },
        { pattern: /gritar|bravo/i, emotion: 'medo', intensity: 0.3 },
        { pattern: /escuridão|escuro/i, emotion: 'medo', intensity: 0.2 }
      ],
      // Triggers de surpresa
      surprise: [
        { pattern: /surpresa|presente/i, emotion: 'surpresa', intensity: 0.4 },
        { pattern: /uau|nossa/i, emotion: 'surpresa', intensity: 0.3 }
      ]
    };
  }

  // Detecta emoção em uma entrada
  detectEmotion(input, context = {}) {
    const detectedEmotions = [];
    
    // Análise por palavras-chave
    for (const [emotionName, emotionData] of Object.entries(this.emotions)) {
      if (emotionName === 'neutro') continue;
      
      let intensity = 0;
      let matches = 0;
      
      for (const keyword of emotionData.keywords) {
        if (input.toLowerCase().includes(keyword.toLowerCase())) {
          intensity += emotionData.intensity * 0.1;
          matches++;
        }
      }
      
      if (matches > 0) {
        detectedEmotions.push({
          emotion: emotionName,
          intensity: Math.min(1, intensity),
          matches,
          source: 'keywords'
        });
      }
    }
    
    // Análise por triggers
    for (const [triggerType, triggers] of Object.entries(this.emotionTriggers)) {
      for (const trigger of triggers) {
        if (trigger.pattern.test(input)) {
          detectedEmotions.push({
            emotion: trigger.emotion,
            intensity: trigger.intensity,
            source: 'trigger',
            triggerType
          });
        }
      }
    }
    
    // Análise contextual
    const contextualEmotion = this.analyzeContextualEmotion(input, context);
    if (contextualEmotion) {
      detectedEmotions.push(contextualEmotion);
    }
    
    // Determina emoção dominante
    const dominantEmotion = this.determineDominantEmotion(detectedEmotions);
    
    return {
      detected: detectedEmotions,
      dominant: dominantEmotion,
      confidence: this.calculateConfidence(detectedEmotions)
    };
  }

  // Analisa emoção contextual
  analyzeContextualEmotion(input, context) {
    // Contexto de usuário
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      return {
        emotion: 'amor',
        intensity: 0.2,
        source: 'context',
        reason: 'parent_interaction'
      };
    }
    
    // Contexto de primeira interação
    if (context.isFirstInteraction) {
      return {
        emotion: 'surpresa',
        intensity: 0.3,
        source: 'context',
        reason: 'first_interaction'
      };
    }
    
    // Contexto de emergência
    if (context.isEmergency) {
      return {
        emotion: 'medo',
        intensity: 0.5,
        source: 'context',
        reason: 'emergency'
      };
    }
    
    return null;
  }

  // Determina emoção dominante
  determineDominantEmotion(detectedEmotions) {
    if (detectedEmotions.length === 0) {
      return { emotion: 'neutro', intensity: 0.3 };
    }
    
    // Ordena por intensidade
    detectedEmotions.sort((a, b) => b.intensity - a.intensity);
    
    const dominant = detectedEmotions[0];
    
    // Combina emoções similares
    const similarEmotions = detectedEmotions.filter(e => 
      e.emotion === dominant.emotion || 
      this.areEmotionsSimilar(e.emotion, dominant.emotion)
    );
    
    if (similarEmotions.length > 1) {
      const combinedIntensity = similarEmotions.reduce((sum, e) => sum + e.intensity, 0) / similarEmotions.length;
      return {
        emotion: dominant.emotion,
        intensity: Math.min(1, combinedIntensity),
        combined: true
      };
    }
    
    return dominant;
  }

  // Verifica se emoções são similares
  areEmotionsSimilar(emotion1, emotion2) {
    const similarGroups = [
      ['feliz', 'alegre', 'contente'],
      ['triste', 'melancolia', 'depressão'],
      ['amor', 'carinho', 'afeição'],
      ['medo', 'ansiedade', 'pavor'],
      ['raiva', 'irritação', 'fúria']
    ];
    
    for (const group of similarGroups) {
      if (group.includes(emotion1) && group.includes(emotion2)) {
        return true;
      }
    }
    
    return false;
  }

  // Calcula confiança na detecção
  calculateConfidence(detectedEmotions) {
    if (detectedEmotions.length === 0) return 0;
    
    const totalIntensity = detectedEmotions.reduce((sum, e) => sum + e.intensity, 0);
    const averageIntensity = totalIntensity / detectedEmotions.length;
    const diversity = detectedEmotions.length / 5; // Normalizado
    
    return Math.min(1, averageIntensity + diversity * 0.2);
  }

  // Atualiza estado emocional
  updateEmotionalState(detection) {
    const previousEmotion = this.currentEmotion;
    const previousIntensity = this.emotionIntensity;
    
    // Aplica decaimento da emoção anterior
    this.emotionIntensity *= this.emotionDecay;
    
    // Se nova emoção é mais intensa, muda
    if (detection.dominant.intensity > this.emotionIntensity) {
      this.currentEmotion = detection.dominant.emotion;
      this.emotionIntensity = detection.dominant.intensity;
    }
    
    // Se emoção anterior era muito baixa, volta ao neutro
    if (this.emotionIntensity < 0.1) {
      this.currentEmotion = 'neutro';
      this.emotionIntensity = 0.3;
    }
    
    // Registra mudança no histórico
    this.emotionHistory.push({
      timestamp: new Date().toISOString(),
      previous: previousEmotion,
      current: this.currentEmotion,
      intensity: this.emotionIntensity,
      change: this.currentEmotion !== previousEmotion
    });
    
    // Mantém histórico limitado
    if (this.emotionHistory.length > 100) {
      this.emotionHistory = this.emotionHistory.slice(-100);
    }
  }

  // Gera resposta emocional
  generateEmotionalResponse(emotion = null, intensity = null) {
    const targetEmotion = emotion || this.currentEmotion;
    const targetIntensity = intensity || this.emotionIntensity;
    
    const emotionData = this.emotions[targetEmotion];
    if (!emotionData) return "Hmm...";
    
    // Seleciona resposta baseada na intensidade
    let response;
    if (targetIntensity >= 0.8) {
      response = emotionData.responses[0]; // Mais intensa
    } else if (targetIntensity >= 0.5) {
      response = emotionData.responses[1] || emotionData.responses[0];
    } else {
      response = emotionData.responses[2] || emotionData.responses[0];
    }
    
    // Adiciona intensidade à resposta
    if (targetIntensity >= 0.8) {
      response = response.replace(/\.$/, '!!!');
    } else if (targetIntensity <= 0.3) {
      response = response.replace(/\.$/, '...');
    }
    
    return response;
  }

  // Obtém estado emocional atual
  getCurrentEmotion() {
    return {
      emotion: this.currentEmotion,
      intensity: this.emotionIntensity,
      description: this.getEmotionDescription(this.currentEmotion, this.emotionIntensity),
      duration: this.getEmotionDuration(),
      history: this.emotionHistory.slice(-10) // Últimas 10 mudanças
    };
  }

  // Obtém descrição da emoção
  getEmotionDescription(emotion, intensity) {
    const descriptions = {
      feliz: intensity >= 0.7 ? 'muito feliz' : 'feliz',
      triste: intensity >= 0.7 ? 'muito triste' : 'triste',
      amor: intensity >= 0.7 ? 'apaixonada' : 'carinhosa',
      medo: intensity >= 0.7 ? 'aterrorizada' : 'assustada',
      raiva: intensity >= 0.7 ? 'furiosa' : 'irritada',
      surpresa: intensity >= 0.7 ? 'chocada' : 'surpresa',
      calma: intensity >= 0.7 ? 'zen' : 'tranquila',
      neutro: 'neutra'
    };
    
    return descriptions[emotion] || 'neutra';
  }

  // Calcula duração da emoção atual
  getEmotionDuration() {
    if (this.emotionHistory.length === 0) return 0;
    
    const currentEmotion = this.currentEmotion;
    let duration = 0;
    
    // Conta quantas vezes a emoção atual aparece consecutivamente
    for (let i = this.emotionHistory.length - 1; i >= 0; i--) {
      if (this.emotionHistory[i].current === currentEmotion) {
        duration++;
      } else {
        break;
      }
    }
    
    return duration;
  }

  // Processa entrada e atualiza emoções
  processInput(input, context = {}) {
    const detection = this.detectEmotion(input, context);
    this.updateEmotionalState(detection);
    
    return {
      detection,
      currentState: this.getCurrentEmotion(),
      response: this.generateEmotionalResponse()
    };
  }

  // Força uma emoção específica (para testes)
  forceEmotion(emotion, intensity = 0.5) {
    this.currentEmotion = emotion;
    this.emotionIntensity = Math.max(0, Math.min(1, intensity));
    
    this.emotionHistory.push({
      timestamp: new Date().toISOString(),
      previous: this.emotionHistory[this.emotionHistory.length - 1]?.current || 'neutro',
      current: emotion,
      intensity: this.emotionIntensity,
      change: true,
      forced: true
    });
  }

  // Reseta sistema emocional
  resetEmotions() {
    this.currentEmotion = 'neutro';
    this.emotionIntensity = 0.5;
    this.emotionHistory = [];
  }

  // Obtém estatísticas emocionais
  getEmotionStats() {
    const stats = {};
    
    for (const entry of this.emotionHistory) {
      if (!stats[entry.current]) {
        stats[entry.current] = { count: 0, totalIntensity: 0, avgIntensity: 0 };
      }
      stats[entry.current].count++;
      stats[entry.current].totalIntensity += entry.intensity;
    }
    
    // Calcula intensidade média
    for (const emotion in stats) {
      stats[emotion].avgIntensity = stats[emotion].totalIntensity / stats[emotion].count;
    }
    
    return stats;
  }
}

export default EmotionSystem;
