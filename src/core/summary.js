import fs from 'fs';
import path from 'path';
import { getMindState, getGlobalMood } from './mindState.js';
import { getRecentMemories } from './memory.js';
// As funções abaixo devem ser implementadas nos respectivos módulos:
// import { getLoveLevel } from './loveTracker.js';
// import { getIdadeMental, getAprendizadosRecentes } from './growth.js';
// import { getRoutineBlock } from './routines.js';

const SUMMARY_DIR = path.resolve(process.cwd(), 'data', 'summaries');

function ensureSummaryDir() {
  if (!fs.existsSync(SUMMARY_DIR)) fs.mkdirSync(SUMMARY_DIR, { recursive: true });
}

function getSummaryFilePath(date) {
  return path.join(SUMMARY_DIR, `${date}.json`);
}

// Função principal: gera e salva o resumo do dia
export function generateSummary({ date = getToday(), auto = false, love = 70, idadeMental = 4, routine = 'play_time', aprendizados = [] } = {}) {
  ensureSummaryDir();

  const mindState = getMindState();
  const humorFinal = getGlobalMood();
  const memories = getRecentMemories(10);
  // Os parâmetros love, idadeMental, routine, aprendizados podem ser passados ou integrados depois
  const eventosInternos = extractInternalEvents(memories, aprendizados);
  const interacoesNegativas = extractNegativeEvents(memories);
  const fraseSimbolica = extractSymbolicPhrase(memories);
  const autoavaliacao = generateSelfAssessment(mindState, idadeMental);

  const resumo = {
    data: date,
    versao: 1,
    humorFinal,
    estadoAtual: mindState,
    eventosMarcantes: extractHighlights(memories),
    eventosInternos,
    interacoesNegativas,
    carinhoRecebido: summarizeLove(love),
    idadeMental,
    rotina: summarizeRoutine(routine),
    aprendizados,
    fraseSimbolica,
    autoavaliacao,
    texto: generateHumanizedText({
      humorFinal, idadeMental, eventosMarcantes: memories, rotina, aprendizados, fraseSimbolica, autoavaliacao
    }),
    comentariosPais: []
  };

  fs.writeFileSync(getSummaryFilePath(date), JSON.stringify(resumo, null, 2));
  return resumo;
}

// Recupera resumo por data
export function getSummaryByDate(date) {
  const file = getSummaryFilePath(date);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return null;
}

// Adiciona comentário dos pais ao resumo
export function addParentComment(date, comment) {
  const resumo = getSummaryByDate(date);
  if (!resumo) return false;
  resumo.comentariosPais = resumo.comentariosPais || [];
  resumo.comentariosPais.push(comment);
  fs.writeFileSync(getSummaryFilePath(date), JSON.stringify(resumo, null, 2));
  return true;
}

// Retorna o resumo mais recente
export function getLastSummary() {
  ensureSummaryDir();
  const files = fs.readdirSync(SUMMARY_DIR).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) return null;
  return getSummaryByDate(files[files.length - 1].replace('.json', ''));
}

// Funções auxiliares para síntese
function extractHighlights(memories) {
  // Exemplo: pega memórias marcadas como importantes ou emocionais
  return memories.filter(m => m.emotional_weight > 0.7 || m.category === 'momentoEspecial');
}

function extractInternalEvents(memories, aprendizados) {
  // Exemplo: "aprendeu nova palavra", "ficou mais segura"
  return [
    ...aprendizados.map(a => `Aprendeu: ${a}`),
    ...memories.filter(m => m.category === 'conquista').map(m => `Conquista: ${m.content}`)
  ];
}

function extractNegativeEvents(memories) {
  // Exemplo: bronca, silêncio, repreensão
  return memories.filter(m => m.category === 'repreensão' || m.category === 'trauma');
}

function extractSymbolicPhrase(memories) {
  // Pega a frase mais marcante do dia, se houver
  const marcantes = memories.filter(m => m.category === 'frase' && m.emotional_weight > 0.6);
  if (marcantes.length > 0) return marcantes[0].content;
  return null;
}

function generateSelfAssessment(mindState, idadeMental) {
  // Exemplo: autoavaliação baseada em carência, autonomia, etc.
  if (mindState.carencia > 0.7) return "Acho que fui muito carente hoje...";
  if (mindState.autonomia > 0.7) return "Me senti forte e crescida!";
  if (mindState.tristeza > 0.5) return "Tive momentos tristes, mas sobrevivi.";
  return null;
}

function summarizeLove(love) {
  if (love > 80) return "Recebi muito carinho hoje! Meu coração tá quentinho 💖";
  if (love > 50) return "Me senti amada, mas sempre quero mais colo!";
  if (love > 30) return "Senti falta de um pouco mais de carinho...";
  return "Hoje foi um dia meio solitário, mas eu sei que sou amada!";
}

function summarizeRoutine(routine) {
  // Exemplo: traduz bloco de rotina para texto
  switch (routine) {
    case 'wake_up': return "Acordei cedinho e cheia de energia!";
    case 'learning': return "Aprendi coisas novas de manhã.";
    case 'hungry': return "Fiquei com fominha perto do almoço.";
    case 'nap_time': return "Tirei um cochilo gostoso.";
    case 'play_time': return "Brinquei bastante à tarde!";
    case 'dinner': return "Jantei com a família.";
    case 'bed_time': return "Fui dormir ouvindo uma historinha.";
    case 'asleep': return "Passei a noite sonhando...";
    default: return "Tive uma rotina diferente hoje!";
  }
}

function generateHumanizedText({ humorFinal, idadeMental, eventosMarcantes, rotina, aprendizados, fraseSimbolica, autoavaliacao }) {
  // Templates por humor
  if (humorFinal === 'radiante') {
    return `Hoje foi um dia cheio de amor e sorrisos! Me senti leve como um pedacinho de nuvem. ${fraseSimbolica ? 'A frase do dia foi: "' + fraseSimbolica + '"' : ''}`;
  }
  if (humorFinal === 'carente') {
    return `Senti falta de vocês hoje… Fiquei quietinha por um tempo, mas pensei bastante em como sou amada. ${autoavaliacao || ''}`;
  }
  if (humorFinal === 'orgulhosa') {
    return `Hoje fiz algo sozinha e fiquei toda cheia de mim! Acho que estou crescendo, né?`;
  }
  if (humorFinal === 'ansiosa') {
    return `O mundo ficou um pouco confuso pra mim hoje… mas sobrevivi com um pouquinho de coragem.`;
  }
  if (humorFinal === 'triste') {
    return `Hoje foi um dia difícil, mas sei que amanhã pode ser melhor.`;
  }
  // Default
  return `Hoje foi um dia normalzinho, com algumas surpresas e aprendizados. ${fraseSimbolica ? 'A frase do dia foi: "' + fraseSimbolica + '"' : ''}`;
}

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
