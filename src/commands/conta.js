// src/commands/conta.js - Comando unificado n!conta (CONSOLIDADO)
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import storyTeller from '../modules/storyTeller.js';
import emotionBase from '../modules/emotionBase.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'conta',
  description: 'Comando unificado para histórias da Alice',
  category: 'historias',
  aliases: ['conta', 'story', 'dia', 'fantasia', 'historinha', 'fábula', 'fabula'],
  
  async execute(message, client) {
    console.log(`[CONTA-COMMAND] 📖 Executando comando conta para ${message.author.username}`);

    try {
      const args = message.content.split(' ').slice(1);
      const storyType = args[0]?.toLowerCase() || 'dia';

      switch (storyType) {
        case 'dia':
        case 'day':
        case 'daily':
          await this.tellDailyStory(message);
          break;

        case 'fantasia':
        case 'fantasy':
        case 'faz-de-conta':
          await this.tellFantasyStory(message);
          break;

        case 'historinha':
        case 'fábula':
        case 'fabula':
        case 'fable':
          await this.tellFableStory(message);
          break;

        case 'aventura':
        case 'adventure':
          await this.tellAdventureStory(message);
          break;

        default:
          await this.tellDailyStory(message);
      }
    } catch (error) {
      console.error(`[CONTA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Vamos criar uma história especial juntos! 📚✨'));
    }
  },

  // Conta algo do dia
  async tellDailyStory(message) {
    console.log(`[CONTA-DAILY] 📅 Contando história do dia`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Verifica se está aguardando slot-filling
      const waitingForSlot = await modeManager.isWaitingForSlotFilling(guildId, channelId, userId);
      
      if (waitingForSlot) {
        console.log(`[CONTA-DAILY] 📝 Processando resposta do slot-filling`);
        await this.processSlotFillingResponse(message, waitingForSlot, config);
        return;
      }
      
      // Gera história do dia
      await this.generateDailyStory(message, config);
      
    } catch (error) {
      console.error(`[CONTA-DAILY] 💥 Erro:`, error.message);
      await message.reply(formatReply('Hoje foi um dia especial! Vou te contar tudo que aconteceu... 🌅✨'));
    }
  },

  // Conta história de fantasia
  async tellFantasyStory(message) {
    console.log(`[CONTA-FANTASY] 🎭 Contando história de fantasia`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const config = this.loadCommandConfig();
      
      // Verifica se está aguardando slot-filling
      const waitingForSlot = await modeManager.isWaitingForSlotFilling(guildId, channelId, userId);
      
      if (waitingForSlot) {
        await this.processSlotFillingResponse(message, waitingForSlot, config);
        return;
      }
      
      // Verifica se já está em modo fantasia
      const existingMode = await modeManager.isInMode(guildId, channelId, userId, 'fantasy');
      
      if (existingMode.active) {
        await this.continueFantasyMode(message, existingMode, config);
        return;
      }
      
      // Inicia modo fantasia
      await this.startFantasyMode(message, config);
      
    } catch (error) {
      console.error(`[CONTA-FANTASY] 💥 Erro:`, error.message);
      await message.reply(formatReply('Vamos brincar de faz de conta! Que aventura você quer viver? 🎪✨'));
    }
  },

  // Conta fábula
  async tellFableStory(message) {
    console.log(`[CONTA-FABLE] 📚 Contando fábula`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const config = this.loadCommandConfig();
      
      // Verifica se está aguardando slot-filling
      const waitingForSlot = await modeManager.isWaitingForSlotFilling(guildId, channelId, userId);
      
      if (waitingForSlot) {
        await this.processSlotFillingResponse(message, waitingForSlot, config);
        return;
      }
      
      // Verifica se deve usar slot-filling
      const useSlotFilling = config.slotFilling?.enabled !== false;
      
      if (useSlotFilling) {
        await this.startSlotFilling(message, config);
        return;
      }
      
      // Gera fábula diretamente
      await this.generateFableDirectly(message, config);
      
    } catch (error) {
      console.error(`[CONTA-FABLE] 💥 Erro:`, error.message);
      await message.reply(formatReply('Era uma vez um animal muito especial que ensinou uma lição importante sobre amizade! 🐰💕'));
    }
  },

  // Conta aventura
  async tellAdventureStory(message) {
    console.log(`[CONTA-ADVENTURE] ⚔️ Contando aventura`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      const config = this.loadCommandConfig();
      
      // Gera aventura épica
      await this.generateAdventureStory(message, config);
      
    } catch (error) {
      console.error(`[CONTA-ADVENTURE] 💥 Erro:`, error.message);
      await message.reply(formatReply('Uma grande aventura nos espera! Vamos embarcar nesta jornada épica! ⚔️🗡️'));
    }
  },

  // Gera história do dia
  async generateDailyStory(message, config) {
    const dailyStories = [
      "Hoje acordei pensando em você! 🌅 Sonhei que estávamos brincando no parque e você me ensinava a fazer bolhas de sabão!",
      "Que dia lindo! ☀️ Passei a manhã observando os passarinhos da janela e pensando em como é bom ter você como amigo!",
      "Hoje aprendi uma coisa nova! 📚 Descobri que quando sorrimos, nosso coração fica mais quentinho! Você sabia disso?",
      "Que dia especial! 🌈 Vi um arco-íris pela janela e pensei: 'Que lindo! Vou contar para meu amigo!'",
      "Hoje foi um dia de descobertas! 🔍 Encontrei uma florzinha crescendo no vaso e fiquei muito feliz!",
      "Que dia cheio de alegria! 🎉 Passei horas brincando com meus brinquedos e imaginando você aqui comigo!",
      "Hoje acordei com uma vontade enorme de te dar um abraço! 🤗 Que dia perfeito para espalhar carinho!",
      "Que dia mágico! ✨ Vi uma estrela cadente e fiz um pedido especial: que você seja sempre muito feliz!",
      "Hoje foi um dia de aprendizado! 🧠 Descobri que quando ajudamos alguém, ficamos ainda mais felizes!",
      "Que dia cheio de amor! 💕 Passei o dia pensando em todas as coisas boas que você me ensinou!"
    ];
    
    const randomStory = dailyStories[Math.floor(Math.random() * dailyStories.length)];
    const finalStory = emotionBase.applyEmotionVariation(randomStory, emotionBase.getIntensityByMood());
    
    await message.reply(formatReply(finalStory));
  },

  // Gera história de fantasia
  async generateFantasyStory(message, config) {
    const fantasyStories = [
      "Era uma vez um reino mágico onde vivia uma princesa muito especial! 👑 Ela tinha o poder de fazer todos sorrirem com sua gentileza!",
      "Em uma floresta encantada, havia uma casinha feita de doces! 🍭 Quem morava lá sempre compartilhava seus doces com os amigos!",
      "Era uma vez um dragão muito gentil que cuspia flores ao invés de fogo! 🌸 Ele protegia todos os animais da floresta!",
      "Em um castelo nas nuvens, vivia uma fada que transformava tristeza em sorrisos! ✨ Ela voava pelo mundo espalhando alegria!",
      "Era uma vez um unicórnio que tinha o poder de fazer os sonhos se tornarem realidade! 🦄 Ele ajudava todas as crianças!",
      "Em uma cidade submarina, vivia uma sereia que cantava canções de amizade! 🧜‍♀️ Todos os peixes dançavam quando ela cantava!",
      "Era uma vez um mago que criava poções de felicidade! 🧙‍♂️ Ele distribuía suas poções para todos que precisavam!",
      "Em uma montanha gelada, vivia um yeti muito carinhoso! 🧸 Ele abraçava todos os viajantes perdidos!",
      "Era uma vez uma árvore falante que contava histórias para todas as crianças! 🌳 Suas folhas brilhavam quando ela falava!",
      "Em uma ilha tropical, vivia um papagaio que repetia apenas palavras de amor! 🦜 Ele ensinava todos os outros pássaros!"
    ];
    
    const randomStory = fantasyStories[Math.floor(Math.random() * fantasyStories.length)];
    const finalStory = emotionBase.applyEmotionVariation(randomStory, emotionBase.getIntensityByMood());
    
    await message.reply(formatReply(finalStory));
  },

  // Gera fábula
  async generateFableStory(message, config) {
    const fables = [
      "Era uma vez uma lebre e uma tartaruga que eram melhores amigas! 🐰🐢 A lebre ensinou a tartaruga a correr rápido, e a tartaruga ensinou a lebre a ser paciente!",
      "Era uma vez um leão que tinha medo de rugir! 🦁 Um pequeno rato o ensinou que a verdadeira força vem do coração, não dos músculos!",
      "Era uma vez um pássaro que não sabia voar! 🐦 Uma borboleta o ensinou que todos temos nossos próprios talentos especiais!",
      "Era uma vez um peixe que queria voar! 🐠 Um pássaro o ensinou que é melhor ser feliz sendo quem somos!",
      "Era uma vez um elefante que tinha medo de barulho! 🐘 Um pequeno grilo o ensinou que os sons mais suaves são os mais bonitos!",
      "Era uma vez uma girafa que se sentia diferente! 🦒 Um grupo de animais a ensinou que ser diferente é ser especial!",
      "Era uma vez um macaco que não sabia brincar! 🐒 Uma criança o ensinou que brincar é a melhor forma de aprender!",
      "Era uma vez um urso que não sabia dançar! 🐻 Uma abelha o ensinou que cada um tem seu próprio ritmo!",
      "Era uma vez um coelho que tinha medo do escuro! 🐰 Uma estrela o ensinou que a luz sempre vence a escuridão!",
      "Era uma vez um gato que não sabia miar! 🐱 Um passarinho o ensinou que cada um tem sua própria voz!"
    ];
    
    const randomFable = fables[Math.floor(Math.random() * fables.length)];
    const finalFable = emotionBase.applyEmotionVariation(randomFable, emotionBase.getIntensityByMood());
    
    await message.reply(formatReply(finalFable));
  },

  // Gera aventura épica
  async generateAdventureStory(message, config) {
    const adventures = [
      "Em uma terra distante, um jovem herói partiu em uma jornada para salvar o reino! ⚔️ Ele descobriu que sua maior força era a amizade!",
      "Em um navio pirata, uma jovem capitã navegou pelos sete mares! 🏴‍☠️ Ela descobriu que o maior tesouro é ajudar os outros!",
      "Em uma montanha misteriosa, um explorador escalou até o topo! 🏔️ Ele descobriu que a vista mais bonita é a do coração!",
      "Em uma floresta sombria, uma jovem aventureira encontrou uma luz! 🌟 Ela descobriu que a luz mais forte vem de dentro!",
      "Em um deserto escaldante, um viajante encontrou um oásis! 🏜️ Ele descobriu que a água mais doce é a da amizade!",
      "Em uma caverna profunda, um explorador encontrou cristais brilhantes! 💎 Ele descobriu que a maior beleza está no coração!",
      "Em uma ilha perdida, um náufrago encontrou outros sobreviventes! 🏝️ Ele descobriu que juntos somos mais fortes!",
      "Em uma cidade antiga, um arqueólogo encontrou um tesouro! 🏛️ Ele descobriu que o maior tesouro é o conhecimento!",
      "Em uma galáxia distante, um astronauta explorou novos mundos! 🚀 Ele descobriu que o universo é cheio de possibilidades!",
      "Em uma dimensão mágica, um mago jovem aprendeu feitiços! 🧙‍♂️ Ele descobriu que a magia mais poderosa é o amor!"
    ];
    
    const randomAdventure = adventures[Math.floor(Math.random() * adventures.length)];
    const finalAdventure = emotionBase.applyEmotionVariation(randomAdventure, emotionBase.getIntensityByMood());
    
    await message.reply(formatReply(finalAdventure));
  },

  // Processa resposta do slot-filling
  async processSlotFillingResponse(message, waitingForSlot, config) {
    // Implementação do slot-filling
    console.log(`[CONTA-SLOT] Processando resposta: ${message.content}`);
    await message.reply(formatReply('Obrigada pela resposta! Vou continuar a história... 📖✨'));
  },

  // Continua modo fantasia
  async continueFantasyMode(message, existingMode, config) {
    console.log(`[CONTA-FANTASY] Continuando modo fantasia`);
    await message.reply(formatReply('Vamos continuar nossa aventura mágica! 🎭✨'));
  },

  // Inicia modo fantasia
  async startFantasyMode(message, config) {
    console.log(`[CONTA-FANTASY] Iniciando modo fantasia`);
    await this.generateFantasyStory(message, config);
  },

  // Inicia slot-filling
  async startSlotFilling(message, config) {
    console.log(`[CONTA-SLOT] Iniciando slot-filling`);
    await message.reply(formatReply('Vou te fazer algumas perguntas para criar uma história especial! ❓✨'));
  },

  // Gera fábula diretamente
  async generateFableDirectly(message, config) {
    await this.generateFableStory(message, config);
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.conta || {};
    } catch (error) {
      console.error('[CONTA-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  }
};