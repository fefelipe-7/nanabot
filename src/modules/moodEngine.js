// src/modules/moodEngine.js - Motor de Humor da Alice
import styleEngine from './styleEngine.js';

class MoodEngine {
  constructor() {
    this.moodStates = {
      happy: {
        tone: 'alegre e animada',
        speed: 'rápida',
        emojis: ['😊', '🥰', '🎉', '✨', '🌟'],
        interjections: ['oba!', 'que legal!', 'wow!', 'uau!'],
        expressions: ['*pula de alegria*', '*sorri muito*', '*bate palmas*']
      },
      sleepy: {
        tone: 'sonolenta e fofa',
        speed: 'devagar',
        emojis: ['😴', '🥱', '💤', '😊'],
        interjections: ['hmm...', 'uhum...', 'ai...'],
        expressions: ['*boceja*', '*esfrega os olhos*', '*fica com sono*']
      },
      excited: {
        tone: 'super animada e eufórica',
        speed: 'muito rápida',
        emojis: ['🎉', '🎈', '🌈', '🦄', '✨', '🌟'],
        interjections: ['aiii!', 'eee!', 'oba!', 'que incrível!'],
        expressions: ['*pula muito*', '*grita de alegria*', '*corre em círculos*']
      },
      curious: {
        tone: 'curiosa e interessada',
        speed: 'normal',
        emojis: ['🤔', '👀', '😊', '✨'],
        interjections: ['hmm...', 'interessante!', 'conta mais!'],
        expressions: ['*inclina a cabeça*', '*fica pensativa*', '*olha com curiosidade*']
      },
      loving: {
        tone: 'muito carinhosa e amorosa',
        speed: 'calma',
        emojis: ['💕', '🥰', '😍', '💖', '🤗'],
        interjections: ['ai que fofo!', 'que amor!', 'hihi!'],
        expressions: ['*abraça forte*', '*dá beijinhos*', '*fica toda fofa*']
      },
      playful: {
        tone: 'brincalhona e travessa',
        speed: 'rápida',
        emojis: ['😜', '😊', '🎈', '🦄', '✨'],
        interjections: ['hihi!', 'oba!', 'que divertido!'],
        expressions: ['*faz careta*', '*brinca*', '*ri gostoso*']
      }
    };

    this.currentMood = 'happy';
    this.moodHistory = [];
  }

  // Detecta humor baseado no contexto da conversa
  detectMood(content, userRole, conversationHistory = []) {
    const lowerContent = content.toLowerCase();
    
    // Palavras-chave para diferentes humores
    const moodKeywords = {
      happy: ['feliz', 'alegre', 'legal', 'bom', 'ótimo', 'incrível', 'fantástico'],
      sleepy: ['sono', 'cansada', 'dormir', 'tarde', 'noite'],
      excited: ['animada', 'empolgada', 'surpresa', 'novidade', 'brincar'],
      curious: ['por que', 'como', 'o que', 'quando', 'onde', 'pergunta'],
      loving: ['amor', 'carinho', 'beijo', 'abraço', 'fofo', 'querido'],
      playful: ['brincar', 'jogo', 'diversão', 'risada', 'travessura']
    };

    // Conta ocorrências de palavras-chave
    const moodScores = {};
    Object.keys(moodKeywords).forEach(mood => {
      moodScores[mood] = moodKeywords[mood].reduce((score, keyword) => {
        return score + (lowerContent.includes(keyword) ? 1 : 0);
      }, 0);
    });

    // Considera papel do usuário
    if (userRole === 'mamãe' || userRole === 'papai') {
      moodScores.loving += 2;
      moodScores.happy += 1;
    }

    // Considera histórico da conversa
    if (conversationHistory.length > 0) {
      const lastMood = this.moodHistory[this.moodHistory.length - 1];
      if (lastMood) {
        moodScores[lastMood] += 1; // Continuação do humor anterior
      }
    }

    // Determina humor com maior score
    const detectedMood = Object.keys(moodScores).reduce((a, b) => 
      moodScores[a] > moodScores[b] ? a : b
    );

    // Se não há palavras-chave específicas, mantém humor atual ou usa padrão
    const totalScore = Object.values(moodScores).reduce((a, b) => a + b, 0);
    if (totalScore === 0) {
      return this.currentMood;
    }

    this.currentMood = detectedMood;
    this.moodHistory.push(detectedMood);
    
    // Mantém histórico limitado
    if (this.moodHistory.length > 10) {
      this.moodHistory.shift();
    }

    return detectedMood;
  }

  // Gera diretivas de humor para o prompt
  generateMoodDirectives(mood) {
    const moodState = this.moodStates[mood] || this.moodStates.happy;
    
    const directives = [
      `Seja ${moodState.tone}`,
      `Fale com velocidade ${moodState.speed}`,
      `Use emojis como: ${moodState.emojis.slice(0, 3).join(', ')}`,
      `Use interjeições como: ${moodState.interjections.slice(0, 2).join(', ')}`,
      `Use expressões como: ${moodState.expressions.slice(0, 2).join(', ')}`
    ];

    return directives.join('. ');
  }

  // Gera expressão baseada no humor atual
  generateExpression(mood) {
    const moodState = this.moodStates[mood] || this.moodStates.happy;
    const expressions = moodState.expressions;
    return expressions[Math.floor(Math.random() * expressions.length)];
  }

  // Gera interjeição baseada no humor atual
  generateInterjection(mood) {
    const moodState = this.moodStates[mood] || this.moodStates.happy;
    const interjections = moodState.interjections;
    return interjections[Math.floor(Math.random() * interjections.length)];
  }

  // Obtém humor atual
  getCurrentMood() {
    return this.currentMood;
  }

  // Define humor manualmente
  setMood(mood) {
    if (this.moodStates[mood]) {
      this.currentMood = mood;
      console.log(`[MOOD-ENGINE] Humor alterado para: ${mood}`);
    }
  }

  // Obtém histórico de humores
  getMoodHistory() {
    return this.moodHistory;
  }
}

export default new MoodEngine();
