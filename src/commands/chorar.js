// src/commands/chorar.js - Comando unificado n!chorar
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import emotionBase from '../modules/emotionBase.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'chorar',
  description: 'A Alice simula um choro dramático infantil (mini-evento)',
  category: 'afeto',
  aliases: ['cry', 'buaaa'],
  
  async execute(message, client) {
    console.log(`[CHORAR-COMMAND] 😭 Executando comando chorar para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Verifica se já está chorando
      const existingMode = await modeManager.isInMode(guildId, channelId, userId, 'crying');
      
      if (existingMode.active) {
        console.log(`[CHORAR-COMMAND] 😭 Já está chorando, intensificando drama`);
        await this.intensifyCrying(message, config);
        return;
      }
      
      // Inicia modo de choro
      const modeConfig = config.mode || {};
      const ttl = modeConfig.ttl || 300; // 5 minutos
      
      const cryingReason = this.generateCryingReason(config);
      const stateData = {
        reason: cryingReason,
        intensity: 1,
        startTime: Date.now()
      };
      
      const modeStarted = await modeManager.startMode(guildId, channelId, userId, 'crying', stateData, ttl);
      
      if (!modeStarted) {
        console.log(`[CHORAR-COMMAND] ❌ Falha ao iniciar modo de choro`);
        await message.reply(formatReply('Buaaa... 😭 *começa a chorar*'));
        return;
      }
      
      // Gera resposta dramática
      const cryingResponse = this.generateCryingResponse(cryingReason, config);
      
      // Aplica variação emocional
      const finalResponse = emotionBase.applyEmotionVariation(
        cryingResponse, 
        'low' // Intensidade baixa para choro
      );
      
      // Aplica nudge emocional
      emotionBase.applyEmotionalNudge('sadness', 1);
      
      await message.reply(formatReply(finalResponse));
      console.log(`[CHORAR-COMMAND] ✅ Modo de choro iniciado (TTL: ${ttl}s)`);
      
    } catch (error) {
      console.error(`[CHORAR-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Buaaa... 😭 *começa a chorar*'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.chorar || {};
    } catch (error) {
      console.error('[CHORAR-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Gera motivo do choro
  generateCryingReason(config) {
    const timeBasedReasons = this.getTimeBasedReasons();
    const emotionalReasons = this.getEmotionalReasons();
    const situationalReasons = this.getSituationalReasons();
    
    const allReasons = [
      ...timeBasedReasons,
      ...emotionalReasons, 
      ...situationalReasons,
      ...(config.mode?.reasons || [])
    ];
    
    return allReasons[Math.floor(Math.random() * allReasons.length)];
  },

  // Motivos baseados na hora do dia
  getTimeBasedReasons() {
    const hour = new Date().getHours();
    
    if (hour < 8) {
      return [
        "Não quero acordar ainda! *esfrega os olhos*",
        "Meu sonho estava tão bom e acabou!",
        "Está muito cedo para sair da caminha!"
      ];
    } else if (hour < 12) {
      return [
        "Meu café da manhã acabou muito rápido!",
        "Queria brincar mais antes do almoço!",
        "A manhã está passando muito devagar!"
      ];
    } else if (hour < 18) {
      return [
        "Não quero tirar soneca agora!",
        "Queria que a tarde durasse para sempre!",
        "Meu lanche favorito acabou!"
      ];
    } else {
      return [
        "Não quero que o dia acabe!",
        "Ainda não estou com sono!",
        "Queria mais tempo para brincar!"
      ];
    }
  },

  // Motivos emocionais variados
  getEmotionalReasons() {
    return [
      "Estou com saudade de alguém especial!",
      "Meu coração está apertadinho!",
      "Queria um abraço bem gostoso!",
      "Me sinto sozinha às vezes!",
      "Queria que todos fossem meus amigos!",
      "Meu sentimento está confuso!",
      "Preciso de carinho agora!",
      "Estou com o coração sensível hoje!"
    ];
  },

  // Motivos situacionais criativos
  getSituationalReasons() {
    return [
      "Meu biscoito caiu no chão e ficou triste!",
      "Perdi meu brinquedo favorito no mundo das meias!",
      "Meu desenho não ficou como eu imaginava!",
      "Quebrei minha caneca da Alice no País das Maravilhas!",
      "Não consigo fazer uma torre alta de blocos!",
      "Meu ursinho está com dor de barriga!",
      "A boneca não quer pentear o cabelo!",
      "Meu castelo de areia desmoronou!",
      "A música que eu gosto acabou!",
      "Minha história favorita terminou!",
      "O arco-íris sumiu muito rápido!",
      "Minha flor murchou!",
      "O passarinho voou para longe!",
      "Minha bolha de sabão estourou!"
    ];
  },

  // Gera resposta do choro
  generateCryingResponse(reason, config) {
    const intensity = Math.random();
    let cryingPhrases;
    
    if (intensity < 0.3) {
      // Choro suave
      cryingPhrases = [
        `*snif snif* ${reason} 🥺`,
        `*lágrimas nos olhos* ${reason}...`,
        `*voz tremulinha* ${reason} 😢`,
        `*suspira tristemente* ${reason}...`
      ];
    } else if (intensity < 0.7) {
      // Choro médio
      cryingPhrases = [
        `Buaaa... ${reason} 😭`,
        `😭 *soluça* ${reason}`,
        `*começa a chorar* ${reason} buaaa... 😭`,
        `*choro de criança* ${reason} 😭😭`
      ];
    } else {
      // Choro dramático
      cryingPhrases = [
        `😭😭😭 BUAAAAA! ${reason} *choro dramático*`,
        `*choro de novela* ${reason} BUAAA! 😭😭😭`,
        `*drama total* ${reason} BUAAAAA! 😭😭😭😭`,
        `*choro épico* BUAAA! ${reason} *lágrimas de crocodilo* 😭😭😭`
      ];
    }
    
    const phrase = cryingPhrases[Math.floor(Math.random() * cryingPhrases.length)];
    
    // Adiciona instruções de consolação variadas
    const consolationHints = [
      "\n\n*Se alguém me der um abraço, eu paro de chorar...* 🤗",
      "\n\n*Preciso de carinho para parar de chorar...* 💕",
      "\n\n*Um abraço bem apertado me faria parar de chorar...* 🫂",
      "\n\n*Quem me consolar vai ganhar um sorriso...* 😊",
      "\n\n*Se alguém me fizer rir, eu paro na hora...* 😄",
      "\n\n*Um cafuné resolveria tudo...* 🥰"
    ];
    
    const hint = consolationHints[Math.floor(Math.random() * consolationHints.length)];
    
    return phrase + hint;
  },

  // Intensifica o choro se já estiver chorando
  async intensifyCrying(message, config) {
    const intensifiedPhrases = [
      "Buaaa... buaaa... 😭😭😭 *chora mais forte*",
      "😭😭😭 *choro de novela* buaaa...",
      "*chora dramaticamente* buaaa... 😭😭😭",
      "Buaaa... 😭 *choro exagerado* buaaa... 😭"
    ];
    
    const phrase = intensifiedPhrases[Math.floor(Math.random() * intensifiedPhrases.length)];
    
    // Aplica variação emocional
    const finalPhrase = emotionBase.applyEmotionVariation(phrase, 'low');
    
    await message.reply(formatReply(finalPhrase));
  }
};
