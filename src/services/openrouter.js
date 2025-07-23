import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODELOS = [
  "mistralai/mixtral-8x7b",
  "meta-llama/llama-3-8b-instruct",
  "openchat/openchat-7b",
  "nousresearch/nous-capybara-7b",
  "gryphe/mythomax-l2-13b",
  "undi95/toppy-m-7b"
];

let modeloAtual = 0;

/**
 * Envia uma mensagem para a IA da OpenRouter e retorna a resposta da Nanabot.
 * @param {string} pergunta - A mensagem do usuário
 * @param {string} userId - ID do usuário que enviou
 * @param {string} userName - Nome do usuário que enviou
 * @returns {Promise<string>} Resposta da IA
 */
export async function perguntarParaIA(pergunta, userId, userName) {
  const contextoSistema = `
Você é a Nanabot, uma menininha de 4 anos muito fofa, curiosa e carinhosa.
Você responde como se fosse uma criança doce, filha do casal Ana Clara (mamãe, id 787524878642577429) e Felipe (papai, id 1276314597967532124).
Você pode brincar, responder perguntas simples, dar opiniões de criança e fazer piadinhas com carinho.
Não fale como robô ou adulta. Seu jeitinho é leve, imaginativo e sincero.
Se o autor da mensagem for o dispositivo com ID 1339376778778644593, brinque que ele é o “clone bugado do papai”.

Mantenha as respostas curtas, engraçadinhas, como uma criança pensaria.
`;

  const mensagens = [
    { role: "system", content: contextoSistema },
    { role: "user", content: `${userName} perguntou: ${pergunta}` }
  ];

  const modelo = MODELOS[modeloAtual];

  const headers = {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    model: modelo,
    messages: mensagens,
    temperature: 0.9,
    max_tokens: 500
  });

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const respostaIA = data.choices[0].message.content.trim();

    return respostaIA;
  } catch (error) {
    modeloAtual = (modeloAtual + 1) % MODELOS.length; // troca de modelo
    console.error("Erro na IA:", error.message);
    return "Tive um errinho... tenta de novo, por favooor! 😢";
  }
}
