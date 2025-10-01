// src/modules/summarizer.js - Sumarização de Conversas da Alice
import apiRotator from '../utils/apiRotator.js';

class Summarizer {
  constructor() {
    this.maxSummaryLength = 280; // Caracteres
    this.maxMessagesToSummarize = 6; // Máximo de mensagens para sumarizar
  }

  // Sumariza mensagens usando IA
  async summarizeWithAI(messages, previousSummary = null) {
    try {
      const conversationText = this.formatMessagesForSummarization(messages);
      
      let prompt = `Você é Alice, uma menina de 4 anos. Resuma esta conversa de forma simples e carinhosa, como uma criança contaria para alguém:

${conversationText}

Resumo anterior: ${previousSummary || 'Nenhum'}

Crie um resumo curto (máximo ${this.maxSummaryLength} caracteres) que capture os pontos principais da conversa, mantendo o tom infantil e carinhoso da Alice.`;

      const response = await apiRotator.makeRequest(prompt, { role: 'summarizer' });
      
      // Trunca se muito longo
      const summary = response.length > this.maxSummaryLength 
        ? response.substring(0, this.maxSummaryLength - 3) + '...'
        : response;
      
      console.log(`[SUMMARIZER] Resumo gerado via IA: ${summary.length} caracteres`);
      return summary;
      
    } catch (error) {
      console.error('[SUMMARIZER] Erro na sumarização via IA:', error.message);
      return this.summarizeWithHeuristic(messages, previousSummary);
    }
  }

  // Sumarização heurística (fallback)
  summarizeWithHeuristic(messages, previousSummary = null) {
    try {
      const topics = this.extractTopics(messages);
      const entities = this.extractEntities(messages);
      const mood = this.detectConversationMood(messages);
      
      let summary = '';
      
      // Constrói resumo baseado em tópicos
      if (topics.length > 0) {
        summary += `Falamos sobre ${topics.slice(0, 2).join(' e ')}. `;
      }
      
      // Adiciona entidades importantes
      if (entities.length > 0) {
        summary += `Mencionamos ${entities.slice(0, 2).join(' e ')}. `;
      }
      
      // Adiciona humor da conversa
      if (mood) {
        summary += `Estava ${mood}. `;
      }
      
      // Se há resumo anterior, conecta
      if (previousSummary) {
        summary = `Antes ${previousSummary.toLowerCase()} Agora ${summary}`;
      }
      
      // Trunca se necessário
      if (summary.length > this.maxSummaryLength) {
        summary = summary.substring(0, this.maxSummaryLength - 3) + '...';
      }
      
      console.log(`[SUMMARIZER] Resumo heurístico gerado: ${summary.length} caracteres`);
      return summary;
      
    } catch (error) {
      console.error('[SUMMARIZER] Erro na sumarização heurística:', error.message);
      return 'Conversamos sobre várias coisas legais!';
    }
  }

  // Formata mensagens para sumarização
  formatMessagesForSummarization(messages) {
    return messages.map(msg => {
      const speaker = msg.role === 'user' ? 'Usuário' : 'Alice';
      return `${speaker}: ${msg.content}`;
    }).join('\n');
  }

  // Extrai tópicos das mensagens
  extractTopics(messages) {
    const topicKeywords = {
      'brincar': ['brincar', 'jogar', 'diversão', 'brinquedo'],
      'comida': ['comer', 'lanche', 'comida', 'fome', 'sabor'],
      'família': ['mamãe', 'papai', 'família', 'pais'],
      'escola': ['escola', 'aula', 'professor', 'estudar'],
      'sono': ['dormir', 'sono', 'cama', 'soninho'],
      'amigos': ['amigo', 'amiga', 'amiguinho', 'colegas'],
      'animais': ['cachorro', 'gato', 'animal', 'pet'],
      'cores': ['cor', 'vermelho', 'azul', 'verde', 'amarelo'],
      'música': ['música', 'cantar', 'dançar', 'som'],
      'desenho': ['desenhar', 'desenho', 'pintar', 'arte']
    };

    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    const foundTopics = [];

    Object.keys(topicKeywords).forEach(topic => {
      const keywords = topicKeywords[topic];
      const found = keywords.some(keyword => allText.includes(keyword));
      if (found) {
        foundTopics.push(topic);
      }
    });

    return foundTopics;
  }

  // Extrai entidades importantes
  extractEntities(messages) {
    const allText = messages.map(m => m.content).join(' ');
    
    // Nomes próprios (palavras capitalizadas)
    const properNouns = allText.match(/\b[A-Z][a-z]+\b/g) || [];
    
    // Números
    const numbers = allText.match(/\b\d+\b/g) || [];
    
    // Palavras importantes (não muito comuns)
    const commonWords = ['o', 'a', 'de', 'da', 'do', 'em', 'na', 'no', 'para', 'com', 'que', 'não', 'sim', 'muito', 'mais', 'mais', 'bem', 'bom', 'boa'];
    const words = allText.toLowerCase().split(/\W+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    
    // Conta frequência
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Retorna palavras mais frequentes
    const importantWords = Object.keys(wordFreq)
      .filter(word => wordFreq[word] > 1)
      .sort((a, b) => wordFreq[b] - wordFreq[a])
      .slice(0, 3);
    
    return [...properNouns.slice(0, 2), ...importantWords.slice(0, 2)];
  }

  // Detecta humor da conversa
  detectConversationMood(messages) {
    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    
    const moodKeywords = {
      'feliz': ['feliz', 'alegre', 'legal', 'bom', 'ótimo', 'incrível'],
      'animada': ['animada', 'empolgada', 'surpresa', 'wow', 'uau'],
      'curiosa': ['por que', 'como', 'o que', 'quando', 'onde'],
      'sonolenta': ['sono', 'cansada', 'dormir', 'tarde'],
      'amorosa': ['amor', 'carinho', 'beijo', 'abraço', 'fofo']
    };

    const moodScores = {};
    Object.keys(moodKeywords).forEach(mood => {
      moodScores[mood] = moodKeywords[mood].reduce((score, keyword) => {
        return score + (allText.includes(keyword) ? 1 : 0);
      }, 0);
    });

    const maxMood = Object.keys(moodScores).reduce((a, b) => 
      moodScores[a] > moodScores[b] ? a : b
    );

    return moodScores[maxMood] > 0 ? maxMood : null;
  }

  // Sumariza mensagens (método principal)
  async summarize(messages, previousSummary = null) {
    if (!messages || messages.length === 0) {
      return previousSummary || 'Nenhuma conversa ainda.';
    }

    // Se poucas mensagens, não precisa sumarizar
    if (messages.length <= 2) {
      return previousSummary || 'Conversa começando.';
    }

    // Limita número de mensagens para sumarizar
    const messagesToSummarize = messages.slice(-this.maxMessagesToSummarize);
    
    try {
      // Tenta sumarização via IA primeiro
      return await this.summarizeWithAI(messagesToSummarize, previousSummary);
    } catch (error) {
      console.error('[SUMMARIZER] Erro na sumarização:', error.message);
      // Fallback para heurística
      return this.summarizeWithHeuristic(messagesToSummarize, previousSummary);
    }
  }

  // Verifica se precisa sumarizar
  shouldSummarize(messageCount, currentSummary = null) {
    // Sumariza se tem muitas mensagens ou se não há resumo
    return messageCount > 6 || !currentSummary;
  }

  // Obtém estatísticas
  getStats() {
    return {
      maxSummaryLength: this.maxSummaryLength,
      maxMessagesToSummarize: this.maxMessagesToSummarize
    };
  }
}

export default new Summarizer();
