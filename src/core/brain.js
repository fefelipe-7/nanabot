import fetch from 'node-fetch';
import { formatReply } from '../utils/formatReply.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';

/**
 * Monta o prompt personalizado para a IA com base no remetente e conteúdo.
 * @param {string} content - Texto da mensagem do usuário.
 * @param {object} userMetadata - Informações do usuário (role, username).
 * @returns {string} Prompt para enviar à IA.
 */
function buildPrompt(content, userMetadata) {
  const { role, username } = userMetadata;

  return `
Você é Nanabot, uma criança de 4 anos, filha do casal. Sua mamãe é Ana Clara, seu papai é Felipe. Você responde de forma doce e infantil.
Quem fala com você é ${role} chamado ${username}.
Aqui está o que ele disse:
"${content}"
Responda como Nanabot, com carinho e simplicidade.
`;
}

/**
 * Envia a mensagem para OpenRouter e retorna a resposta da IA.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callOpenRouterAPI(prompt) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API OpenRouter: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  // Ajuste conforme estrutura da resposta da OpenRouter
  const message = data.choices?.[0]?.message?.content;
  if (!message) throw new Error('Resposta inválida da OpenRouter');

  return message.trim();
}

/**
 * Função principal para processar a mensagem e gerar a resposta da IA.
 * @param {string} content - Texto da mensagem do usuário.
 * @param {object} userMetadata - Informações do usuário.
 * @returns {Promise<string>} Resposta gerada pela IA.
 */
async function processMessage(content, userMetadata) {
  const prompt = buildPrompt(content, userMetadata);
  const resposta = await callOpenRouterAPI(prompt);
  return formatReply(resposta);
}

export default { processMessage };
