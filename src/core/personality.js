// personality.js — Núcleo de Personalidade da Nanabot
// Carrega frases, regras, traços, perfis emocionais e estado persistente
// Suporta atributos privados, mutabilidade, funções auxiliares e integração

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.resolve(process.cwd(), 'data', 'personalityState.json');
const PHRASES_PATH = path.resolve(process.cwd(), 'src', 'brain', 'personality', 'phrases.json');
const RULES_PATH = path.resolve(process.cwd(), 'src', 'brain', 'personality', 'rules.json');
const TRAITS_PATH = path.resolve(process.cwd(), 'src', 'brain', 'personality', 'traits.json');
const EMOTIONAL_PROFILES_PATH = path.resolve(process.cwd(), 'src', 'brain', 'personality', 'emotionalProfiles.json');

let state = {};
let phrases = {};
let rules = {};
let traits = {};
let emotionalProfiles = {};

function loadAll() {
  state = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  phrases = JSON.parse(fs.readFileSync(PHRASES_PATH, 'utf-8'));
  rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'));
  traits = JSON.parse(fs.readFileSync(TRAITS_PATH, 'utf-8'));
  emotionalProfiles = JSON.parse(fs.readFileSync(EMOTIONAL_PROFILES_PATH, 'utf-8'));
}

function saveState() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
}

// Funções auxiliares
export function getTrait(nome) {
  return traits[nome] ?? null;
}

export function setTrait(nome, valor) {
  traits[nome] = valor;
  state[nome] = valor;
  saveState();
}

export function getFraseAfetiva(contexto) {
  const arr = phrases[contexto] || [];
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getMedos() {
  return state.privado?.medos || [];
}

export function getRegra(situacao) {
  return rules[situacao] || null;
}

export function getPersonalidadeCompleta() {
  return {
    ...state,
    traits,
    emotionalProfiles,
    phrases,
    rules
  };
}

export function describePersonality() {
  // Exemplo simples, pode ser expandido
  const curiosidade = getTrait('curiosidade');
  const timidez = getTrait('timidez');
  const empatia = getTrait('empatia');
  return `A Nana é ${curiosidade > 70 ? 'muito curiosa' : 'um pouco curiosa'}, ${timidez > 60 ? 'tímida' : 'extrovertida'} e tem empatia ${empatia > 80 ? 'enorme' : 'moderada'}.`;
}

export function resetPersonality() {
  // Mantém medos, traumas e limites, reseta traços mutáveis
  const base = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  for (const key of Object.keys(state)) {
    if (key !== 'privado') state[key] = base[key];
  }
  saveState();
}

export function applyEventToPersonality(evento) {
  // Exemplo: evento = { tipo: 'carinho', intensidade: 0.8 }
  if (evento.tipo === 'carinho') {
    setTrait('empatia', Math.min(100, getTrait('empatia') + evento.intensidade * 5));
    setTrait('autonomia', Math.min(100, getTrait('autonomia') + evento.intensidade * 2));
  }
  if (evento.tipo === 'trauma') {
    setTrait('timidez', Math.min(100, getTrait('timidez') + evento.intensidade * 10));
    // Adiciona trauma ao privado
    state.privado.traumas.push(evento.descricao || 'trauma desconhecido');
  }
  saveState();
}

// Carregar tudo ao importar
loadAll();

// Exemplo de uso:
// getTrait('curiosidade');
// setTrait('curiosidade', 90);
// getFraseAfetiva('carinho');
// getMedos();
// getRegra('quando_estiver_triste');
// getPersonalidadeCompleta();
// describePersonality();
// resetPersonality();
// applyEventToPersonality({ tipo: 'carinho', intensidade: 0.7 });
