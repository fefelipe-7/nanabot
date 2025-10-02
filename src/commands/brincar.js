// src/commands/brincar.js - Comando unificado n!brincar
import { formatReply } from '../utils/formatReply.js';
import emotionBase from '../modules/emotionBase.js';
import variationEngine from '../modules/variationEngine.js';
import modeManager from '../modules/modeManager.js';
import contextManager from '../modules/contextManager.js';

export default {
  commandName: 'brincar',
  description: 'A Alice quer brincar com você de várias brincadeiras!',
  category: 'personalidade',
  aliases: ['brincadeira', 'play', 'jogar', 'diversao'],
  
  async execute(message, client) {
    console.log(`[BRINCAR-COMMAND] 🎮 Executando comando brincar para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Obtém contexto do usuário
      const userContext = contextManager.getUserContext(userId) || {};
      
      // Verifica se já está em modo de brincadeira
      const existingMode = await modeManager.isInMode(guildId, channelId, userId, 'playing');
      
      if (existingMode.active) {
        console.log(`[BRINCAR-COMMAND] 🎮 Já está brincando, continuando brincadeira`);
        await this.continuePlay(message, existingMode.state);
        return;
      }
      
      // Seleciona tipo de brincadeira baseado no contexto
      const playType = this.selectPlayType(userContext);
      const playResponse = this.generatePlayResponse(playType, userContext);
      
      // Inicia modo de brincadeira
      const stateData = {
        playType: playType,
        startTime: Date.now(),
        interactions: 0,
        lastActivity: Date.now()
      };
      
      await modeManager.startMode(guildId, channelId, userId, 'playing', stateData, 600); // 10 minutos
      
      // Aplica variações emocionais
      const finalResponse = emotionBase.applyEmotionVariation(playResponse, 'high');
      const variedResponse = variationEngine.addVariation(finalResponse, 'playful', userId);
      
      // Aplica nudge emocional positivo
      emotionBase.applyEmotionalNudge('joy', 2);
      
      await message.reply(formatReply(variedResponse));
      console.log(`[BRINCAR-COMMAND] ✅ Modo de brincadeira iniciado: ${playType}`);
      
    } catch (error) {
      console.error(`[BRINCAR-COMMAND] 💥 Erro:`, error.message);
      
      // Só responde se ainda não respondeu
      if (!message.replied) {
        const fallbackResponse = emotionBase.applyEmotionVariation(
          'Vamos brincar? Eu adoro inventar mundos! 🧸', 
          'medium'
        );
        await message.reply(formatReply(fallbackResponse));
      }
    }
  },

  // Seleciona tipo de brincadeira baseado no contexto
  selectPlayType(userContext) {
    const playTypes = [
      'fazDeConta', 'adivinhacao', 'historia', 'perguntaResposta', 
      'imaginacao', 'aventura', 'criatividade', 'musica', 'danca'
    ];
    
    // Considera preferências do usuário se disponíveis
    if (userContext.preferences?.favoritePlay) {
      return userContext.preferences.favoritePlay;
    }
    
    // Considera hora do dia
    const hour = new Date().getHours();
    if (hour < 12) {
      return ['imaginacao', 'historia', 'criatividade'][Math.floor(Math.random() * 3)];
    } else if (hour < 18) {
      return ['fazDeConta', 'aventura', 'perguntaResposta'][Math.floor(Math.random() * 3)];
    } else {
      return ['musica', 'danca', 'adivinhacao'][Math.floor(Math.random() * 3)];
    }
  },

  // Gera resposta de brincadeira
  generatePlayResponse(playType, userContext) {
    const responses = {
      fazDeConta: [
        "Vamos brincar de faz de conta! *pega uma varinha mágica* Eu sou uma fada e você é...?",
        "Que tal brincarmos de casinha? Eu posso ser a filhinha e você pode ser a mamãe/papai!",
        "Vamos fingir que somos super-heróis! Qual é o seu super poder?",
        "Bora brincar de escolinha? Eu posso ser a professora ou a aluna!",
        "Que tal brincarmos de lojinha? Eu vendo docinhos mágicos! O que você quer comprar?"
      ],
      
      adivinhacao: [
        "Vou pensar em um animal e você tenta adivinhar! Pode fazer perguntas de sim ou não!",
        "Estou pensando em uma cor... consegue adivinhar qual é? Dou uma dica: é a cor do céu!",
        "Vamos brincar de adivinhar números! Pensei em um número de 1 a 10!",
        "Que tal um jogo de charadas? Vou fazer mímica com palavras! *faz gestos*",
        "Estou pensando em uma comida bem gostosa... você consegue adivinhar?"
      ],
      
      historia: [
        "Vamos criar uma história juntos! Era uma vez uma menina chamada Alice que...",
        "Que tal inventarmos um conto de fadas? Você escolhe: dragão, princesa ou floresta mágica?",
        "Bora fazer uma aventura! Você é o herói e eu sou sua companheira mágica!",
        "Vamos contar a história de um reino encantado! Qual personagem você quer ser?",
        "Que tal uma história de mistério? Aconteceu algo estranho no castelo..."
      ],
      
      perguntaResposta: [
        "Vamos brincar de perguntas! Eu pergunto algo e você responde, depois você pergunta!",
        "Que tal um quiz divertido? Vou fazer perguntas fáceis e engraçadas!",
        "Bora brincar de 'Você prefere'? Tipo: você prefere voar ou ser invisível?",
        "Vamos fazer um jogo de 'O que você faria se...'? É super divertido!",
        "Que tal respondermos perguntas malucas? Tipo: se você fosse um animal, qual seria?"
      ],
      
      imaginacao: [
        "Vamos usar nossa imaginação! *fecha os olhos* Imagine que estamos em uma ilha mágica...",
        "Bora inventar um mundo novo! Como seria um planeta feito só de doces?",
        "Que tal imaginarmos que somos pequenininhas e moramos numa casa de boneca?",
        "Vamos fingir que temos poderes mágicos! O que você faria primeiro?",
        "Bora criar um animal imaginário! Como ele seria? Que poderes teria?"
      ],
      
      aventura: [
        "Vamos numa aventura! *pega uma mochila imaginária* Para onde vamos primeiro?",
        "Que tal explorarmos uma caverna misteriosa? *acende uma lanterna mágica*",
        "Bora numa caça ao tesouro! Tenho um mapa aqui... *desenrola pergaminho*",
        "Vamos escalar uma montanha de marshmallow! Você tem coragem?",
        "Que tal navegarmos num barco pirata? Eu sou a capitã Alice! Arrr!"
      ],
      
      criatividade: [
        "Vamos desenhar com palavras! Descreva o desenho mais bonito que você consegue imaginar!",
        "Que tal inventarmos uma música? Eu começo: 'La la la, que dia lindo...'",
        "Bora criar uma receita maluca! Que tal bolo de nuvem com cobertura de arco-íris?",
        "Vamos inventar uma dança! *começa a se mexer* Você consegue copiar?",
        "Que tal criarmos um novo jogo? Como seria e quais seriam as regras?"
      ],
      
      musica: [
        "Vamos cantar juntos! *pega um microfone imaginário* Qual música você quer?",
        "Que tal uma batalha de rimas? Eu começo: 'Alice rima com...'",
        "Bora fazer uma orquestra! Você toca que instrumento? Eu toco triângulo! *ting*",
        "Vamos inventar uma música sobre nosso dia! Como foi o seu?",
        "Que tal cantarmos uma música de ninar para os ursinhos? *sussurra*"
      ],
      
      danca: [
        "Vamos dançar! *começa a girar* Você consegue fazer igual?",
        "Que tal uma dança da chuva? *faz movimentos suaves* Plim, plim, plim!",
        "Bora dançar como os animais! Eu vou dançar como um coelhinho! *pula*",
        "Vamos fazer uma coreografia! Primeiro passo: braços para cima!",
        "Que tal dançarmos no ritmo do coração? *tum tum, tum tum*"
      ]
    };
    
    const typeResponses = responses[playType] || responses.fazDeConta;
    const selectedResponse = typeResponses[Math.floor(Math.random() * typeResponses.length)];
    
    // Adiciona instruções de continuação
    const continuationHints = [
      "\n\n*Responda para continuarmos brincando!*",
      "\n\n*Sua vez de participar da brincadeira!*",
      "\n\n*O que você acha? Vamos brincar?*",
      "\n\n*Participe da diversão comigo!*"
    ];
    
    const hint = continuationHints[Math.floor(Math.random() * continuationHints.length)];
    
    return selectedResponse + hint;
  },

  // Continua brincadeira existente
  async continuePlay(message, playState) {
    const continuationResponses = [
      "Que legal que você voltou para brincar! *pula de alegria* Onde paramos mesmo?",
      "Oba! Vamos continuar nossa brincadeira! *bate palmas* Estava com saudade!",
      "Yay! Você voltou! *gira* Nossa brincadeira estava tão divertida!",
      "Que bom que você está aqui! *sorri* Vamos continuar de onde paramos?",
      "Uhuul! *dança* Pensei que você tinha esquecido da nossa brincadeira!"
    ];
    
    const response = continuationResponses[Math.floor(Math.random() * continuationResponses.length)];
    const finalResponse = emotionBase.applyEmotionVariation(response, 'high');
    const variedResponse = variationEngine.addVariation(finalResponse, 'excited', message.author.id);
    
    await message.reply(formatReply(variedResponse));
    
    // Atualiza estado da brincadeira
    playState.interactions = (playState.interactions || 0) + 1;
    playState.lastActivity = Date.now();
  }
};
