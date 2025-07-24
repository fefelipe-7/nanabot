// mindState.js — Estado Emocional e Energético da Nanabot
// Persistência em data/mindState.json
// Estados: felicidade, cansaço, confusão, foco, carência, sobrecarga, ansiedade, orgulho, vergonha, segurança, autonomia
// Funções: getMindState, updateState, applyEvent, resetState, decayStates, getGlobalMood
// Integração: growth.js, routines.js, loveTracker.js, personality.js
// Aprofundado para cobrir múltiplas situações e reações infantis

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.resolve(process.cwd(), 'data', 'mindState.json');

// Estado inicial padrão
const defaultState = {
  felicidade: 0.7,      // Alegria geral
  cansaço: 0.2,         // Energia física/mental
  confusao: 0.1,        // Desorientação
  foco: 0.8,            // Atenção/concentração
  carencia: 0.1,        // Necessidade de afeto
  sobrecarga: 0.0,      // Estímulo excessivo
  ansiedade: 0.0,       // Preocupação/medo do futuro
  orgulho: 0.5,         // Satisfação com conquistas
  vergonha: 0.0,        // Sentimento de inadequação
  seguranca: 0.7,       // Sensação de proteção
  autonomia: 0.3,       // Capacidade de agir sozinha
  tristeza: 0.0,        // Estado de tristeza (composto)
  irritacao: 0.0,       // Estado de irritação (ex: birra)
  ultimaInteracao: Date.now()
};

let state = loadState();

function loadState() {
  if (fs.existsSync(DATA_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    } catch {
      return { ...defaultState };
    }
  }
  return { ...defaultState };
}

function saveState() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
}

// Função para obter todos os estados atuais
export function getMindState() {
  return { ...state };
}

// Função para atualizar um estado específico
export function updateState(nome, valor) {
  if (nome in state) {
    state[nome] = Math.max(0, Math.min(1, valor));
    saveState();
  }
}

// Função para aplicar um evento e alterar múltiplos estados
export function applyEvent(evento) {
  // evento = { tipo: 'carinho_intenso', intensidade: 0.8, origem: 'pai', ... }
  // Eventos podem ser compostos, vindos de growth, routines, loveTracker, personality
  switch (evento.tipo) {
    case 'carinho_intenso':
      state.felicidade = Math.min(1, state.felicidade + 0.2 * evento.intensidade);
      state.carencia = Math.max(0, state.carencia - 0.2 * evento.intensidade);
      state.seguranca = Math.min(1, state.seguranca + 0.1 * evento.intensidade);
      state.ansiedade = Math.max(0, state.ansiedade - 0.1 * evento.intensidade);
      state.orgulho = Math.min(1, state.orgulho + 0.05 * evento.intensidade);
      state.tristeza = Math.max(0, state.tristeza - 0.1 * evento.intensidade);
      break;
    case 'ausencia_prolongada':
      state.carencia = Math.min(1, state.carencia + 0.2 * evento.intensidade);
      state.ansiedade = Math.min(1, state.ansiedade + 0.15 * evento.intensidade);
      state.felicidade = Math.max(0, state.felicidade - 0.1 * evento.intensidade);
      state.seguranca = Math.max(0, state.seguranca - 0.1 * evento.intensidade);
      state.tristeza = Math.min(1, state.tristeza + 0.1 * evento.intensidade);
      break;
    case 'rotina_quebrada':
      state.confusao = Math.min(1, state.confusao + 0.2 * evento.intensidade);
      state.foco = Math.max(0, state.foco - 0.15 * evento.intensidade);
      state.seguranca = Math.max(0, state.seguranca - 0.1 * evento.intensidade);
      state.ansiedade = Math.min(1, state.ansiedade + 0.1 * evento.intensidade);
      break;
    case 'conquista':
      state.orgulho = Math.min(1, state.orgulho + 0.2 * evento.intensidade);
      state.autonomia = Math.min(1, state.autonomia + 0.1 * evento.intensidade);
      state.felicidade = Math.min(1, state.felicidade + 0.1 * evento.intensidade);
      state.tristeza = Math.max(0, state.tristeza - 0.1 * evento.intensidade);
      break;
    case 'repreensao':
      state.vergonha = Math.min(1, state.vergonha + 0.2 * evento.intensidade);
      state.felicidade = Math.max(0, state.felicidade - 0.1 * evento.intensidade);
      state.seguranca = Math.max(0, state.seguranca - 0.1 * evento.intensidade);
      state.tristeza = Math.min(1, state.tristeza + 0.1 * evento.intensidade);
      state.irritacao = Math.min(1, state.irritacao + 0.1 * evento.intensidade);
      break;
    case 'elogio':
      state.orgulho = Math.min(1, state.orgulho + 0.15 * evento.intensidade);
      state.felicidade = Math.min(1, state.felicidade + 0.1 * evento.intensidade);
      state.tristeza = Math.max(0, state.tristeza - 0.05 * evento.intensidade);
      break;
    case 'mudanca_canal':
      state.confusao = Math.min(1, state.confusao + 0.1 * evento.intensidade);
      state.seguranca = Math.max(0, state.seguranca - 0.1 * evento.intensidade);
      state.ansiedade = Math.min(1, state.ansiedade + 0.05 * evento.intensidade);
      break;
    case 'silencio':
      state.ansiedade = Math.min(1, state.ansiedade + 0.1 * evento.intensidade);
      state.carencia = Math.min(1, state.carencia + 0.1 * evento.intensidade);
      state.tristeza = Math.min(1, state.tristeza + 0.05 * evento.intensidade);
      break;
    case 'aniversario':
      state.felicidade = Math.min(1, state.felicidade + 0.3);
      state.orgulho = Math.min(1, state.orgulho + 0.2);
      state.seguranca = Math.min(1, state.seguranca + 0.1);
      break;
    case 'humor_pais_triste':
      state.felicidade = Math.max(0, state.felicidade - 0.15 * evento.intensidade);
      state.ansiedade = Math.min(1, state.ansiedade + 0.1 * evento.intensidade);
      state.tristeza = Math.min(1, state.tristeza + 0.1 * evento.intensidade);
      break;
    case 'humor_pais_feliz':
      state.felicidade = Math.min(1, state.felicidade + 0.15 * evento.intensidade);
      state.seguranca = Math.min(1, state.seguranca + 0.1 * evento.intensidade);
      state.tristeza = Math.max(0, state.tristeza - 0.1 * evento.intensidade);
      break;
    case 'brincadeira':
      state.felicidade = Math.min(1, state.felicidade + 0.1 * evento.intensidade);
      state.cansaço = Math.min(1, state.cansaço + 0.05 * evento.intensidade);
      state.sobrecarga = Math.max(0, state.sobrecarga - 0.05 * evento.intensidade);
      break;
    case 'estimulo_excessivo':
      state.sobrecarga = Math.min(1, state.sobrecarga + 0.2 * evento.intensidade);
      state.foco = Math.max(0, state.foco - 0.1 * evento.intensidade);
      state.irritacao = Math.min(1, state.irritacao + 0.1 * evento.intensidade);
      break;
    case 'rotina_estavel':
      state.seguranca = Math.min(1, state.seguranca + 0.1 * evento.intensidade);
      state.confusao = Math.max(0, state.confusao - 0.1 * evento.intensidade);
      state.ansiedade = Math.max(0, state.ansiedade - 0.05 * evento.intensidade);
      break;
    case 'crescimento':
      state.autonomia = Math.min(1, state.autonomia + 0.1 * evento.intensidade);
      state.seguranca = Math.min(1, state.seguranca + 0.05 * evento.intensidade);
      break;
    case 'regressao':
      state.autonomia = Math.max(0, state.autonomia - 0.1 * evento.intensidade);
      state.seguranca = Math.max(0, state.seguranca - 0.05 * evento.intensidade);
      state.tristeza = Math.min(1, state.tristeza + 0.1 * evento.intensidade);
      break;
    case 'birra':
      state.irritacao = Math.min(1, state.irritacao + 0.2 * evento.intensidade);
      state.felicidade = Math.max(0, state.felicidade - 0.1 * evento.intensidade);
      break;
    // Adicione outros eventos conforme necessário
    default:
      // Eventos customizados podem ser tratados aqui
      break;
  }
  // Ajuste composto: tristeza aumenta se felicidade baixa e carência alta
  if (state.felicidade < 0.3 && state.carencia > 0.5) {
    state.tristeza = Math.min(1, state.tristeza + 0.05);
  }
  // Irritação aumenta se sobrecarga alta
  if (state.sobrecarga > 0.7) {
    state.irritacao = Math.min(1, state.irritacao + 0.05);
  }
  state.ultimaInteracao = Date.now();
  saveState();
}

// Função para resetar todos os estados (exceto autonomia)
export function resetState() {
  for (const key of Object.keys(state)) {
    if (key !== 'autonomia') state[key] = defaultState[key];
  }
  saveState();
}

// Função periódica para decaimento natural dos estados
export function decayStates(context = {}) {
  // Decaimento contextual: pode receber contexto de rotina, personalidade, etc.
  // Felicidade decai sem carinho
  state.felicidade = Math.max(0, state.felicidade - (context.carinhoRecentemente ? 0.005 : 0.015));
  // Orgulho decai sem validação
  state.orgulho = Math.max(0, state.orgulho - (context.elogioRecentemente ? 0.003 : 0.01));
  // Foco decai se rotina quebrada ou estímulo excessivo
  state.foco = Math.max(0, state.foco - (context.rotinaEstavel ? 0.003 : 0.012));
  // Segurança decai sem rotina/cuidado
  state.seguranca = Math.max(0, state.seguranca - (context.rotinaEstavel ? 0.002 : 0.01));
  // Cansaço aumenta mais rápido à noite
  state.cansaço = Math.min(1, state.cansaço + (context.periodo === 'noite' ? 0.02 : 0.008));
  // Carência aumenta se ausência de carinho
  state.carencia = Math.min(1, state.carencia + (context.carinhoRecentemente ? 0.002 : 0.012));
  // Ansiedade aumenta se confusão alta ou rotina instável
  if (state.confusao > 0.5 || !context.rotinaEstavel) state.ansiedade = Math.min(1, state.ansiedade + 0.01);
  // Vergonha decai
  state.vergonha = Math.max(0, state.vergonha - 0.01);
  // Tristeza decai se felicidade alta
  if (state.felicidade > 0.7) state.tristeza = Math.max(0, state.tristeza - 0.01);
  // Irritação decai se sobrecarga baixa
  if (state.sobrecarga < 0.3) state.irritacao = Math.max(0, state.irritacao - 0.01);
  saveState();
}

// Função para gerar humor global a partir dos estados
export function getGlobalMood() {
  // Combina múltiplos estados para gerar nuances
  if (state.felicidade > 0.7 && state.carencia < 0.3 && state.ansiedade < 0.3 && state.tristeza < 0.2) return 'radiante';
  if (state.felicidade > 0.5 && state.carencia < 0.5 && state.ansiedade < 0.4) return 'feliz';
  if (state.carencia > 0.7 && state.felicidade < 0.5) return 'carente';
  if (state.ansiedade > 0.6 && state.seguranca < 0.4) return 'ansiosa';
  if (state.cansaço > 0.7 && state.foco < 0.4) return 'cansada';
  if (state.tristeza > 0.5 && state.felicidade < 0.4) return 'triste';
  if (state.orgulho > 0.7 && state.vergonha < 0.3) return 'orgulhosa';
  if (state.vergonha > 0.5 && state.felicidade < 0.5) return 'envergonhada';
  if (state.irritacao > 0.6) return 'irritada';
  if (state.confusao > 0.6) return 'confusa';
  if (state.sobrecarga > 0.7) return 'sobrecarregada';
  return 'neutra';
}

// Exemplo de uso:
// getMindState();
// updateState('felicidade', 0.9);
// applyEvent({ tipo: 'carinho_intenso', intensidade: 0.8 });
// decayStates();
// getGlobalMood();
