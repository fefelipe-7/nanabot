// src/commands/boneca/BonecaManager.js - Gerenciador principal do modo boneca
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import emotionBase from '../modules/emotionBase.js';
import { EmbedBuilder } from 'discord.js';
import StageHandler from './StageHandler.js';
import ActivityHandler from './ActivityHandler.js';

class BonecaManager {
  static async startBonecaMode(message) {
    console.log(`[BONECA-START] 🎀 Iniciando modo boneca`);
    
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;

    // Cria sessão de boneca
    const bonecaSession = {
      stage: 'banho',
      completedStages: [],
      choices: {},
      startTime: new Date().toISOString(),
      activities: [],
      currentActivity: null
    };

    // Salva no modeManager
    await modeManager.startMode(guildId, channelId, userId, 'boneca', bonecaSession, 30 * 60 * 1000); // 30 minutos

    // Mensagem de boas-vindas
    const welcomeMessages = [
      "Eeeii, mamãe! 💕 Eu quero brincar de bonequinha com vocêuuh!",
      "Oiii! 🎀 Vamos brincar de boneca juntas? Eu preciso da sua ajuda!",
      "Hihi, que legal! 💖 Vamos cuidar da nossa bonequinha especial!",
      "Ebaaa! 🧸 Finalmente alguém quer brincar de boneca comigo!"
    ];

    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle('🎀 Modo Boneca Ativado!')
      .setDescription(`${randomWelcome}\n\nHihi, vou precisar de ajuda... primeiro a gente dá um banhinho nela, né? 🚿`)
      .addFields(
        { name: '🚿 Primeira Etapa', value: 'Banho da bonequinha', inline: true },
        { name: '🌸 Escolha', value: 'Qual cheirinho de sabonete?', inline: true },
        { name: '💬 Comando', value: '`n!banho [sabonete]`', inline: true }
      )
      .setFooter({ text: '💕 Use os comandos para cuidar da bonequinha!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
    
    // Aplica nudging emocional
    emotionBase.applyEmotionalNudge('joy', 3);
  }

  static async continueBonecaMode(message, existingMode) {
    console.log(`[BONECA-CONTINUE] 🎀 Continuando modo boneca`);
    
    const session = existingMode.data;
    const currentStage = session.stage;

    if (currentStage === 'atividades') {
      await ActivityHandler.showActivitiesMenu(message, session);
    } else {
      await StageHandler.showCurrentStage(message, session);
    }
  }

  static async processStageChoice(message, stage, choice) {
    console.log(`[BONECA-CHOICE] 🎀 Processando escolha: ${stage} - ${choice}`);
    
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;

    const session = await modeManager.getModeData(guildId, channelId, userId, 'boneca');
    
    if (!session || session.stage !== stage) {
      await message.reply(formatReply('Ops! Parece que você está em uma etapa diferente... 😅'));
      return;
    }

    // Processa a escolha usando StageHandler
    await StageHandler.processChoice(message, stage, choice, session);
  }

  static async processActivity(message, activity) {
    console.log(`[BONECA-ACTIVITY] 🎀 Processando atividade: ${activity}`);
    
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;

    const session = await modeManager.getModeData(guildId, channelId, userId, 'boneca');
    
    if (!session || session.stage !== 'atividades') {
      await message.reply(formatReply('Ops! Parece que você não está no menu de atividades... 😅'));
      return;
    }

    // Processa a atividade usando ActivityHandler
    await ActivityHandler.processActivity(message, activity, session);
  }

  static async endBonecaMode(message) {
    console.log(`[BONECA-END] 🎀 Finalizando modo boneca`);
    
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;

    const session = await modeManager.getModeData(guildId, channelId, userId, 'boneca');
    
    if (session) {
      const embed = new EmbedBuilder()
        .setColor('#ff69b4')
        .setTitle('😴 Bonequinha Guardada!')
        .setDescription('Awwww, já acabou? 😢\n\nMas foi tão divertido brincar de boneca com você! A bonequinha tá toda feliz e cansadinha... 💕\n\nObrigada por brincar comigo, mamãe! Até a próxima! 🎀')
        .addFields(
          { name: '⏰ Duração', value: this.calculateDuration(session.startTime), inline: true },
          { name: '🎯 Etapas Completas', value: session.completedStages.length.toString(), inline: true },
          { name: '🎪 Atividades', value: session.activities.length.toString(), inline: true }
        )
        .setFooter({ text: '💕 Obrigada por brincar comigo!' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }

    // Remove modo
    await modeManager.endMode(guildId, channelId, userId, 'boneca');
    
    // Aplica nudging emocional
    emotionBase.applyEmotionalNudge('love', 2);
  }

  static calculateDuration(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} minutos`;
  }

  static getStageInfo(stage) {
    const stages = {
      banho: { title: '🚿 Banho da Bonequinha', description: 'Escolher sabonete', command: 'banho' },
      comidinha: { title: '🍽️ Alimentar a Bonequinha', description: 'Escolher comida', command: 'comidinha' },
      roupinha: { title: '👗 Vestir a Bonequinha', description: 'Escolher roupa', command: 'roupinha' },
      penteado: { title: '💇‍♀️ Pentear a Bonequinha', description: 'Escolher penteado', command: 'penteado' },
      sapato: { title: '👟 Calçar a Bonequinha', description: 'Escolher sapato', command: 'sapato' },
      brinquedo: { title: '🧸 Brinquedo da Bonequinha', description: 'Escolher brinquedo', command: 'brinquedo' }
    };
    return stages[stage] || { title: '🎀 Boneca', description: 'Brincar', command: 'boneca' };
  }

  static getStageNumber(stage) {
    const stages = ['banho', 'comidinha', 'roupinha', 'penteado', 'sapato', 'brinquedo'];
    return stages.indexOf(stage) + 1;
  }

  static getNextStage(stage) {
    const stages = ['banho', 'comidinha', 'roupinha', 'penteado', 'sapato', 'brinquedo'];
    const currentIndex = stages.indexOf(stage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : 'atividades';
  }
}

export default BonecaManager;
