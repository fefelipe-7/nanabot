// src/modules/styleEngine.js - Motor de Estilo da Alice
import fs from 'fs';
import path from 'path';

class StyleEngine {
  constructor() {
    this.config = this.loadConfig();
    this.emojiCache = new Map();
    this.interjectionCache = new Map();
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'persona.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('[STYLE-ENGINE] Erro ao carregar config:', error.message);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      style: {
        emojiDensity: "medium",
        interjectionRate: 0.4,
        diminutives: true,
        followUpRate: 0.5,
        maxLength: "medium",
        safety: true
      },
      emojis: {
        medium: ["😊", "🥰", "💕", "😍", "🤗", "😘", "🌟", "✨", "💖"]
      },
      interjections: ["eee!", "aiii!", "uhum!", "hihi!", "ow!", "oba!"]
    };
  }

  // Gera diretivas de estilo baseadas no papel do usuário
  generateStyleDirectives(userRole, messageType = 'normal') {
    const directives = [];

    // Emoji density
    const emojiDensity = this.config.style.emojiDensity;
    const emojis = this.config.emojis[emojiDensity] || this.config.emojis.medium;
    
    directives.push(`Use emojis com densidade ${emojiDensity}: ${emojis.slice(0, 3).join(', ')}`);

    // Interjeições baseadas na taxa configurada
    if (Math.random() < this.config.style.interjectionRate) {
      const interjection = this.getRandomInterjection();
      directives.push(`Use interjeições infantis como: ${interjection}`);
    }

    // Diminutivos baseados no papel
    if (this.config.style.diminutives) {
      const diminutives = this.config.diminutives[userRole] || this.config.diminutives.amiguinho;
      directives.push(`Use diminutivos carinhosos: ${diminutives.join(', ')}`);
    }

    // Perguntas de follow-up
    if (Math.random() < this.config.style.followUpRate) {
      directives.push('Faça uma pergunta de continuidade para manter a conversa');
    }

    // Comprimento baseado no tipo de mensagem
    const lengthSetting = this.getLengthSetting(messageType);
    directives.push(`Mantenha resposta ${lengthSetting} (${this.config.lengthSettings[lengthSetting]} caracteres)`);

    return directives.join('. ');
  }

  getRandomInterjection() {
    const interjections = this.config.interjections;
    return interjections[Math.floor(Math.random() * interjections.length)];
  }

  getLengthSetting(messageType) {
    switch (messageType) {
      case 'question':
        return 'long';
      case 'greeting':
        return 'short';
      case 'story':
        return 'long';
      default:
        return this.config.style.maxLength;
    }
  }

  // Detecta tipo de mensagem baseado no conteúdo
  detectMessageType(content) {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('?')) return 'question';
    if (lowerContent.includes('oi') || lowerContent.includes('olá')) return 'greeting';
    if (lowerContent.includes('história') || lowerContent.includes('conta')) return 'story';
    if (lowerContent.includes('brincar') || lowerContent.includes('jogo')) return 'play';
    
    return 'normal';
  }

  // Gera abertura contextual
  generateOpening(userCall) {
    const openings = this.config.openings;
    const opening = openings[Math.floor(Math.random() * openings.length)];
    return opening.replace('{user}', userCall);
  }

  // Gera fechamento contextual
  generateClosing() {
    const closings = this.config.closings;
    return closings[Math.floor(Math.random() * closings.length)];
  }

  // Gera pergunta de follow-up
  generateFollowUpQuestion() {
    const questions = this.config.followUpQuestions;
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // Atualiza configuração em runtime
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[STYLE-ENGINE] Configuração atualizada:', newConfig);
  }

  // Obtém configuração atual
  getConfig() {
    return this.config;
  }
}

export default new StyleEngine();
