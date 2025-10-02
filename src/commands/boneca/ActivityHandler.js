// src/commands/boneca/ActivityHandler.js - Manipulador das atividades extras
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import emotionBase from '../modules/emotionBase.js';
import { EmbedBuilder } from 'discord.js';
import BonecaManager from './BonecaManager.js';

class ActivityHandler {
  static async showActivitiesMenu(message, session) {
    console.log(`[ACTIVITY-HANDLER] 🎀 Mostrando menu de atividades`);
    
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;

    session.stage = 'atividades';
    await modeManager.updateModeData(guildId, channelId, userId, 'boneca', session);
    
    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle('🎪 Menu de Atividades da Bonequinha!')
      .setDescription('Olha só, pensei nessas opções para brincarmos:')
      .addFields(
        { name: '🧺 n!piquenique', value: 'Levo ela num piquenique fofo!', inline: true },
        { name: '🎭 n!teatrinho', value: 'Fazemos uma peça divertida!', inline: true },
        { name: '🎵 n!cantiga', value: 'Canto pra ela dormir', inline: true },
        { name: '🛝 n!passeio', value: 'Levar ela para passear', inline: true },
        { name: '📚 n!historia', value: 'Contar historinha para ela', inline: true },
        { name: '💃 n!dancinha', value: 'Fazer uma dancinha imaginária', inline: true },
        { name: '🌸 n!desfile', value: 'Mostrar os looks dela', inline: true },
        { name: '🏴‍☠️ n!tesouro', value: 'Brincar de caça ao tesouro', inline: true },
        { name: '😴 n!fim', value: 'Guardar a bonequinha para descansar', inline: true }
      )
      .setFooter({ text: '💕 Escolha uma atividade para continuar brincando!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  static async processActivity(message, activity, session) {
    console.log(`[ACTIVITY-HANDLER] 🎀 Processando atividade: ${activity}`);
    
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;

    // Adiciona atividade à sessão
    session.activities.push(activity);
    session.currentActivity = activity;

    // Gera resposta da atividade
    const response = await this.generateActivityResponse(activity, session);
    
    // Atualiza sessão
    await modeManager.updateModeData(guildId, channelId, userId, 'boneca', session);

    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setDescription(response)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Se não for fim, mostra opções de continuação
    if (activity !== 'fim') {
      setTimeout(() => this.showActivityContinuation(message, activity), 2000);
    } else {
      // Finaliza modo boneca
      setTimeout(() => BonecaManager.endBonecaMode(message), 2000);
    }
  }

  static async generateActivityResponse(activity, session) {
    const responses = {
      piquenique: [
        "Ebaaa, piqueniqueee! 🌳🍓\nEspalhei a toalhinha rosa no gramado, coloquei frutinhas e suquinho… e a bonequinha tá pulando de alegriaaa! Hihi 💕",
        "Que piquenique lindo! 🧺 A bonequinha tá toda feliz com as comidinhas!",
        "Hihi, piquenique é sempre divertido! 🌸 A bonequinha tá se divertindo muito!"
      ],
      teatrinho: [
        "Ebaaa, teatrinhooo! 🎭✨\nA bonequinha vai ser a princesa e eu vou ser a fada madrinha! Que história você quer que a gente conte?",
        "Que legal! 🎪 Vamos fazer uma peça super divertida com a bonequinha!",
        "Hihi, teatrinho é minha atividade favorita! 🎨 A bonequinha vai adorar!"
      ],
      cantiga: [
        "Aiii, cantiga de ninar! 🎵💤\nVou cantar uma musiquinha bem suave para a bonequinha dormir... 'Bonequinha de pano, dorme no meu colo...'",
        "Que doce! 🎶 A bonequinha tá ficando sonolenta com a cantiga!",
        "Hihi, cantar é tão gostoso! 🎤 A bonequinha tá toda relaxada!"
      ],
      passeio: [
        "Ebaaa, passeiooo! 🚶‍♀️✨\nVamos levar a bonequinha para conhecer lugares novos! Onde você quer que a gente vá?",
        "Que passeio divertido! 🌟 A bonequinha tá toda animada!",
        "Hihi, passear é sempre uma aventura! 🗺️ A bonequinha vai adorar!"
      ],
      historia: [
        "Era uma vez... 📚✨\nVou contar uma historinha especial para a bonequinha! Que tipo de história você quer?",
        "Que legal! 📖 A bonequinha tá toda atenta para ouvir a história!",
        "Hihi, contar histórias é tão divertido! 🎭 A bonequinha vai adorar!"
      ],
      dancinha: [
        "Ebaaa, dancinhaaa! 💃✨\nA bonequinha tá dançando junto comigo! Que música você quer que a gente dance?",
        "Que dancinha linda! 🎵 A bonequinha tá toda animada!",
        "Hihi, dançar é tão divertido! 🕺 A bonequinha tá se divertindo muito!"
      ],
      desfile: [
        "Ebaaa, desfile de modas! 👗✨\nA bonequinha vai mostrar todos os looks lindos que ela tem! Que roupa você quer que ela mostre primeiro?",
        "Que desfile elegante! 👠 A bonequinha tá toda fashion!",
        "Hihi, desfile é sempre divertido! 🌟 A bonequinha vai arrasar!"
      ],
      tesouro: [
        "Ebaaa, caça ao tesourooo! 🏴‍☠️✨\nVamos procurar um tesouro especial para a bonequinha! Onde você acha que está escondido?",
        "Que aventura emocionante! 🗺️ A bonequinha tá toda animada!",
        "Hihi, caça ao tesouro é sempre uma aventura! 💎 A bonequinha vai adorar!"
      ],
      fim: [
        "Awwww, já acabou? 😢\nMas foi tão divertido brincar de boneca com você! A bonequinha tá toda feliz e cansadinha...",
        "Que pena que acabou! 😔 Mas foi uma brincadeira muito legal!",
        "Hihi, foi tão gostoso brincar! 💕 A bonequinha vai dormir feliz!"
      ]
    };

    const activityResponses = responses[activity] || [`Que atividade legal: ${activity}! 💕`];
    return activityResponses[Math.floor(Math.random() * activityResponses.length)];
  }

  static async showActivityContinuation(message, activity) {
    const continuations = {
      piquenique: [
        "Você quer que seja num parquinho real 🛝 ou num lugar mágico cheio de fantasia? ✨\nManda: `n!parquinho` ou `n!magia`"
      ],
      teatrinho: [
        "Que personagem você quer ser na peça? 🎭\nManda: `n!princesa`, `n!principe` ou `n!fada`"
      ],
      cantiga: [
        "Quer que eu cante mais uma musiquinha? 🎵\nManda: `n!mais` ou `n!dormir`"
      ],
      passeio: [
        "Onde você quer levar a bonequinha? 🗺️\nManda: `n!parque`, `n!praia` ou `n!floresta`"
      ],
      historia: [
        "Que tipo de história você quer? 📚\nManda: `n!aventura`, `n!romance` ou `n!comedia`"
      ],
      dancinha: [
        "Que estilo de música você quer? 🎵\nManda: `n!samba`, `n!rock` ou `n!pop`"
      ],
      desfile: [
        "Que categoria de roupa você quer ver? 👗\nManda: `n!casual`, `n!elegante` ou `n!fantasia`"
      ],
      tesouro: [
        "Onde você acha que está o tesouro? 🗺️\nManda: `n!jardim`, `n!quarto` ou `n!cozinha`"
      ]
    };

    const continuation = continuations[activity];
    if (continuation) {
      await message.reply(formatReply(continuation[0]));
    }
  }
}

export default ActivityHandler;
