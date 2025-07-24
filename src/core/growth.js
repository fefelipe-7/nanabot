import fs from 'fs';
import path from 'path';

const statePath = path.resolve(__dirname, '../../data/growthState.json');

function loadState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
}

function saveState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function getIdadeMental() {
  return loadState().idadeMental;
}

function getIdadeFormatada() {
  const idade = loadState().idadeMental;
  const anos = Math.floor(idade);
  const mesesFloat = (idade - anos) * 12;
  const meses = Math.floor(mesesFloat);
  const dias = Math.round((mesesFloat - meses) * 30.44);
  let out = '';
  if (anos > 0) out += anos + (anos === 1 ? ' aninho' : ' aninhos');
  if (meses > 0) out += (out ? ', ' : '') + meses + (meses === 1 ? ' mês' : ' meses');
  if (dias > 0) out += (out ? ' e ' : '') + dias + (dias === 1 ? ' dia' : ' dias');
  if (!out) out = 'menos de um dia!';
  return `Tenho ${out}!`;
}

function addMarco({ data, descricao, impacto, tipo }) {
  const state = loadState();
  state.marcos.push({ data, descricao, impacto, tipo });
  saveState(state);
}

function getMarcos(tipo = null) {
  const marcos = loadState().marcos;
  return tipo ? marcos.filter(m => m.tipo === tipo) : marcos;
}

function atualizarCrescimento({ impacto = 'positivo', intensidade = 0.01, descricao = '', tipo = 'emocional', data = new Date().toISOString() }) {
  const state = loadState();
  let delta = intensidade;
  if (impacto === 'negativo') delta = -Math.abs(intensidade);
  state.idadeMental = Math.max(0, +(state.idadeMental + delta).toFixed(4));
  if (descricao) {
    state.marcos.push({ data, descricao, impacto, tipo });
  }
  state.dataUltimoUpdate = data;
  saveState(state);
}

function regredirIdade({ motivo = '', intensidade = 0.01, tipo = 'regressivo', data = new Date().toISOString() }) {
  atualizarCrescimento({ impacto: 'negativo', intensidade, descricao: motivo, tipo, data });
}

function getResumoCrescimento() {
  const state = loadState();
  const idade = getIdadeFormatada();
  const totalMarcos = state.marcos.length;
  const positivos = state.marcos.filter(m => m.impacto === 'positivo').length;
  const negativos = state.marcos.filter(m => m.impacto === 'negativo').length;
  return `Sou uma menininha de ${idade} Já vivi ${totalMarcos} marcos importantes: ${positivos} positivos e ${negativos} negativos. Cada experiência me faz crescer (ou às vezes regredir), mas sempre com muito amor!`;
}

function resetGrowth() {
  const initial = {
    idadeMental: 4.0,
    dataUltimoUpdate: new Date().toISOString(),
    marcos: []
  };
  saveState(initial);
}

export {
  getIdadeMental,
  getIdadeFormatada,
  atualizarCrescimento,
  regredirIdade,
  getMarcos,
  addMarco,
  getResumoCrescimento,
  resetGrowth
};
