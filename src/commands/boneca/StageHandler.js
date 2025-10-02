// src/commands/boneca/StageHandler.js - Manipulador das etapas de cuidado
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import emotionBase from '../modules/emotionBase.js';
import variationEngine from '../modules/variationEngine.js';
import { EmbedBuilder } from 'discord.js';
import BonecaManager from './BonecaManager.js';
import ActivityHandler from './ActivityHandler.js';

class StageHandler {
  static async showCurrentStage(message, session) {
    const stageInfo = BonecaManager.getStageInfo(session.stage);
    
    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle(`🎀 ${stageInfo.title}`)
      .setDescription(stageInfo.description)
      .addFields(
        { name: '📝 Comando', value: `\`n!${stageInfo.command}\``, inline: true },
        { name: '🎯 Etapa', value: `${BonecaManager.getStageNumber(session.stage)}/6`, inline: true },
        { name: '✅ Completadas', value: session.completedStages.length.toString(), inline: true }
      )
      .setFooter({ text: '💕 Continue cuidando da bonequinha!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  static async processChoice(message, stage, choice, session) {
    console.log(`[STAGE-HANDLER] 🎀 Processando escolha: ${stage} - ${choice}`);
    
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;

    // Salva escolha
    session.choices[stage] = choice;
    
    // Gera resposta afetiva
    const response = await this.generateAffectiveResponse(stage, choice, session);
    
    // Avança para próxima etapa
    const nextStage = BonecaManager.getNextStage(stage);
    session.stage = nextStage;
    session.completedStages.push(stage);

    // Atualiza sessão
    await modeManager.updateModeData(guildId, channelId, userId, 'boneca', session);

    // Resposta com embed
    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setDescription(response)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Se completou todas as etapas, mostra menu de atividades
    if (session.completedStages.length >= 6) {
      setTimeout(() => ActivityHandler.showActivitiesMenu(message, session), 2000);
    }
  }

  static async generateAffectiveResponse(stage, choice, session) {
    const responses = {
      banho: [
        `Hmmmm cheirinho de ${choice} 🍓✨! A bonequinha ficou toda espumadinha, parece até uma nuvem fofinha, olhaaa! ☁️`,
        `Que delícia de ${choice}! 🧴 A bonequinha tá toda cheirosa e feliz!`,
        `Aiii, ${choice} é o meu favorito! 🌸 A bonequinha ficou linda no banho!`
      ],
      comidinha: [
        `${choice}aa! 🥞 Que delíciaaa! Ela comeu tudinho e até lambeu os dedinhos, nham nham!`,
        `Hmm, ${choice} é tão gostoso! 😋 A bonequinha tá com a barriguinha cheia!`,
        `Que bom que ela gosta de ${choice}! 🍽️ Ela comeu tudo e ficou satisfeita!`
      ],
      roupinha: [
        `Aiii, ${choice}! 🎀 Ficou tão lindaaa que parece uma princesinha de desenho animado!`,
        `Que lindo esse ${choice}! 👗 A bonequinha tá toda elegante!`,
        `Uau! ${choice} é perfeito para ela! ✨ Ficou uma gracinha!`
      ],
      penteado: [
        `${choice} bem fofas, ownnnn! 🥰 Agora ela balança quando anda, hihi!`,
        `Que penteado lindo! 💇‍♀️ A bonequinha tá toda arrumadinha!`,
        `Aiii, ${choice} é tão fofo! 💕 Ela ficou uma princesa!`
      ],
      sapato: [
        `UAUU ✨ ${choice}ee! Agora ela tá parecendo uma estrelinha que anda, toda cintilante! 🌟`,
        `Que sapatinho lindo! 👟 A bonequinha tá toda elegante!`,
        `Hihi, ${choice} é perfeito! 👠 Ela tá pronta para qualquer aventura!`
      ],
      brinquedo: [
        `Ahhh o ${choice} 🧸💕! Ele ficou grudadinho nela, já viraram melhores amigos!`,
        `Que brinquedo fofo! 🎈 A bonequinha tá toda feliz!`,
        `O ${choice} é perfeito! 🎪 Ela vai se divertir muito!`
      ]
    };

    const stageResponses = responses[stage] || [`Que legal escolher ${choice}! 💕`];
    const randomResponse = stageResponses[Math.floor(Math.random() * stageResponses.length)];

    // Adiciona transição para próxima etapa
    const nextStage = BonecaManager.getNextStage(stage);
    const nextStageInfo = BonecaManager.getStageInfo(nextStage);
    
    if (nextStage !== 'atividades') {
      return `${randomResponse}\n\nAgora que a bonequinha tá ${this.getStageDescription(stage)}, precisamos ${nextStageInfo.description.toLowerCase()}.\n\nManda: \`n!${nextStageInfo.command}\` ✨`;
    } else {
      return `${randomResponse}\n\nProntinho, mamãe! A bonequinha já tomou banho, comeu, se vestiu, arrumou o cabelo, colocou o sapato e escolheu seu brinquedo do dia! 🎀\n\nE agoraaa… vamos brincar com ela? 🤭`;
    }
  }

  static getStageDescription(stage) {
    const descriptions = {
      banho: 'limpinha e cheirosa',
      comidinha: 'alimentada e satisfeita',
      roupinha: 'vestida e elegante',
      penteado: 'penteadinha e arrumada',
      sapato: 'calçada e pronta',
      brinquedo: 'com seu brinquedo favorito'
    };
    return descriptions[stage] || 'cuidada';
  }
}

export default StageHandler;
