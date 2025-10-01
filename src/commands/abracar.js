// src/commands/abracar.js - Comando unificado n!abracar (SUPER APRIMORADO)
import { formatReply } from '../utils/formatReply.js';
import affectionService from '../modules/affectionService.js';
import emotionBase from '../modules/emotionBase.js';
import modeManager from '../modules/modeManager.js';
import cooldownManager from '../modules/cooldownManager.js';
import contextIntelligence from '../modules/contextIntelligence.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'abracar',
  description: 'A Alice te dá um abraço carinhoso com diferentes intensidades!',
  category: 'afeto',
  aliases: ['abraço', 'abraçar', 'hug'],
  
  async execute(message, client) {
    console.log(`[ABRACAR-COMMAND] 🤗 Executando comando abraçar para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Verifica se está consolando alguém que está chorando
      const consolationResult = await modeManager.checkConsolationCommand(guildId, channelId, userId, 'abracar');
      
      if (consolationResult) {
        console.log(`[ABRACAR-COMMAND] 🆘 Abraço de consolação detectado`);
        await this.handleConsolation(message);
        return;
      }
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Incrementa contador de abraços
      await affectionService.incrementHugs(guildId, userId);
      await affectionService.incrementLoveScore(guildId, userId, 2);
      
      // Aplica nudge emocional
      emotionBase.applyEmotionalNudge('hug', 1);
      
      // Analisa contexto do usuário
      const userContext = await contextIntelligence.analyzeUserContext(guildId, userId, channelId);
      console.log(`[ABRACAR-COMMAND] 🧠 Contexto analisado: ${userContext.affectionLevelName} (${userContext.relationshipStatus})`);
      
      // Gera abraço personalizado
      const hugResponse = await this.generateHugResponse(config, guildId, userId, userContext);
      
      // Aplica variação emocional
      const finalResponse = emotionBase.applyEmotionVariation(
        hugResponse, 
        emotionBase.getIntensityByMood()
      );
      
      await message.reply(formatReply(finalResponse));
      console.log(`[ABRACAR-COMMAND] ✅ Resposta abraço enviada com sucesso`);
      
    } catch (error) {
      console.error(`[ABRACAR-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Vem cá, deixa eu te dar um abraço bem apertado! 🤗'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.abracar || {};
    } catch (error) {
      console.error('[ABRACAR-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Gera resposta do abraço SUPER APRIMORADA
  async generateHugResponse(config, guildId, userId, userContext) {
    try {
      // Intensidades expandidas com situações especiais
      const intensities = config.intensities || {
        leve: { 
          emojis: ['🤗', '💕'], 
          phrases: [
            'Um abraço bem carinhoso!',
            'Abraço fofinho pra você!',
            'Deixa eu te dar um abraço suave!'
          ],
          situations: ['normal', 'triste', 'cansado']
        },
        apertado: { 
          emojis: ['🤗', '✨', '💞'], 
          phrases: [
            'Abraço bem apertado!',
            'Aperta forte! Não solta!',
            'Abraço de urso! 🐻'
          ],
          situations: ['feliz', 'emocionado', 'comemorando']
        },
        correndo: { 
          emojis: ['🏃‍♀️', '🤗', '💫'], 
          phrases: [
            'Correndo pra te abraçar!',
            'Vem cá! Correndo com os braços abertos!',
            'Abraço em movimento!'
          ],
          situations: ['animado', 'energético', 'brincalhão']
        },
        especial: { 
          emojis: ['🌟', '🤗', '💖', '✨'], 
          phrases: [
            'Abraço especial só pra você!',
            'Abraço de melhor amigo!',
            'Abraço mágico! ✨'
          ],
          situations: ['melhor_amigo', 'aniversario', 'especial']
        },
        grupo: { 
          emojis: ['👥', '🤗', '💕'], 
          phrases: [
            'Abraço em grupo! Todo mundo junto!',
            'Abraço coletivo! Vem todo mundo!',
            'Abraço de família! 👨‍👩‍👧‍👦'
          ],
          situations: ['grupo', 'familia', 'comunidade']
        },
        consolo: { 
          emojis: ['🤗', '😊', '💙'], 
          phrases: [
            'Abraço de consolo! Vai ficar tudo bem!',
            'Abraço pra te confortar!',
            'Abraço que cura tudo!'
          ],
          situations: ['triste', 'preocupado', 'chorando']
        }
      };
      
      // Seleciona intensidade baseada no contexto
      const selectedIntensity = this.selectIntensityByContext(userContext, intensities);
      const intensity = intensities[selectedIntensity];
      
      // Seleciona frase baseada na situação
      const phrases = intensity.phrases;
      const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      // Adiciona emojis
      const emojis = intensity.emojis.join(' ');
      
      // Personaliza baseado no contexto
      let response = this.personalizeHugResponse(selectedPhrase, userContext);
      response += ` ${emojis}`;
      
      // Adiciona elementos especiais baseados no contexto
      response += this.addSpecialElements(userContext, config);
      
      // Verifica se deve mostrar estatísticas
      if (config.counters?.showStats) {
        const stats = await affectionService.getUserStats(guildId, userId);
        if (stats.hugs_given > 0) {
          response += `\n\n*Esse já é o seu ${stats.hugs_given}º abraço do diaaa!* 💕`;
        }
      }
      
      return response;
      
    } catch (error) {
      console.error('[ABRACAR-COMMAND] Erro ao gerar resposta:', error.message);
      return 'Vem cá, deixa eu te dar um abraço bem apertado! 🤗 *abraça com muito carinho*';
    }
  },

  // Seleciona intensidade baseada no contexto
  selectIntensityByContext(userContext, intensities) {
    const { relationshipStatus, temporalContext, behaviorPatterns } = userContext;
    
    // Melhores amigos recebem abraços especiais
    if (relationshipStatus === 'best_friend') {
      return 'especial';
    }
    
    // Baseado no horário
    if (temporalContext.timeOfDay === 'morning') {
      return 'correndo'; // Energia matinal
    } else if (temporalContext.timeOfDay === 'night') {
      return 'leve'; // Calmo à noite
    }
    
    // Baseado no padrão de comportamento
    if (behaviorPatterns.interactionStyle === 'affectionate') {
      return 'apertado';
    } else if (behaviorPatterns.interactionStyle === 'reserved') {
      return 'leve';
    }
    
    // Baseado no nível de atividade
    if (behaviorPatterns.activityLevel === 'high') {
      return 'correndo';
    }
    
    // Seleção aleatória entre intensidades normais
    const normalIntensities = ['leve', 'apertado', 'correndo'];
    return normalIntensities[Math.floor(Math.random() * normalIntensities.length)];
  },

  // Personaliza resposta do abraço
  personalizeHugResponse(phrase, userContext) {
    const { relationshipStatus, temporalContext } = userContext;
    
    let personalized = phrase;
    
    // Personaliza baseado no relacionamento
    if (relationshipStatus === 'best_friend') {
      personalized = personalized.replace('abraço', 'abraço especial');
    } else if (relationshipStatus === 'close_friend') {
      personalized = personalized.replace('abraço', 'abraço carinhoso');
    }
    
    // Adiciona elementos temporais
    if (temporalContext.timeOfDay === 'morning') {
      personalized += ' Bom dia!';
    } else if (temporalContext.timeOfDay === 'night') {
      personalized += ' Boa noite!';
    }
    
    return personalized;
  },

  // Adiciona elementos especiais baseados no contexto
  addSpecialElements(userContext, config) {
    const { temporalContext, preferences, behaviorPatterns } = userContext;
    let elements = '';
    
    // Elementos temporais
    if (temporalContext.isWeekend) {
      elements += ' Fim de semana é pra abraçar mais!';
    }
    
    // Elementos baseados em preferências
    if (preferences.topics.includes('games')) {
      elements += ' Abraço de gamer! 🎮';
    }
    
    // Elementos baseados no comportamento
    if (behaviorPatterns.activityLevel === 'high') {
      elements += ' Você é muito ativo!';
    }
    
    return elements;
  },

  // Trata abraço de consolação
  async handleConsolation(message) {
    const consolationPhrases = [
      'Obrigada pelo abraço! Já me sinto melhor! 😊',
      'Você me consolou! Agora estou feliz de novo! ✨',
      'Que abraço gostoso! Parei de chorar! 💕',
      'Obrigada! Seu abraço é mágico! 🌟'
    ];
    
    const phrase = consolationPhrases[Math.floor(Math.random() * consolationPhrases.length)];
    await message.reply(formatReply(phrase));
  }
};
