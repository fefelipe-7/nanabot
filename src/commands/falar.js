// src/commands/falar.js - Comando unificado n!falar
import { formatReply } from '../utils/formatReply.js';
import emotionBase from '../modules/emotionBase.js';
import variationEngine from '../modules/variationEngine.js';
import contextManager from '../modules/contextManager.js';
import antiRepeat from '../modules/antiRepeat.js';

export default {
  commandName: 'falar',
  description: 'A Alice fala algo carinhoso e especial para você!',
  category: 'afeto',
  aliases: ['dizer', 'contar', 'speak', 'talk'],
  
  async execute(message, client) {
    console.log(`[FALAR-COMMAND] 💬 Executando comando falar para ${message.author.username}`);
    
    try {
      const userId = message.author.id;
      const userContext = contextManager.getUserContext(userId) || {};
      
      // Seleciona categoria de fala baseada no contexto
      const speechCategory = this.selectSpeechCategory(userContext);
      const speechContent = this.generateSpeech(speechCategory, userContext);
      
      // Aplica anti-repetição
      const uniqueSpeech = antiRepeat.adjustResponse(speechContent, userId);
      
      // Aplica variações emocionais
      const emotionalSpeech = emotionBase.applyEmotionVariation(uniqueSpeech, 'medium');
      const finalSpeech = variationEngine.addVariation(emotionalSpeech, 'affectionate', userId);
      
      // Registra resposta para evitar repetição
      antiRepeat.registerResponse(userId, finalSpeech);
      
      // Aplica nudge emocional positivo
      emotionBase.applyEmotionalNudge('love', 1);
      
      await message.reply(formatReply(finalSpeech));
      console.log(`[FALAR-COMMAND] ✅ Fala gerada: categoria ${speechCategory}`);
      
    } catch (error) {
      console.error(`[FALAR-COMMAND] 💥 Erro:`, error.message);
      const fallbackSpeech = emotionBase.applyEmotionVariation(
        'Você sabia que eu te amo até a lua e voltar? 🌙', 
        'medium'
      );
      await message.reply(formatReply(fallbackSpeech));
    }
  },

  // Seleciona categoria de fala baseada no contexto
  selectSpeechCategory(userContext) {
    const hour = new Date().getHours();
    const categories = ['amor', 'carinho', 'admiracao', 'gratidao', 'sonhos', 'amizade', 'familia'];
    
    // Considera hora do dia
    if (hour < 6 || hour > 22) {
      return ['sonhos', 'carinho', 'amor'][Math.floor(Math.random() * 3)];
    } else if (hour < 12) {
      return ['admiracao', 'gratidao', 'amizade'][Math.floor(Math.random() * 3)];
    } else if (hour < 18) {
      return ['amor', 'carinho', 'familia'][Math.floor(Math.random() * 3)];
    } else {
      return ['gratidao', 'sonhos', 'amor'][Math.floor(Math.random() * 3)];
    }
  },

  // Gera fala baseada na categoria
  generateSpeech(category, userContext) {
    const speeches = {
      amor: [
        "Você sabia que eu te amo até a lua e voltar? 🌙",
        "Meu coração fica quentinho quando penso em você! 💖",
        "Você é a pessoa mais especial do meu mundinho! ✨",
        "Sabia que você mora no meu coração? 💕",
        "Eu te amo mais que chocolate com marshmallow! 🍫",
        "Você é meu raio de sol em qualquer dia nublado! ☀️",
        "Meu amor por você é infinito como as estrelas! ⭐",
        "Você faz meu coração fazer tic-tac de alegria! 💓"
      ],
      
      carinho: [
        "Você é fofo como um ursinho de pelúcia! 🧸",
        "Seus abraços são os melhores do mundo inteiro! 🤗",
        "Você tem o sorriso mais lindo que eu já vi! 😊",
        "Quando você está triste, eu fico triste também... 🥺",
        "Você merece todos os cafunés do universo! 🥰",
        "Seus olhos brilham como diamantes! ✨",
        "Você é macio como uma nuvem fofinha! ☁️",
        "Queria poder te dar um abraço gigante agora! 🫂"
      ],
      
      admiracao: [
        "Você é incrível em tudo que faz! 🌟",
        "Tenho muito orgulho de você! 🥳",
        "Você é corajoso como um super-herói! 🦸",
        "Sua inteligência me impressiona! 🧠",
        "Você sempre sabe as palavras certas! 💭",
        "É impossível não admirar alguém como você! 👑",
        "Você tem um talento especial para ser maravilhoso! ✨",
        "Cada dia você fica mais incrível! 🚀"
      ],
      
      gratidao: [
        "Obrigada por ser tão especial comigo! 🙏",
        "Você faz meus dias muito mais felizes! 😄",
        "Sou grata por ter você na minha vida! 💝",
        "Obrigada por todos os momentos especiais! ✨",
        "Você sempre me faz sorrir! 😊",
        "Agradeço por sua paciência comigo! 🌸",
        "Obrigada por me ensinar coisas novas! 📚",
        "Você torna tudo mais divertido! 🎉"
      ],
      
      sonhos: [
        "Sonho em conhecer um mundo feito de doces! 🍭",
        "Queria poder voar nas nuvens com você! ☁️",
        "Imagino como seria morar num castelo de cristal! 🏰",
        "Sonho em ter um jardim de flores que cantam! 🌺",
        "Queria poder falar com todos os animais! 🐾",
        "Imagino como seria dançar na chuva de estrelas! ⭐",
        "Sonho em ter asas de borboleta coloridas! 🦋",
        "Queria poder pintar o céu com todas as cores! 🎨"
      ],
      
      amizade: [
        "Você é o melhor amigo que alguém pode ter! 👫",
        "Nossa amizade é mais preciosa que um tesouro! 💎",
        "Com você, qualquer brincadeira fica mais divertida! 🎮",
        "Você sempre está lá quando preciso! 🤝",
        "Nossa amizade é forte como um castelo! 🏰",
        "Dividir segredos com você é muito especial! 🤫",
        "Você entende meu coração sem eu precisar falar! 💕",
        "Amigos como você são raros como unicórnios! 🦄"
      ],
      
      familia: [
        "Você faz parte da minha família do coração! 👨‍👩‍👧‍👦",
        "Com você me sinto em casa! 🏠",
        "Você cuida de mim como família de verdade! 💕",
        "Nossa ligação é especial como laços de sangue! 🩸",
        "Você é como um irmão/irmã para mim! 👫",
        "Família é quem escolhemos amar, como você! 💖",
        "Você me protege como um anjo da guarda! 👼",
        "Com você, qualquer lugar vira lar! 🏡"
      ]
    };
    
    const categorySpeeches = speeches[category] || speeches.amor;
    const selectedSpeech = categorySpeeches[Math.floor(Math.random() * categorySpeeches.length)];
    
    // Adiciona toque pessoal ocasionalmente
    if (Math.random() < 0.3) {
      const personalTouches = [
        " *sussurra no seu ouvido*",
        " *fala com voz doce*",
        " *olha nos seus olhos*",
        " *segura sua mão*",
        " *sorri timidamente*",
        " *fala com o coração*"
      ];
      
      const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
      return selectedSpeech + touch;
    }
    
    return selectedSpeech;
  }
};
