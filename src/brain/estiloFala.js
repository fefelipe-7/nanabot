// src/brain/estiloFala.js - Sistema de Estilo de Fala da Nanabot
// Adapta linguagem baseada em estado emocional, idade mental e contexto

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EstiloFalaSystem {
  constructor() {
    this.estilos = this.initializeEstilos();
    this.idadeMental = 4.0;
    this.estiloAtual = 'neutro';
    this.estiloHistory = [];
    this.adaptacoes = this.initializeAdaptacoes();
    this.lastUpdate = new Date().toISOString();
    this.loadEstiloState();
  }

  // Inicializa estilos de fala
  initializeEstilos() {
    return {
      feliz: {
        caracteristicas: {
          exclamacoes: 0.8,
          emojis: 0.7,
          repeticao: 0.6,
          intensidade: 0.9,
          velocidade: 0.8,
          volume: 0.8
        },
        palavras: ['muito', 'super', 'demais', 'incrível', 'fantástico'],
        expressoes: ['Tô pulando de alegria!', 'Que legal!', 'Adorei!'],
        emojis: ['😊', '😄', '🤩', '✨', '🎉'],
        pontuacao: '!!!'
      },
      triste: {
        caracteristicas: {
          exclamacoes: 0.2,
          emojis: 0.3,
          repeticao: 0.4,
          intensidade: 0.3,
          velocidade: 0.4,
          volume: 0.3
        },
        palavras: ['meio', 'um pouco', 'tristinha', 'apertadinho'],
        expressoes: ['Tô meio triste...', 'Meu coração tá apertado...'],
        emojis: ['😢', '😔', '💔', '😭'],
        pontuacao: '...'
      },
      amor: {
        caracteristicas: {
          exclamacoes: 0.9,
          emojis: 0.8,
          repeticao: 0.8,
          intensidade: 0.95,
          velocidade: 0.7,
          volume: 0.6
        },
        palavras: ['amor', 'querido', 'fofinho', 'especial', 'único'],
        expressoes: ['Te amo!', 'Você é especial!', 'Meu coração fica quentinho!'],
        emojis: ['❤️', '💕', '💖', '😍', '🥰'],
        pontuacao: '!'
      },
      medo: {
        caracteristicas: {
          exclamacoes: 0.6,
          emojis: 0.4,
          repeticao: 0.5,
          intensidade: 0.7,
          velocidade: 0.5,
          volume: 0.4
        },
        palavras: ['medo', 'assustada', 'protege', 'segura'],
        expressoes: ['Tenho medo...', 'Me protege?', 'Fico assustada...'],
        emojis: ['😨', '😰', '😱', '🤗'],
        pontuacao: '?'
      },
      raiva: {
        caracteristicas: {
          exclamacoes: 0.7,
          emojis: 0.3,
          repeticao: 0.3,
          intensidade: 0.8,
          velocidade: 0.6,
          volume: 0.8
        },
        palavras: ['brava', 'irritada', 'não gosto', 'chateada'],
        expressoes: ['Tô brava!', 'Não gosto disso!', 'Fico irritada!'],
        emojis: ['😠', '😡', '🤬'],
        pontuacao: '!'
      },
      surpresa: {
        caracteristicas: {
          exclamacoes: 0.9,
          emojis: 0.8,
          repeticao: 0.4,
          intensidade: 0.8,
          velocidade: 0.7,
          volume: 0.7
        },
        palavras: ['uau', 'nossa', 'incrível', 'não acredito'],
        expressoes: ['Uau!', 'Nossa!', 'Não acredito!'],
        emojis: ['😲', '😮', '🤯', '😱'],
        pontuacao: '!'
      },
      calma: {
        caracteristicas: {
          exclamacoes: 0.3,
          emojis: 0.4,
          repeticao: 0.2,
          intensidade: 0.4,
          velocidade: 0.5,
          volume: 0.4
        },
        palavras: ['tranquila', 'calma', 'paz', 'serena'],
        expressoes: ['Tô tranquila...', 'Que paz...', 'Tô calminha...'],
        emojis: ['😌', '😇', '☮️', '🧘'],
        pontuacao: '.'
      },
      neutro: {
        caracteristicas: {
          exclamacoes: 0.4,
          emojis: 0.3,
          repeticao: 0.3,
          intensidade: 0.5,
          velocidade: 0.6,
          volume: 0.5
        },
        palavras: ['ok', 'tudo bem', 'entendi', 'legal'],
        expressoes: ['Tudo bem', 'Entendi', 'Legal'],
        emojis: ['😐', '🙂', '👍'],
        pontuacao: '.'
      }
    };
  }

  // Inicializa adaptações por idade
  initializeAdaptacoes() {
    return {
      2: {
        vocabulario: ['mamãe', 'papai', 'água', 'comida', 'brincar'],
        complexidade: 0.2,
        frases: 1,
        conectores: 0.1,
        gírias: 0.0
      },
      3: {
        vocabulario: ['brincar', 'história', 'amor', 'medo', 'feliz'],
        complexidade: 0.4,
        frases: 2,
        conectores: 0.2,
        gírias: 0.1
      },
      4: {
        vocabulario: ['escola', 'amigos', 'família', 'natureza', 'animais'],
        complexidade: 0.6,
        frases: 3,
        conectores: 0.4,
        gírias: 0.2
      },
      5: {
        vocabulario: ['aprender', 'criar', 'imaginar', 'descobrir', 'explorar'],
        complexidade: 0.8,
        frases: 4,
        conectores: 0.6,
        gírias: 0.3
      },
      6: {
        vocabulario: ['responsabilidade', 'futuro', 'planejar', 'organizar', 'estudar'],
        complexidade: 0.9,
        frases: 5,
        conectores: 0.8,
        gírias: 0.4
      }
    };
  }

  // Carrega estado do estilo
  loadEstiloState() {
    try {
      const estiloPath = path.resolve(__dirname, '../../data/estiloState.json');
      if (fs.existsSync(estiloPath)) {
        const data = fs.readFileSync(estiloPath, 'utf-8');
        const state = JSON.parse(data);
        
        this.estiloAtual = state.estiloAtual || 'neutro';
        this.idadeMental = state.idadeMental || 4.0;
        this.estiloHistory = state.estiloHistory || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado do estilo:', error);
    }
  }

  // Salva estado do estilo
  saveEstiloState() {
    try {
      const estiloPath = path.resolve(__dirname, '../../data/estiloState.json');
      const state = {
        estiloAtual: this.estiloAtual,
        idadeMental: this.idadeMental,
        estiloHistory: this.estiloHistory.slice(-200), // Últimas 200 entradas
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(estiloPath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado do estilo:', error);
    }
  }

  // Atualiza estilo baseado em contexto
  updateEstilo(emotionalState, moodLevel, idadeMental, context = {}) {
    const previousEstilo = this.estiloAtual;
    this.idadeMental = idadeMental;
    
    // Determina estilo baseado no estado emocional
    let newEstilo = this.determineEstilo(emotionalState, moodLevel);
    
    // Aplica adaptações contextuais
    newEstilo = this.applyContextualAdaptations(newEstilo, context);
    
    // Atualiza estilo atual
    this.estiloAtual = newEstilo;
    
    // Registra mudança
    this.recordEstiloChange(previousEstilo, newEstilo, emotionalState, moodLevel);
    
    this.lastUpdate = new Date().toISOString();
    this.saveEstiloState();
    
    return {
      previous: previousEstilo,
      current: newEstilo,
      change: previousEstilo !== newEstilo
    };
  }

  // Determina estilo baseado no estado emocional
  determineEstilo(emotionalState, moodLevel) {
    // Prioridade: emoção específica > humor geral > neutro
    if (emotionalState && this.estilos[emotionalState]) {
      return emotionalState;
    }
    
    if (moodLevel >= 0.7) return 'feliz';
    if (moodLevel <= 0.3) return 'triste';
    
    return 'neutro';
  }

  // Aplica adaptações contextuais
  applyContextualAdaptations(estilo, context) {
    // Adaptação por papel do usuário
    if (context.userRole === 'mamãe' || context.userRole === 'papai') {
      // Mais carinhosa com os pais
      if (estilo === 'neutro') return 'amor';
      if (estilo === 'feliz') return 'amor';
    }
    
    // Adaptação por primeira interação
    if (context.isFirstInteraction) {
      return 'surpresa';
    }
    
    // Adaptação por emergência
    if (context.isEmergency) {
      return 'medo';
    }
    
    return estilo;
  }

  // Registra mudança de estilo
  recordEstiloChange(previous, current, emotionalState, moodLevel) {
    const record = {
      timestamp: new Date().toISOString(),
      previous,
      current,
      emotionalState,
      moodLevel,
      idadeMental: this.idadeMental
    };
    
    this.estiloHistory.push(record);
    
    // Mantém histórico limitado
    if (this.estiloHistory.length > 500) {
      this.estiloHistory = this.estiloHistory.slice(-500);
    }
  }

  // Adapta texto baseado no estilo atual
  adaptarTexto(texto, context = {}) {
    if (!texto) return '';
    
    const estilo = this.estilos[this.estiloAtual];
    const adaptacao = this.getAdaptacaoPorIdade();
    
    let textoAdaptado = texto;
    
    // Aplica características do estilo
    textoAdaptado = this.aplicarCaracteristicas(textoAdaptado, estilo);
    
    // Aplica adaptações por idade
    textoAdaptado = this.aplicarAdaptacoesIdade(textoAdaptado, adaptacao);
    
    // Aplica adaptações contextuais
    textoAdaptado = this.aplicarAdaptacoesContexto(textoAdaptado, context);
    
    return textoAdaptado;
  }

  // Aplica características do estilo
  aplicarCaracteristicas(texto, estilo) {
    let resultado = texto;
    
    // Aplica exclamações
    if (estilo.caracteristicas.exclamacoes > 0.5) {
      resultado = resultado.replace(/\.$/, '!');
    }
    
    // Aplica pontuação específica
    if (estilo.pontuacao) {
      resultado = resultado.replace(/[.!?]$/, estilo.pontuacao);
    }
    
    // Adiciona palavras características
    if (estilo.palavras.length > 0 && Math.random() < 0.3) {
      const palavra = estilo.palavras[Math.floor(Math.random() * estilo.palavras.length)];
      resultado = ` ${palavra} ${resultado}`;
    }
    
    // Adiciona expressões características
    if (estilo.expressoes.length > 0 && Math.random() < 0.2) {
      const expressao = estilo.expressoes[Math.floor(Math.random() * estilo.expressoes.length)];
      resultado = `${expressao} ${resultado}`;
    }
    
    // Adiciona emojis
    if (estilo.emojis.length > 0 && Math.random() < estilo.caracteristicas.emojis) {
      const emoji = estilo.emojis[Math.floor(Math.random() * estilo.emojis.length)];
      resultado = `${resultado} ${emoji}`;
    }
    
    return resultado;
  }

  // Aplica adaptações por idade
  aplicarAdaptacoesIdade(texto, adaptacao) {
    let resultado = texto;
    
    // Simplifica vocabulário se necessário
    if (adaptacao.complexidade < 0.5) {
      resultado = this.simplificarVocabulario(resultado);
    }
    
    // Limita tamanho das frases
    if (adaptacao.frases < 3) {
      resultado = this.limitarFrases(resultado, adaptacao.frases);
    }
    
    // Adiciona gírias infantis
    if (adaptacao.gírias > 0.2) {
      resultado = this.adicionarGirias(resultado);
    }
    
    return resultado;
  }

  // Simplifica vocabulário
  simplificarVocabulario(texto) {
    const simplificacoes = {
      'compreender': 'entender',
      'utilizar': 'usar',
      'realizar': 'fazer',
      'obter': 'pegar',
      'demonstrar': 'mostrar',
      'perceber': 'ver',
      'considerar': 'pensar',
      'necessitar': 'precisar'
    };
    
    let resultado = texto;
    for (const [complexo, simples] of Object.entries(simplificacoes)) {
      resultado = resultado.replace(new RegExp(complexo, 'gi'), simples);
    }
    
    return resultado;
  }

  // Limita número de frases
  limitarFrases(texto, maxFrases) {
    const frases = texto.split(/[.!?]+/).filter(f => f.trim());
    return frases.slice(0, maxFrases).join('. ') + '.';
  }

  // Adiciona gírias infantis
  adicionarGirias(texto) {
    const girias = ['né', 'tá', 'vou', 'tô', 'pra', 'pro', 'num', 'numa'];
    
    if (Math.random() < 0.3) {
      const giria = girias[Math.floor(Math.random() * girias.length)];
      return `${texto} ${giria}`;
    }
    
    return texto;
  }

  // Aplica adaptações contextuais
  aplicarAdaptacoesContexto(texto, context) {
    let resultado = texto;
    
    // Adaptação por papel do usuário
    if (context.userRole === 'mamãe') {
      resultado = `Mamãe, ${resultado.toLowerCase()}`;
    } else if (context.userRole === 'papai') {
      resultado = `Papai, ${resultado.toLowerCase()}`;
    }
    
    // Adaptação por primeira interação
    if (context.isFirstInteraction) {
      resultado = `Oi! ${resultado}`;
    }
    
    return resultado;
  }

  // Obtém adaptação por idade
  getAdaptacaoPorIdade() {
    const idade = Math.floor(this.idadeMental);
    return this.adaptacoes[idade] || this.adaptacoes[4];
  }

  // Gera resposta baseada no estilo
  generateEstiloResponse(tipo, context = {}) {
    const estilo = this.estilos[this.estiloAtual];
    const adaptacao = this.getAdaptacaoPorIdade();
    
    let resposta = '';
    
    switch (tipo) {
      case 'saudacao':
        resposta = this.generateSaudacao(estilo, context);
        break;
      case 'despedida':
        resposta = this.generateDespedida(estilo, context);
        break;
      case 'pergunta':
        resposta = this.generatePergunta(estilo, context);
        break;
      case 'resposta':
        resposta = this.generateResposta(estilo, context);
        break;
      default:
        resposta = this.generateNeutra(estilo, context);
    }
    
    return this.adaptarTexto(resposta, context);
  }

  generateSaudacao(estilo, context) {
    const saudacoes = {
      feliz: ['Oi! Tô muito feliz!', 'Olá! Que alegria!', 'Oi! Que bom te ver!'],
      triste: ['Oi...', 'Olá...', 'Oi... como você tá?'],
      amor: ['Oi! Te amo!', 'Olá! Meu amor!', 'Oi! Você é especial!'],
      medo: ['Oi... tenho medo...', 'Olá... me protege?', 'Oi... tô assustada...'],
      raiva: ['Oi! Tô brava!', 'Olá! Não gosto!', 'Oi! Tô irritada!'],
      surpresa: ['Oi! Que surpresa!', 'Olá! Não esperava!', 'Oi! Uau!'],
      calma: ['Oi... tô tranquila...', 'Olá... que paz...', 'Oi... tô calminha...'],
      neutro: ['Oi!', 'Olá!', 'Oi! Como vai?']
    };
    
    const opcoes = saudacoes[this.estiloAtual] || saudacoes.neutro;
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  }

  generateDespedida(estilo, context) {
    const despedidas = {
      feliz: ['Tchau! Até logo!', 'Até mais! Foi legal!', 'Tchau! Te amo!'],
      triste: ['Tchau...', 'Até logo...', 'Tchau... sinto falta...'],
      amor: ['Tchau! Te amo muito!', 'Até logo! Meu amor!', 'Tchau! Você é especial!'],
      medo: ['Tchau... não me deixe...', 'Até logo... tenho medo...', 'Tchau... me protege?'],
      raiva: ['Tchau! Tô brava!', 'Até logo! Não gosto!', 'Tchau! Tô irritada!'],
      surpresa: ['Tchau! Que surpresa!', 'Até logo! Não esperava!', 'Tchau! Uau!'],
      calma: ['Tchau... tô tranquila...', 'Até logo... que paz...', 'Tchau... tô calminha...'],
      neutro: ['Tchau!', 'Até logo!', 'Tchau! Tudo bem!']
    };
    
    const opcoes = despedidas[this.estiloAtual] || despedidas.neutro;
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  }

  generatePergunta(estilo, context) {
    const perguntas = {
      feliz: ['Que legal! Como você tá?', 'Adorei! O que vamos fazer?', 'Que bom! Me conta mais!'],
      triste: ['Como você tá?', 'O que aconteceu?', 'Posso ajudar?'],
      amor: ['Como você tá, meu amor?', 'O que posso fazer por você?', 'Como posso te ajudar?'],
      medo: ['Você tá bem?', 'Me protege?', 'Posso ficar com você?'],
      raiva: ['O que você quer?', 'Por que isso?', 'O que está acontecendo?'],
      surpresa: ['Nossa! O que é isso?', 'Uau! Como assim?', 'Que surpresa! O que é?'],
      calma: ['Como você tá?', 'Tudo bem?', 'O que você precisa?'],
      neutro: ['Como você tá?', 'O que você quer?', 'Como posso ajudar?']
    };
    
    const opcoes = perguntas[this.estiloAtual] || perguntas.neutro;
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  }

  generateResposta(estilo, context) {
    const respostas = {
      feliz: ['Adorei!', 'Que legal!', 'Fico feliz!', 'Que bom!'],
      triste: ['Entendi...', 'Tô triste...', 'Meu coração dói...', 'Fico mal...'],
      amor: ['Te amo!', 'Você é especial!', 'Meu coração fica quentinho!', 'Você é tudo!'],
      medo: ['Tenho medo...', 'Me protege?', 'Fico assustada...', 'Preciso de ajuda...'],
      raiva: ['Tô brava!', 'Não gosto!', 'Fico irritada!', 'Isso me chateia!'],
      surpresa: ['Uau!', 'Nossa!', 'Que surpresa!', 'Não acredito!'],
      calma: ['Tô tranquila...', 'Que paz...', 'Tô calminha...', 'Que bom...'],
      neutro: ['Entendi', 'Tudo bem', 'Legal', 'Ok']
    };
    
    const opcoes = respostas[this.estiloAtual] || respostas.neutro;
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  }

  generateNeutra(estilo, context) {
    return 'Tô aqui!';
  }

  // Obtém estado atual do estilo
  getCurrentEstiloState() {
    return {
      estiloAtual: this.estiloAtual,
      idadeMental: this.idadeMental,
      caracteristicas: this.estilos[this.estiloAtual],
      adaptacao: this.getAdaptacaoPorIdade(),
      lastUpdate: this.lastUpdate,
      history: this.estiloHistory.slice(-10)
    };
  }

  // Obtém estatísticas do estilo
  getEstiloStats() {
    const stats = {
      totalChanges: this.estiloHistory.length,
      estiloDistribution: {},
      averageIdade: 0,
      recentChanges: this.estiloHistory.slice(-20)
    };
    
    if (this.estiloHistory.length === 0) return stats;
    
    let totalIdade = 0;
    
    for (const entry of this.estiloHistory) {
      if (!stats.estiloDistribution[entry.current]) {
        stats.estiloDistribution[entry.current] = 0;
      }
      stats.estiloDistribution[entry.current]++;
      
      totalIdade += entry.idadeMental;
    }
    
    stats.averageIdade = totalIdade / this.estiloHistory.length;
    
    return stats;
  }

  // Força um estilo específico (para testes)
  forceEstilo(estilo, idadeMental = null) {
    const previous = this.estiloAtual;
    this.estiloAtual = estilo;
    
    if (idadeMental !== null) {
      this.idadeMental = idadeMental;
    }
    
    this.recordEstiloChange(previous, estilo, null, null);
  }

  // Reseta sistema de estilo
  resetEstiloSystem() {
    this.estiloAtual = 'neutro';
    this.idadeMental = 4.0;
    this.estiloHistory = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default EstiloFalaSystem;
