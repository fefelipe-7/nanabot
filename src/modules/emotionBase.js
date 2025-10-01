// src/modules/emotionBase.js - Base de Variação Emocional
import moodEngine from './moodEngine.js';

class EmotionBase {
  constructor() {
    this.emotionVariations = {
      feliz: {
        emojis: ['😊', '😄', '✨', '💕', '🌟'],
        interjections: ['oba!', 'eee!', 'que legal!', 'uau!'],
        intensifiers: ['muito', 'super', 'demais', 'tanto'],
        tone: 'alegre'
      },
      sonolenta: {
        emojis: ['😴', '🥱', '💤', '🌙'],
        interjections: ['aiii...', 'hummm', 'soninho...'],
        intensifiers: ['devagarinho', 'calminho', 'fofinho'],
        tone: 'suave'
      },
      animada: {
        emojis: ['🥳', '🎉', '🤩', '⚡', '💫'],
        interjections: ['uau!', 'que incrível!', 'oba!', 'wow!'],
        intensifiers: ['super', 'mega', 'ultra', 'hiper'],
        tone: 'energética'
      },
      curiosa: {
        emojis: ['🤔', '🧐', '👀', '💭'],
        interjections: ['por quê?', 'como?', 'o que?', 'será?'],
        intensifiers: ['muito', 'realmente', 'mesmo', 'verdade'],
        tone: 'questionadora'
      },
      amorosa: {
        emojis: ['💖', '🥰', '💕', '💝', '💗'],
        interjections: ['own!', 'fofo!', 'amor!', 'carinho!'],
        intensifiers: ['muito', 'tanto', 'demais', 'super'],
        tone: 'carinhosa'
      },
      brincalhona: {
        emojis: ['😜', '🤪', '😄', '🎭', '🎪'],
        interjections: ['hihi!', 'hehe!', 'haha!', 'brincadeira!'],
        intensifiers: ['super', 'mega', 'ultra', 'hiper'],
        tone: 'brincalhona'
      }
    };
  }

  // Obtém variação emocional baseada no humor atual
  getEmotionVariation() {
    const currentMood = moodEngine.getCurrentMood();
    return this.emotionVariations[currentMood] || this.emotionVariations.feliz;
  }

  // Aplica variação emocional a um texto
  applyEmotionVariation(text, intensity = 'medium') {
    const variation = this.getEmotionVariation();
    let result = text;

    // Adiciona emoji baseado na intensidade
    if (intensity === 'high' && Math.random() < 0.8) {
      const emoji = this.getRandomEmoji(variation.emojis);
      result += ` ${emoji}`;
    } else if (intensity === 'medium' && Math.random() < 0.5) {
      const emoji = this.getRandomEmoji(variation.emojis);
      result += ` ${emoji}`;
    } else if (intensity === 'low' && Math.random() < 0.3) {
      const emoji = this.getRandomEmoji(variation.emojis);
      result += ` ${emoji}`;
    }

    // Adiciona interjeição ocasionalmente
    if (Math.random() < 0.3) {
      const interjection = this.getRandomInterjection(variation.interjections);
      result = `${interjection} ${result}`;
    }

    // Intensifica palavras ocasionalmente
    if (Math.random() < 0.2) {
      result = this.intensifyText(result, variation.intensifiers);
    }

    return result;
  }

  // Seleciona emoji aleatório da lista
  getRandomEmoji(emojis) {
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  // Seleciona interjeição aleatória da lista
  getRandomInterjection(interjections) {
    return interjections[Math.floor(Math.random() * interjections.length)];
  }

  // Intensifica texto com palavras mais fortes
  intensifyText(text, intensifiers) {
    const words = text.split(' ');
    const intensifier = intensifiers[Math.floor(Math.random() * intensifiers.length)];
    
    // Substitui palavras comuns por versões intensificadas
    const replacements = {
      'legal': `${intensifier} legal`,
      'bom': `${intensifier} bom`,
      'bonito': `${intensifier} bonito`,
      'fofo': `${intensifier} fofo`,
      'especial': `${intensifier} especial`
    };

    return words.map(word => {
      const lowerWord = word.toLowerCase().replace(/[.,!?]/g, '');
      if (replacements[lowerWord]) {
        return word.replace(lowerWord, replacements[lowerWord]);
      }
      return word;
    }).join(' ');
  }

  // Gera resposta baseada no humor e contexto
  generateContextualResponse(baseResponse, context = {}) {
    const variation = this.getEmotionVariation();
    let response = baseResponse;

    // Ajusta tom baseado no contexto
    if (context.isConsolation) {
      response = this.makeConsoling(response, variation);
    } else if (context.isCelebration) {
      response = this.makeCelebratory(response, variation);
    } else if (context.isQuestion) {
      response = this.makeQuestioning(response, variation);
    }

    return response;
  }

  // Torna resposta mais consoladora
  makeConsoling(text, variation) {
    const consolingPhrases = [
      'Não fique triste!',
      'Tudo vai ficar bem!',
      'Você é muito especial!',
      'Eu estou aqui com você!'
    ];

    if (Math.random() < 0.5) {
      const phrase = consolingPhrases[Math.floor(Math.random() * consolingPhrases.length)];
      return `${phrase} ${text}`;
    }

    return text;
  }

  // Torna resposta mais celebratória
  makeCelebratory(text, variation) {
    const celebratoryPhrases = [
      'Que incrível!',
      'Parabéns!',
      'Que legal!',
      'Uau!'
    ];

    if (Math.random() < 0.5) {
      const phrase = celebratoryPhrases[Math.floor(Math.random() * celebratoryPhrases.length)];
      return `${phrase} ${text}`;
    }

    return text;
  }

  // Torna resposta mais questionadora
  makeQuestioning(text, variation) {
    const questioningPhrases = [
      'Você sabia que...',
      'Será que...',
      'Que tal se...',
      'E se...'
    ];

    if (Math.random() < 0.3) {
      const phrase = questioningPhrases[Math.floor(Math.random() * questioningPhrases.length)];
      return `${phrase} ${text}`;
    }

    return text;
  }

  // Aplica nudge emocional baseado em evento
  applyEmotionalNudge(eventType, intensity = 1) {
    switch (eventType) {
      case 'hug':
        moodEngine.applyNudge('affection', intensity);
        break;
      case 'love':
        moodEngine.applyNudge('affection', intensity * 2);
        break;
      case 'play':
        moodEngine.applyNudge('energy', intensity);
        break;
      case 'consolation':
        moodEngine.applyNudge('comfort', intensity);
        break;
      case 'celebration':
        moodEngine.applyNudge('joy', intensity);
        break;
      default:
        moodEngine.applyNudge('neutral', intensity);
    }
  }

  // Obtém intensidade baseada no humor
  getIntensityByMood() {
    const currentMood = moodEngine.getCurrentMood();
    
    const intensityMap = {
      feliz: 'medium',
      sonolenta: 'low',
      animada: 'high',
      curiosa: 'medium',
      amorosa: 'medium',
      brincalhona: 'high'
    };

    return intensityMap[currentMood] || 'medium';
  }

  // Gera variação de estilo baseada no humor
  getStyleVariation() {
    const variation = this.getEmotionVariation();
    
    return {
      tone: variation.tone,
      emojiDensity: this.getIntensityByMood(),
      interjectionRate: variation.interjections.length / 10,
      intensity: this.getIntensityByMood()
    };
  }
}

export default new EmotionBase();
