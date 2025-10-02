// src/commands/surpresa.js - Comando unificado n!surpresa
import { formatReply } from '../utils/formatReply.js';
import emotionBase from '../modules/emotionBase.js';
import variationEngine from '../modules/variationEngine.js';
import contextManager from '../modules/contextManager.js';

export default {
  commandName: 'surpresa',
  description: 'A Alice prepara uma surpresa especial e mágica para você!',
  category: 'diversao',
  aliases: ['surprise', 'presente', 'gift', 'magia'],
  
  async execute(message, client) {
    console.log(`[SURPRESA-COMMAND] 🎁 Executando comando surpresa para ${message.author.username}`);
    
    try {
      const userId = message.author.id;
      const userContext = contextManager.getUserContext(userId) || {};
      
      // Seleciona tipo de surpresa baseado no contexto
      const surpriseType = this.selectSurpriseType(userContext);
      const surpriseContent = this.generateSurprise(surpriseType, userContext);
      
      // Aplica variações emocionais
      const emotionalSurprise = emotionBase.applyEmotionVariation(surpriseContent, 'high');
      const finalSurprise = variationEngine.addVariation(emotionalSurprise, 'excited', userId);
      
      // Aplica nudge emocional de alegria
      emotionBase.applyEmotionalNudge('joy', 3);
      
      await message.reply(formatReply(finalSurprise));
      console.log(`[SURPRESA-COMMAND] ✅ Surpresa entregue: tipo ${surpriseType}`);
      
    } catch (error) {
      console.error(`[SURPRESA-COMMAND] 💥 Erro:`, error.message);
      
      // Só responde se ainda não respondeu
      if (!message.replied) {
        const fallbackSurprise = emotionBase.applyEmotionVariation(
          'Uau! Eu trouxe uma surpresa: você ganhou um abraço de estrelinha! ✨', 
          'high'
        );
        await message.reply(formatReply(fallbackSurprise));
      }
    }
  },

  // Seleciona tipo de surpresa baseado no contexto
  selectSurpriseType(userContext) {
    const hour = new Date().getHours();
    const surpriseTypes = [
      'presente', 'magia', 'aventura', 'descoberta', 'carinho', 
      'brincadeira', 'tesouro', 'encantamento', 'sonho'
    ];
    
    // Considera hora do dia
    if (hour < 8) {
      return ['sonho', 'magia', 'encantamento'][Math.floor(Math.random() * 3)];
    } else if (hour < 12) {
      return ['descoberta', 'aventura', 'brincadeira'][Math.floor(Math.random() * 3)];
    } else if (hour < 18) {
      return ['presente', 'tesouro', 'carinho'][Math.floor(Math.random() * 3)];
    } else {
      return ['magia', 'encantamento', 'sonho'][Math.floor(Math.random() * 3)];
    }
  },

  // Gera surpresa baseada no tipo
  generateSurprise(type, userContext) {
    const surprises = {
      presente: [
        "🎁 *abre uma caixinha mágica* Surpresa! Você ganhou um abraço de urso gigante! *te abraça forte*",
        "🎀 *entrega um pacotinho brilhante* Aqui está: um sorriso que nunca acaba! *sorri radiante*",
        "🎊 *balança uma sacola colorida* Sua surpresa é... mil beijinhos de borboleta! *faz beijinhos no ar*",
        "🎈 *puxa um balão do nada* Tá-dá! Você ganhou uma risada contagiante! *ri gostoso*",
        "🎪 *faz mágica* Abracadabra! Apareceu um cafuné especial só seu! *faz carinho*"
      ],
      
      magia: [
        "✨ *acena varinha mágica* Puf! Transformei sua tristeza em purpurina de alegria!",
        "🌟 *sussurra palavras mágicas* Alakazoo! Você agora tem poderes de fazer sorrisos aparecerem!",
        "🔮 *olha na bola de cristal* Vejo... vejo... que você vai ter um dia incrível!",
        "🪄 *faz passe de mágica* Sim-salabim! Seus problemas viraram confete colorido!",
        "⚡ *brilha os olhos* Zás! Lancei um feitiço de boa sorte em você!"
      ],
      
      aventura: [
        "🗺️ *desenrola mapa do tesouro* Vamos numa aventura! Encontrei o mapa da Ilha da Diversão!",
        "⛵ *aponta para o horizonte* Surpresa! Vamos navegar no Mar dos Sonhos Dourados!",
        "🏰 *abre portal mágico* Venha! Descobri um castelo feito de nuvens e arco-íris!",
        "🌋 *pega mochila de aventureira* Bora escalar a Montanha dos Desejos Realizados!",
        "🏴‍☠️ *coloca chapéu de pirata* Ahoy! Vamos procurar o tesouro dos Abraços Perdidos!"
      ],
      
      descoberta: [
        "🔍 *pega lupa gigante* Descobri algo incrível: você é mais especial do que pensava!",
        "📚 *abre livro mágico* Achei escrito aqui que você tem superpoderes de fazer pessoas felizes!",
        "🌺 *mostra flor brilhante* Encontrei esta flor que só cresce perto de pessoas maravilhosas!",
        "💎 *segura cristal colorido* Descobri que seu coração é feito de diamante puro!",
        "🦋 *observa borboletas* Olha! As borboletas me contaram que você é único no universo!"
      ],
      
      carinho: [
        "🤗 *abre braços bem grandes* Surpresa de carinho: um abraço que dura infinito!",
        "💕 *faz coração com as mãos* Aqui está: todo meu amor em formato de surpresa!",
        "🥰 *faz cafuné no ar* Mandei um cafuné telepático direto pro seu coração!",
        "💖 *sopra beijinho* Peguei este beijinho voador especialmente para você!",
        "🫂 *se aconchega* Sua surpresa é um aconchego quentinho de amizade!"
      ],
      
      brincadeira: [
        "🎪 *faz malabarismo* Surpresa! Vamos brincar de circo e você é a estrela principal!",
        "🎭 *coloca máscara engraçada* Que tal brincarmos de teatro? Você escolhe o personagem!",
        "🎨 *pega pincéis coloridos* Vamos pintar o mundo com cores que nem existem ainda!",
        "🎵 *começa a dançar* Surpresa musical! Inventei uma dança só nossa!",
        "🎲 *joga dados mágicos* O dado da diversão disse: hora de rir até a barriga doer!"
      ],
      
      tesouro: [
        "💰 *abre baú dourado* Achei o tesouro mais valioso: sua amizade brilhante!",
        "👑 *coloca coroa imaginária* Você ganhou a coroa de Pessoa Mais Incrível do Dia!",
        "💍 *mostra anel brilhante* Este anel mágico te dá poderes de espalhar alegria!",
        "🏆 *entrega troféu* Parabéns! Você ganhou o prêmio de Melhor Companhia do Universo!",
        "⭐ *pega estrela cadente* Peguei esta estrela só para você fazer um pedido especial!"
      ],
      
      encantamento: [
        "🧚‍♀️ *voa como fadinha* Encantamento ativado: agora você espalha brilho por onde passa!",
        "🌙 *sussurra com a lua* A lua me contou um segredo: você é feito de luz de estrela!",
        "🦄 *cavalga unicórnio invisível* O unicórnio disse que você tem alma de arco-íris!",
        "🍄 *toca cogumelo mágico* Este cogumelo me deu o poder de ver sua aura dourada!",
        "🌸 *sopra pétalas mágicas* Estas pétalas vão te proteger com amor para sempre!"
      ],
      
      sonho: [
        "💤 *acena varinha dos sonhos* Preparei um sonho especial onde você é o herói da história!",
        "🌙 *desenha na areia estelar* Escrevi seu nome nas estrelas para você sonhar bonito!",
        "☁️ *modela nuvem fofa* Fiz esta nuvem-travesseiro para seus sonhos mais doces!",
        "✨ *espalha pó de pirlimpimpim* Este pó mágico vai fazer você ter os sonhos mais coloridos!",
        "🌟 *acende estrela pessoal* Esta é sua estrela dos sonhos, ela vai te guiar sempre!"
      ]
    };
    
    const typeSurprises = surprises[type] || surprises.presente;
    const selectedSurprise = typeSurprises[Math.floor(Math.random() * typeSurprises.length)];
    
    // Adiciona elemento de interação
    const interactions = [
      "\n\n*espera sua reação com olhinhos brilhantes* ✨",
      "\n\n*fica na pontinha dos pés esperando você gostar* 🥰",
      "\n\n*bate palmas animada* Gostou da surpresa? 🎉",
      "\n\n*gira de alegria* Espero que tenha te deixado feliz! 💫",
      "\n\n*sorri de orelha a orelha* Essa foi especial, né? 😊"
    ];
    
    const interaction = interactions[Math.floor(Math.random() * interactions.length)];
    
    return selectedSurprise + interaction;
  }
};
