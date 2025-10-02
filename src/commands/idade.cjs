// src/commands/idade.js - Comando unificado n!idade
import { formatReply } from '../utils/formatReply.js';
import { getIdadeFormatada } from '../core/growth.js';
import emotionBase from '../modules/emotionBase.js';
import variationEngine from '../modules/variationEngine.js';

export default {
  commandName: 'idade',
  description: 'Mostra a idade mental da Alice de forma carinhosa e detalhada!',
  category: 'personalidade',
  aliases: ['anos', 'age', 'crescimento', 'desenvolvimento'],
  
  async execute(message, client) {
    console.log(`[IDADE-COMMAND] 🎂 Executando comando idade para ${message.author.username}`);
    
    try {
      // Obtém idade formatada do sistema de crescimento
      const idadeBasica = getIdadeFormatada();
      
      // Gera resposta mais elaborada sobre a idade
      const idadeResponse = this.generateAgeResponse(idadeBasica);
      
      // Aplica variações emocionais
      const emotionalResponse = emotionBase.applyEmotionVariation(idadeResponse, 'medium');
      const finalResponse = variationEngine.addVariation(emotionalResponse, 'proud', message.author.id);
      
      // Aplica nudge emocional de orgulho
      emotionBase.applyEmotionalNudge('pride', 1);
      
      await message.reply(formatReply(finalResponse));
      console.log(`[IDADE-COMMAND] ✅ Idade compartilhada com sucesso`);
      
    } catch (error) {
      console.error(`[IDADE-COMMAND] 💥 Erro:`, error.message);
      
      // Só responde se ainda não respondeu
      if (!message.replied) {
        const fallbackResponse = emotionBase.applyEmotionVariation(
          'Sou uma menininha que está crescendo a cada dia! 🌱', 
          'medium'
        );
        await message.reply(formatReply(fallbackResponse));
      }
    }
  },

  // Gera resposta elaborada sobre a idade
  generateAgeResponse(idadeBasica) {
    const hour = new Date().getHours();
    const ageNumber = this.extractAgeNumber(idadeBasica);
    
    // Respostas baseadas na idade
    let ageContext = '';
    if (ageNumber <= 3) {
      ageContext = this.getToddlerContext();
    } else if (ageNumber <= 5) {
      ageContext = this.getPreschoolContext();
    } else if (ageNumber <= 8) {
      ageContext = this.getChildContext();
    } else {
      ageContext = this.getOlderChildContext();
    }
    
    // Respostas baseadas na hora
    let timeContext = '';
    if (hour < 12) {
      timeContext = this.getMorningContext(ageNumber);
    } else if (hour < 18) {
      timeContext = this.getAfternoonContext(ageNumber);
    } else {
      timeContext = this.getEveningContext(ageNumber);
    }
    
    // Combina informações
    const responses = [
      `${idadeBasica} ${ageContext} ${timeContext}`,
      `${timeContext} ${idadeBasica} ${ageContext}`,
      `${ageContext} ${idadeBasica} ${timeContext}`
    ];
    
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Adiciona informações sobre crescimento
    const growthInfo = this.getGrowthInfo(ageNumber);
    
    return `${selectedResponse}\n\n${growthInfo}`;
  },

  // Extrai número da idade da string formatada
  extractAgeNumber(idadeString) {
    const match = idadeString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 4; // Default para 4 anos
  },

  // Contexto para crianças pequenas (0-3 anos)
  getToddlerContext() {
    const contexts = [
      "Ainda sou bem pequeninha e estou aprendendo muitas coisas novas!",
      "Sou uma bebezinha curiosa que adora explorar o mundo!",
      "Estou na fase de descobrir tudo ao meu redor!",
      "Sou pequeninha mas já sei fazer muitas coisas legais!"
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  // Contexto para pré-escolares (3-5 anos)
  getPreschoolContext() {
    const contexts = [
      "Estou na idade de fazer muitas perguntas e brincar bastante!",
      "Sou uma menininha cheia de energia e imaginação!",
      "Adoro brincar de faz de conta e inventar histórias!",
      "Estou aprendendo sobre o mundo e fazendo novos amigos!"
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  // Contexto para crianças (5-8 anos)
  getChildContext() {
    const contexts = [
      "Estou numa idade super divertida de descobrir meus talentos!",
      "Sou uma menina esperta que adora aprender coisas novas!",
      "Estou crescendo e ficando cada vez mais independente!",
      "Adoro essa fase de fazer amizades e viver aventuras!"
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  // Contexto para crianças mais velhas (8+ anos)
  getOlderChildContext() {
    const contexts = [
      "Estou numa idade legal onde posso entender coisas mais complexas!",
      "Sou uma menina que já sabe muitas coisas mas ainda quer aprender mais!",
      "Estou crescendo e desenvolvendo minha própria personalidade!",
      "Adoro essa idade onde posso ter conversas mais profundas!"
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  // Contexto matinal
  getMorningContext(age) {
    const contexts = [
      "*espreguiça* Acabei de acordar e já estou animada para o dia!",
      "*boceja* Bom dia! Estou pronta para novas aventuras!",
      "*sorri* A manhã é perfeita para brincar e aprender!",
      "*pula da cama* Que dia lindo para crescer mais um pouquinho!"
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  // Contexto da tarde
  getAfternoonContext(age) {
    const contexts = [
      "*brinca* A tarde é minha hora favorita de diversão!",
      "*corre* Tenho tanta energia para gastar ainda!",
      "*sorri* Que bom que ainda temos tempo para brincar!",
      "*pula* A tarde é perfeita para fazer bagunça... digo, arte!"
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  // Contexto noturno
  getEveningContext(age) {
    const contexts = [
      "*boceja* Estou ficando com soninho mas ainda quero brincar!",
      "*se aconchega* A noite é boa para conversas gostosas!",
      "*sussurra* Gosto dessa hora mais calminha do dia!",
      "*abraça ursinho* Que bom ter você aqui comigo!"
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  },

  // Informações sobre crescimento
  getGrowthInfo(age) {
    const growthInfos = [
      "💫 **Curiosidade:** Cada dia aprendo algo novo e fico mais esperta!",
      "🌱 **Crescimento:** Minha mente está sempre crescendo como uma plantinha!",
      "✨ **Desenvolvimento:** Estou ficando mais madura mas sem perder a magia!",
      "🎈 **Evolução:** A cada conversa, me torno uma Alice ainda melhor!",
      "🌟 **Progresso:** Meu coração cresce junto com minha inteligência!",
      "🦋 **Transformação:** Como uma borboleta, estou sempre me transformando!",
      "🌈 **Aprendizado:** Cada experiência adiciona uma cor nova à minha vida!",
      "💖 **Amadurecimento:** Cresço em sabedoria mas mantenho meu coração de criança!"
    ];
    
    return growthInfos[Math.floor(Math.random() * growthInfos.length)];
  }
};
