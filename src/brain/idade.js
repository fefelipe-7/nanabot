// src/brain/idade.js - Sistema de Idade da Nanabot
// Gerencia desenvolvimento cognitivo e capacidades por idade mental

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IdadeSystem {
  constructor() {
    this.idadeMental = 4.0;
    this.idadeFisica = 4.0;
    this.desenvolvimento = this.initializeDesenvolvimento();
    this.marcos = [];
    this.capacidades = this.initializeCapacidades();
    this.limitacoes = this.initializeLimitacoes();
    this.lastUpdate = new Date().toISOString();
    this.loadIdadeState();
  }

  // Inicializa estágios de desenvolvimento
  initializeDesenvolvimento() {
    return {
      2: {
        nome: 'Bebê',
        caracteristicas: {
          vocabulario: 50,
          frases: 1,
          concentracao: 2,
          memoria: 1,
          logica: 0.1,
          criatividade: 0.2,
          social: 0.3,
          emocional: 0.4
        },
        comportamentos: ['choro', 'riso', 'curiosidade_basica', 'apego'],
        habilidades: ['reconhecer_pais', 'expressar_basico', 'brincar_simples']
      },
      3: {
        nome: 'Criança Pequena',
        caracteristicas: {
          vocabulario: 200,
          frases: 2,
          concentracao: 5,
          memoria: 2,
          logica: 0.3,
          criatividade: 0.4,
          social: 0.5,
          emocional: 0.6
        },
        comportamentos: ['birra', 'curiosidade', 'imitação', 'brincadeira'],
        habilidades: ['falar_frases', 'brincar_sozinha', 'reconhecer_emocões']
      },
      4: {
        nome: 'Pré-escolar',
        caracteristicas: {
          vocabulario: 500,
          frases: 3,
          concentracao: 10,
          memoria: 3,
          logica: 0.5,
          criatividade: 0.6,
          social: 0.7,
          emocional: 0.8
        },
        comportamentos: ['faz_de_conta', 'perguntas', 'amizades', 'independência'],
        habilidades: ['contar_histórias', 'brincar_grupo', 'expressar_sentimentos']
      },
      5: {
        nome: 'Criança',
        caracteristicas: {
          vocabulario: 1000,
          frases: 4,
          concentracao: 15,
          memoria: 4,
          logica: 0.7,
          criatividade: 0.8,
          social: 0.8,
          emocional: 0.9
        },
        comportamentos: ['aprendizado', 'cooperação', 'regras', 'responsabilidade'],
        habilidades: ['ler_basico', 'escrever_basico', 'resolver_problemas']
      },
      6: {
        nome: 'Criança Grande',
        caracteristicas: {
          vocabulario: 2000,
          frases: 5,
          concentracao: 20,
          memoria: 5,
          logica: 0.9,
          criatividade: 0.9,
          social: 0.9,
          emocional: 0.95
        },
        comportamentos: ['estudo', 'amizades_complexas', 'planejamento', 'autocontrole'],
        habilidades: ['ler_fluente', 'escrever_fluente', 'pensamento_abstrato']
      }
    };
  }

  // Inicializa capacidades por idade
  initializeCapacidades() {
    return {
      2: {
        linguagem: ['palavras_simples', 'gestos', 'sons'],
        cognitivo: ['reconhecimento', 'memoria_curta', 'curiosidade'],
        social: ['apego', 'imitação', 'reconhecimento_familiar'],
        emocional: ['alegria', 'tristeza', 'medo', 'raiva_basica'],
        fisico: ['engatinhar', 'andar', 'pegar_objetos']
      },
      3: {
        linguagem: ['frases_simples', 'perguntas_basicas', 'vocabulario_expandido'],
        cognitivo: ['classificacao_simples', 'sequencia_basica', 'causa_efeito'],
        social: ['brincar_paralelo', 'compartilhar_basico', 'reconhecer_outros'],
        emocional: ['empatia_basica', 'controle_emocional', 'expressao_verbal'],
        fisico: ['correr', 'pular', 'desenhar_rabiscos']
      },
      4: {
        linguagem: ['conversacao', 'histórias', 'perguntas_complexas'],
        cognitivo: ['classificacao', 'sequencia', 'causa_efeito', 'simbolismo'],
        social: ['brincar_cooperativo', 'amizades', 'regras_simples'],
        emocional: ['empatia', 'controle_emocional', 'expressao_complexa'],
        fisico: ['desenhar_formas', 'cortar', 'escrever_letras']
      },
      5: {
        linguagem: ['narrativa', 'explicacoes', 'argumentacao'],
        cognitivo: ['classificacao_complexa', 'sequencia_complexa', 'logica'],
        social: ['cooperacao', 'lideranca', 'resolucao_conflitos'],
        emocional: ['empatia_avancada', 'autocontrole', 'expressao_sophisticada'],
        fisico: ['escrever_palavras', 'ler_basico', 'atividades_complexas']
      },
      6: {
        linguagem: ['narrativa_complexa', 'explicacoes_detalhadas', 'argumentacao_sophisticada'],
        cognitivo: ['pensamento_abstrato', 'logica_complexa', 'resolucao_problemas'],
        social: ['lideranca_avancada', 'cooperacao_complexa', 'resolucao_conflitos_avancada'],
        emocional: ['empatia_sophisticada', 'autocontrole_avancado', 'expressao_matura'],
        fisico: ['escrever_fluente', 'ler_fluente', 'atividades_avancadas']
      }
    };
  }

  // Inicializa limitações por idade
  initializeLimitacoes() {
    return {
      2: {
        linguagem: ['vocabulario_limitado', 'frases_curtas', 'pronuncia_incorreta'],
        cognitivo: ['concentracao_curta', 'memoria_limitada', 'logica_basica'],
        social: ['egocentrismo', 'dificuldade_compartilhar', 'apego_excessivo'],
        emocional: ['controle_limitado', 'expressao_basica', 'regulacao_dificil'],
        fisico: ['coordenacao_limitada', 'forca_limitada', 'resistencia_baixa']
      },
      3: {
        linguagem: ['gramatica_simples', 'vocabulario_basico', 'pronuncia_em_desenvolvimento'],
        cognitivo: ['concentracao_curta', 'memoria_limitada', 'logica_simples'],
        social: ['egocentrismo_parcial', 'dificuldade_cooperacao', 'apego_forte'],
        emocional: ['controle_parcial', 'expressao_simples', 'regulacao_dificil'],
        fisico: ['coordenacao_em_desenvolvimento', 'forca_limitada', 'resistencia_baixa']
      },
      4: {
        linguagem: ['gramatica_em_desenvolvimento', 'vocabulario_em_expansao', 'pronuncia_em_desenvolvimento'],
        cognitivo: ['concentracao_media', 'memoria_em_desenvolvimento', 'logica_em_desenvolvimento'],
        social: ['egocentrismo_parcial', 'cooperacao_em_desenvolvimento', 'apego_equilibrado'],
        emocional: ['controle_em_desenvolvimento', 'expressao_em_desenvolvimento', 'regulacao_em_desenvolvimento'],
        fisico: ['coordenacao_em_desenvolvimento', 'forca_em_desenvolvimento', 'resistencia_em_desenvolvimento']
      },
      5: {
        linguagem: ['gramatica_em_desenvolvimento', 'vocabulario_em_expansao', 'pronuncia_em_desenvolvimento'],
        cognitivo: ['concentracao_boa', 'memoria_boa', 'logica_boa'],
        social: ['egocentrismo_minimo', 'cooperacao_boa', 'apego_equilibrado'],
        emocional: ['controle_boa', 'expressao_boa', 'regulacao_boa'],
        fisico: ['coordenacao_boa', 'forca_boa', 'resistencia_boa']
      },
      6: {
        linguagem: ['gramatica_boa', 'vocabulario_rico', 'pronuncia_boa'],
        cognitivo: ['concentracao_excelente', 'memoria_excelente', 'logica_excelente'],
        social: ['egocentrismo_minimo', 'cooperacao_excelente', 'apego_equilibrado'],
        emocional: ['controle_excelente', 'expressao_excelente', 'regulacao_excelente'],
        fisico: ['coordenacao_excelente', 'forca_excelente', 'resistencia_excelente']
      }
    };
  }

  // Carrega estado da idade
  loadIdadeState() {
    try {
      const idadePath = path.resolve(__dirname, '../../data/idadeState.json');
      if (fs.existsSync(idadePath)) {
        const data = fs.readFileSync(idadePath, 'utf-8');
        const state = JSON.parse(data);
        
        this.idadeMental = state.idadeMental || 4.0;
        this.idadeFisica = state.idadeFisica || 4.0;
        this.marcos = state.marcos || [];
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
      }
    } catch (error) {
      console.error('Erro ao carregar estado da idade:', error);
    }
  }

  // Salva estado da idade
  saveIdadeState() {
    try {
      const idadePath = path.resolve(__dirname, '../../data/idadeState.json');
      const state = {
        idadeMental: this.idadeMental,
        idadeFisica: this.idadeFisica,
        marcos: this.marcos.slice(-100), // Últimos 100 marcos
        lastUpdate: this.lastUpdate
      };
      fs.writeFileSync(idadePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado da idade:', error);
    }
  }

  // Atualiza idade mental
  updateIdadeMental(change, reason = '') {
    const previousIdade = this.idadeMental;
    this.idadeMental = Math.max(0, Math.min(10, this.idadeMental + change));
    
    // Verifica se houve mudança de estágio
    const previousEstagio = this.getEstagioDesenvolvimento(previousIdade);
    const currentEstagio = this.getEstagioDesenvolvimento(this.idadeMental);
    
    if (previousEstagio !== currentEstagio) {
      this.recordMarcoDesenvolvimento(previousEstagio, currentEstagio, reason);
    }
    
    this.lastUpdate = new Date().toISOString();
    this.saveIdadeState();
    
    return {
      previous: previousIdade,
      current: this.idadeMental,
      change: change,
      estagioChange: previousEstagio !== currentEstagio,
      newEstagio: currentEstagio
    };
  }

  // Obtém estágio de desenvolvimento
  getEstagioDesenvolvimento(idade) {
    const estagios = Object.keys(this.desenvolvimento).map(Number).sort((a, b) => a - b);
    
    for (let i = estagios.length - 1; i >= 0; i--) {
      if (idade >= estagios[i]) {
        return estagios[i];
      }
    }
    
    return estagios[0];
  }

  // Registra marco de desenvolvimento
  recordMarcoDesenvolvimento(previousEstagio, currentEstagio, reason) {
    const marco = {
      timestamp: new Date().toISOString(),
      previousEstagio,
      currentEstagio,
      idadeMental: this.idadeMental,
      reason: reason || 'Desenvolvimento natural',
      tipo: 'desenvolvimento'
    };
    
    this.marcos.push(marco);
    
    // Mantém histórico limitado
    if (this.marcos.length > 200) {
      this.marcos = this.marcos.slice(-200);
    }
  }

  // Obtém capacidades atuais
  getCapacidadesAtuais() {
    const estagio = this.getEstagioDesenvolvimento(this.idadeMental);
    return this.capacidades[estagio] || this.capacidades[4];
  }

  // Obtém limitações atuais
  getLimitacoesAtuais() {
    const estagio = this.getEstagioDesenvolvimento(this.idadeMental);
    return this.limitacoes[estagio] || this.limitacoes[4];
  }

  // Obtém características atuais
  getCaracteristicasAtuais() {
    const estagio = this.getEstagioDesenvolvimento(this.idadeMental);
    return this.desenvolvimento[estagio] || this.desenvolvimento[4];
  }

  // Verifica se tem capacidade específica
  hasCapacidade(capacidade) {
    const capacidades = this.getCapacidadesAtuais();
    
    for (const categoria in capacidades) {
      if (capacidades[categoria].includes(capacidade)) {
        return true;
      }
    }
    
    return false;
  }

  // Verifica se tem limitação específica
  hasLimitacao(limitacao) {
    const limitacoes = this.getLimitacoesAtuais();
    
    for (const categoria in limitacoes) {
      if (limitacoes[categoria].includes(limitacao)) {
        return true;
      }
    }
    
    return false;
  }

  // Obtém nível de capacidade
  getNivelCapacidade(capacidade) {
    const estagio = this.getEstagioDesenvolvimento(this.idadeMental);
    const caracteristicas = this.getCaracteristicasAtuais();
    
    // Mapeia capacidades para características
    const mapeamento = {
      'linguagem': 'vocabulario',
      'cognitivo': 'logica',
      'social': 'social',
      'emocional': 'emocional',
      'fisico': 'concentracao'
    };
    
    const categoria = this.getCategoriaCapacidade(capacidade);
    const caracteristica = mapeamento[categoria];
    
    if (caracteristica && caracteristicas.caracteristicas[caracteristica]) {
      return caracteristicas.caracteristicas[caracteristica];
    }
    
    return 0.5; // Padrão
  }

  // Obtém categoria da capacidade
  getCategoriaCapacidade(capacidade) {
    const capacidades = this.getCapacidadesAtuais();
    
    for (const categoria in capacidades) {
      if (capacidades[categoria].includes(capacidade)) {
        return categoria;
      }
    }
    
    return 'cognitivo';
  }

  // Gera resposta baseada na idade
  generateIdadeResponse(tipo, context = {}) {
    const estagio = this.getEstagioDesenvolvimento(this.idadeMental);
    const caracteristicas = this.getCaracteristicasAtuais();
    const capacidades = this.getCapacidadesAtuais();
    
    let resposta = '';
    
    switch (tipo) {
      case 'apresentacao':
        resposta = this.generateApresentacao(estagio, caracteristicas);
        break;
      case 'pergunta':
        resposta = this.generatePergunta(estagio, caracteristicas);
        break;
      case 'explicacao':
        resposta = this.generateExplicacao(estagio, caracteristicas);
        break;
      case 'brincadeira':
        resposta = this.generateBrincadeira(estagio, capacidades);
        break;
      default:
        resposta = this.generateNeutra(estagio, caracteristicas);
    }
    
    return this.adaptarRespostaPorIdade(resposta, estagio);
  }

  generateApresentacao(estagio, caracteristicas) {
    const apresentacoes = {
      2: 'Oi! Sou bebê!',
      3: 'Oi! Sou criança pequena!',
      4: 'Oi! Sou pré-escolar!',
      5: 'Oi! Sou criança!',
      6: 'Oi! Sou criança grande!'
    };
    
    return apresentacoes[estagio] || 'Oi! Sou criança!';
  }

  generatePergunta(estagio, caracteristicas) {
    const perguntas = {
      2: ['O que é isso?', 'Por quê?', 'Como?'],
      3: ['Por que isso?', 'Como funciona?', 'O que é?'],
      4: ['Por que isso acontece?', 'Como isso funciona?', 'O que significa?'],
      5: ['Por que isso é assim?', 'Como posso entender isso?', 'O que isso significa?'],
      6: ['Por que isso funciona assim?', 'Como posso aprender mais?', 'O que posso fazer?']
    };
    
    const opcoes = perguntas[estagio] || perguntas[4];
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  }

  generateExplicacao(estagio, caracteristicas) {
    const explicacoes = {
      2: 'Não sei...',
      3: 'Acho que é...',
      4: 'Eu penso que...',
      5: 'Eu acredito que...',
      6: 'Baseado no que sei...'
    };
    
    return explicacoes[estagio] || 'Eu penso que...';
  }

  generateBrincadeira(estagio, capacidades) {
    const brincadeiras = {
      2: ['Vamos brincar?', 'Que legal!', 'Vamos fazer?'],
      3: ['Vamos brincar de quê?', 'Que divertido!', 'Vamos criar?'],
      4: ['Vamos brincar de faz de conta?', 'Que ideia legal!', 'Vamos inventar?'],
      5: ['Vamos brincar de quê?', 'Que ideia criativa!', 'Vamos explorar?'],
      6: ['Vamos brincar de quê?', 'Que ideia interessante!', 'Vamos descobrir?']
    };
    
    const opcoes = brincadeiras[estagio] || brincadeiras[4];
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  }

  generateNeutra(estagio, caracteristicas) {
    return 'Tô aqui!';
  }

  // Adapta resposta por idade
  adaptarRespostaPorIdade(resposta, estagio) {
    let adaptada = resposta;
    
    // Adapta vocabulário
    if (estagio <= 3) {
      adaptada = this.simplificarVocabulario(adaptada);
    }
    
    // Adapta complexidade
    if (estagio <= 4) {
      adaptada = this.simplificarComplexidade(adaptada);
    }
    
    // Adiciona elementos infantis
    if (estagio <= 5) {
      adaptada = this.adicionarElementosInfantis(adaptada);
    }
    
    return adaptada;
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

  // Simplifica complexidade
  simplificarComplexidade(texto) {
    // Remove frases complexas
    const frases = texto.split(/[.!?]+/).filter(f => f.trim());
    return frases.slice(0, 2).join('. ') + '.';
  }

  // Adiciona elementos infantis
  adicionarElementosInfantis(texto) {
    const elementos = ['né', 'tá', 'vou', 'tô', 'pra', 'pro'];
    
    if (Math.random() < 0.3) {
      const elemento = elementos[Math.floor(Math.random() * elementos.length)];
      return `${texto} ${elemento}`;
    }
    
    return texto;
  }

  // Obtém descrição da idade
  getDescricaoIdade() {
    const estagio = this.getEstagioDesenvolvimento(this.idadeMental);
    const desenvolvimento = this.desenvolvimento[estagio];
    
    return {
      estagio,
      nome: desenvolvimento.nome,
      idadeMental: this.idadeMental,
      idadeFisica: this.idadeFisica,
      caracteristicas: desenvolvimento.caracteristicas,
      comportamentos: desenvolvimento.comportamentos,
      habilidades: desenvolvimento.habilidades
    };
  }

  // Obtém estatísticas da idade
  getIdadeStats() {
    const stats = {
      idadeMental: this.idadeMental,
      idadeFisica: this.idadeFisica,
      estagioAtual: this.getEstagioDesenvolvimento(this.idadeMental),
      totalMarcos: this.marcos.length,
      marcosRecentes: this.marcos.slice(-10),
      capacidades: this.getCapacidadesAtuais(),
      limitacoes: this.getLimitacoesAtuais(),
      caracteristicas: this.getCaracteristicasAtuais()
    };
    
    return stats;
  }

  // Força uma idade específica (para testes)
  forceIdade(idadeMental, idadeFisica = null) {
    const previous = this.idadeMental;
    this.idadeMental = Math.max(0, Math.min(10, idadeMental));
    
    if (idadeFisica !== null) {
      this.idadeFisica = Math.max(0, Math.min(10, idadeFisica));
    }
    
    this.recordMarcoDesenvolvimento(
      this.getEstagioDesenvolvimento(previous),
      this.getEstagioDesenvolvimento(this.idadeMental),
      'Forçado para teste'
    );
  }

  // Reseta sistema de idade
  resetIdadeSystem() {
    this.idadeMental = 4.0;
    this.idadeFisica = 4.0;
    this.marcos = [];
    this.lastUpdate = new Date().toISOString();
  }
}

export default IdadeSystem;
